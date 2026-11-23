import {
    SECONDS_PER_DAY,
    ScheduleClock,
    indexAt,
    positionAt,
    videoEnd,
    volumeFor,
} from './schedule.mjs';

/*
 * Plays the daily schedule through an embedded video player and keeps it in step with the
 * server's clock.
 *
 * Everything outside this file is passed in, so it can be driven by tests:
 *
 *   player          { load(videoId), play(), pause(), seek(position), currentTime(),
 *                     isPaused(), setVolume(volume) }   — play() may return a promise
 *   fetchSchedule   () => Promise of the GET /api/v1/track response
 *   reportFailure   (track) => void, for videos that can't be played
 *   onChange        (state) => void, called whenever the current track or status changes
 *   nowMs           () => milliseconds, defaults to Date.now
 *   timers          { setTimeout, clearTimeout, setInterval, clearInterval }
 *
 * The host forwards the player's events to onReady(), onTimeUpdate(), onEnded() and onError().
 */

export const DEFAULTS = {
    tickMs: 1000,
    // No progress for this long: ask the player to play again.
    nudgeAfterMs: 6000,
    // Then reload the video at the scheduled position.
    reloadAfterMs: 15000,
    // Then give up. A video that never played is reported as broken; one that played and
    // then stalled is a network problem, so it's reloaded again instead.
    giveUpAfterMs: 30000,
    // How far the video may be from the scheduled position before it's moved back.
    driftToleranceSeconds: 4,
    driftCorrectionCooldownMs: 15000,
    // How close to the end of the video counts as the end (timeupdate isn't exact).
    endToleranceSeconds: 0.25,
    retryScheduleAfterMs: 5000,
    previousTrackCount: 5,
    baseVolume: 1.0,
};

// YouTube IFrame API errors that mean the video itself can't be played here.
// 2: bad id, 100: removed or private, 101 / 150: embedding not allowed.
const UNPLAYABLE_ERRORS = [2, 100, 101, 150];

export function trackKey(track) {
    return track ? `${track.track_id}@${track.secs_start}` : null;
}

export class RadioStation {
    constructor({ player, fetchSchedule, reportFailure = () => {}, onChange = () => {}, nowMs, timers, options } = {}) {
        this.player = player;
        this.fetchSchedule = fetchSchedule;
        this.reportFailure = reportFailure;
        this.onChange = onChange;
        this.nowMs = nowMs || (() => Date.now());
        this.timers = timers || {
            setTimeout: (fn, ms) => setTimeout(fn, ms),
            clearTimeout: (id) => clearTimeout(id),
            setInterval: (fn, ms) => setInterval(fn, ms),
            clearInterval: (id) => clearInterval(id),
        };
        this.options = Object.assign({}, DEFAULTS, options || {});

        this.started = false;
        this.loading = false;
        this.status = 'idle';
        this.clock = null;
        this.queue = [];            // [current, ...next], in play order
        this.previous = [];         // most recent first
        this.requestId = 0;
        this.date = undefined;

        this.loadedKey = null;      // track whose video is in the player
        this.pendingStart = false;  // waiting for the player to be ready
        this.finished = new Set();  // keys of tracks that played to the end
        this.failed = new Set();    // keys of tracks that couldn't be played
        this.reported = new Set();
        this.errorCounts = new Map();

        this.tickHandle = null;
        this.boundaryHandle = null;
        this.retryHandle = null;
        this.resetWatchdog();
    }

    // ---- Public API ------------------------------------------------------------------

    start() {
        if (this.started) {
            return this.loadingPromise || Promise.resolve();
        }
        this.started = true;
        this.tickHandle = this.timers.setInterval(() => this.tick(), this.options.tickMs);
        return this.refresh();
    }

    stop() {
        this.started = false;
        this.timers.clearInterval(this.tickHandle);
        this.clearBoundary();
        this.timers.clearTimeout(this.retryHandle);
        this.player.pause();
    }

    /** Fetches the schedule again (e.g. after the settings changed) and joins it. */
    refresh() {
        const id = ++this.requestId;
        this.loading = true;
        this.setStatus('loading');
        this.timers.clearTimeout(this.retryHandle);

        this.loadingPromise = Promise.resolve()
            .then(() => this.fetchSchedule())
            .then((data) => {
                if (id !== this.requestId || !this.started) {
                    return; // a newer request has replaced this one
                }
                this.loading = false;
                this.loadingPromise = null;
                if (!data || !data.current_track) {
                    this.queue = [];
                    this.setStatus('empty');
                    this.retryLater();
                    return;
                }
                if (data.date !== this.date) {
                    // Track keys repeat from day to day.
                    this.finished.clear();
                    this.failed.clear();
                    this.errorCounts.clear();
                    this.date = data.date;
                }
                this.clock = new ScheduleClock(data.current_seconds, this.nowMs);
                this.queue = [data.current_track].concat(data.next_tracks || []);
                this.previous = (data.previous_tracks || []).slice(0, this.options.previousTrackCount);
                this.sync();
            })
            .catch(() => {
                if (id !== this.requestId) {
                    return;
                }
                this.loading = false;
                this.loadingPromise = null;
                this.setStatus('error');
                this.retryLater();
            });
        return this.loadingPromise;
    }

    get currentTrack() {
        return this.queue[0] || null;
    }

    get nextTracks() {
        return this.queue.slice(1);
    }

    /**
     * Call from a user gesture (e.g. the play button) after the browser blocked autoplay.
     */
    resume() {
        this.watchdog.blocked = false;
        this.watchdog.lastProgressAt = this.nowMs();
        if (this.pendingStart) {
            this.startLoadedVideo();
        } else {
            this.play();
        }
    }

    /** Seconds since midnight on the server's clock, or null before the first schedule. */
    now() {
        return this.clock ? this.clock.seconds() : null;
    }

    // ---- Player events -----------------------------------------------------------------

    onReady() {
        if (this.pendingStart) {
            this.startLoadedVideo();
        }
    }

    onTimeUpdate() {
        const track = this.loadedTrack();
        // Until the new video has been started, time updates can still come from the old one.
        if (!track || this.pendingStart) {
            return;
        }
        const position = this.player.currentTime();
        if (position > this.watchdog.lastPosition + 0.05 || position < this.watchdog.lastPosition - 1) {
            if (position > this.watchdog.lastPosition) {
                this.watchdog.hasPlayed = true;
            }
            this.watchdog.lastPosition = position;
            this.watchdog.lastProgressAt = this.nowMs();
            this.watchdog.step = 0;
            if (this.status !== 'playing' && this.watchdog.hasPlayed) {
                this.setStatus('playing');
            }
        }
        if (position >= videoEnd(track) - this.options.endToleranceSeconds) {
            this.finishLoadedTrack();
        }
    }

    onEnded() {
        // Ignore an "ended" left over from the previous video: the new one hasn't played yet.
        if (this.loadedTrack() && this.watchdog.hasPlayed) {
            this.finishLoadedTrack();
        }
    }

    onError(code) {
        const track = this.loadedTrack();
        if (!track) {
            return;
        }
        const key = trackKey(track);
        this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
        if (UNPLAYABLE_ERRORS.includes(Number(code)) || this.errorCounts.get(key) >= 3) {
            this.failTrack(track, true);
        } else {
            this.reloadVideo(track, true);
        }
    }

    // ---- Following the schedule --------------------------------------------------------

    /** Makes the player match whatever the schedule says should be heard right now. */
    sync() {
        if (!this.started || this.loading || !this.clock) {
            return;
        }
        this.clearBoundary();
        const now = this.clock.seconds();

        // The schedule is per day; after midnight the server has a new one.
        if (now >= SECONDS_PER_DAY) {
            this.refresh();
            return;
        }

        const index = indexAt(this.queue, now);
        if (index === -1) {
            if (this.queue.length === 0 || now >= this.queue[this.queue.length - 1].secs_end) {
                this.refresh(); // ran out of tracks
            } else {
                this.silence();
                this.waitUntil(this.queue[0].secs_start);
            }
            return;
        }

        if (index > 0) {
            const passed = this.queue.slice(0, index).reverse();
            this.previous = passed.concat(this.previous).slice(0, this.options.previousTrackCount);
            this.queue = this.queue.slice(index);
            this.emit();
        }

        const track = this.queue[0];
        const key = trackKey(track);
        const position = positionAt(track, now);

        if (this.failed.has(key) || this.finished.has(key) || position === null) {
            // Nothing to hear until the next slot: a broken video, one that has already
            // played to the end, or the silence after it.
            this.silence();
            this.waitUntil(track.secs_end);
            return;
        }

        if (!track.youtube_id) {
            this.failTrack(track, false);
            return;
        }

        if (this.loadedKey !== key) {
            this.loadVideo(track);
        } else if (!this.pendingStart) {
            this.keepInStep(track, position);
        }
        this.waitUntil(track.secs_end);
    }

    tick() {
        if (!this.started || this.loading || !this.clock) {
            return;
        }
        const now = this.clock.seconds();
        const current = this.currentTrack;
        if (now >= SECONDS_PER_DAY || !current || now >= current.secs_end) {
            this.sync();
            return;
        }

        const track = this.loadedTrack();
        if (!track || trackKey(track) !== trackKey(current) || this.failed.has(trackKey(track)) || this.finished.has(trackKey(track))) {
            return;
        }

        if (this.watchdog.blocked) {
            // Waiting for the listener to press play; that's not the video's fault.
            this.watchdog.lastProgressAt = this.nowMs();
            return;
        }

        const stalledFor = this.nowMs() - this.watchdog.lastProgressAt;
        const o = this.options;

        if (stalledFor >= o.giveUpAfterMs) {
            if (this.watchdog.hasPlayed) {
                this.reloadVideo(track); // network trouble; keep trying
            } else {
                this.failTrack(track, true);
            }
        } else if (stalledFor >= o.reloadAfterMs && this.watchdog.step < 2) {
            this.watchdog.step = 2;
            this.reloadVideo(track, true);
        } else if (stalledFor >= o.nudgeAfterMs && this.watchdog.step < 1) {
            this.watchdog.step = 1;
            this.setStatus('buffering');
            if (this.pendingStart) {
                // The player never said it was ready; try starting it anyway.
                this.startLoadedVideo();
            } else {
                this.play();
            }
        } else if (this.watchdog.hasPlayed && this.player.isPaused()) {
            // It's a radio: if something paused the video, carry on.
            this.play();
        } else if (this.watchdog.hasPlayed) {
            const expected = positionAt(track, now);
            if (expected !== null) {
                this.keepInStep(track, expected);
            }
        }
    }

    // ---- Internals ---------------------------------------------------------------------

    loadedTrack() {
        return this.queue.find((t) => trackKey(t) === this.loadedKey) || null;
    }

    loadVideo(track) {
        this.loadedKey = trackKey(track);
        this.pendingStart = true;
        this.resetWatchdog();
        this.setStatus('loading-track');
        this.emit();
        this.player.load(track.youtube_id);
        this.player.setVolume(volumeFor(track, this.options.baseVolume));
    }

    /**
     * Loads the same video again at the scheduled position. Whether it has played before is
     * kept, so a video that worked and then stalled isn't reported as broken. With
     * keepTimer the watchdog carries on counting from the last progress, so a reload doesn't
     * push back the time limit.
     */
    reloadVideo(track, keepTimer = false) {
        const previous = this.watchdog;
        this.loadedKey = null;
        this.loadVideo(track);
        this.watchdog.hasPlayed = previous.hasPlayed;
        if (keepTimer) {
            this.watchdog.step = previous.step;
            this.watchdog.lastProgressAt = previous.lastProgressAt;
        }
    }

    startLoadedVideo() {
        const track = this.loadedTrack();
        this.pendingStart = false;
        if (!track) {
            return;
        }
        const position = positionAt(track, this.clock.seconds());
        if (position === null) {
            this.sync();
            return;
        }
        this.player.seek(position);
        this.watchdog.lastPosition = position;
        this.watchdog.lastCorrectionAt = this.nowMs();
        this.play();
    }

    keepInStep(track, expected) {
        const position = this.player.currentTime();
        const o = this.options;
        if (Math.abs(position - expected) > o.driftToleranceSeconds
            && this.nowMs() - this.watchdog.lastCorrectionAt >= o.driftCorrectionCooldownMs) {
            this.watchdog.lastCorrectionAt = this.nowMs();
            this.watchdog.lastPosition = expected;
            this.player.seek(expected);
        }
        if (this.player.isPaused()) {
            this.play();
        }
    }

    play() {
        try {
            const result = this.player.play();
            if (result && typeof result.catch === 'function') {
                // Browsers reject play() when autoplay isn't allowed. That isn't the video's
                // fault, so the watchdog stops counting until resume() is called.
                result.catch((e) => {
                    if (e && e.name === 'NotAllowedError') {
                        this.watchdog.blocked = true;
                        this.setStatus('blocked');
                    }
                });
            }
        } catch (e) {
            // Same as above for players that throw instead.
        }
    }

    finishLoadedTrack() {
        const track = this.loadedTrack();
        if (!track) {
            return;
        }
        this.finished.add(trackKey(track));
        this.sync();
    }

    failTrack(track, report) {
        const key = trackKey(track);
        this.failed.add(key);
        if (report && !this.reported.has(key) && track.youtube_id) {
            this.reported.add(key);
            this.reportFailure(track);
        }
        this.setStatus('unavailable');
        this.sync();
    }

    silence() {
        if (this.loadedKey !== null) {
            this.player.pause();
        }
        this.pendingStart = false;
        this.loadedKey = null;
    }

    waitUntil(seconds) {
        this.clearBoundary();
        const delayMs = Math.max(0, (seconds - this.clock.seconds()) * 1000) + 50;
        this.boundaryHandle = this.timers.setTimeout(() => {
            this.boundaryHandle = null;
            this.sync();
        }, delayMs);
    }

    clearBoundary() {
        if (this.boundaryHandle !== null && this.boundaryHandle !== undefined) {
            this.timers.clearTimeout(this.boundaryHandle);
        }
        this.boundaryHandle = null;
    }

    retryLater() {
        this.timers.clearTimeout(this.retryHandle);
        this.retryHandle = this.timers.setTimeout(() => {
            if (this.started) {
                this.refresh();
            }
        }, this.options.retryScheduleAfterMs);
    }

    resetWatchdog() {
        this.watchdog = {
            lastPosition: -1,
            lastProgressAt: this.nowMs ? this.nowMs() : 0,
            lastCorrectionAt: 0,
            hasPlayed: false,
            blocked: false,
            step: 0,
        };
    }

    setStatus(status) {
        if (this.status !== status) {
            this.status = status;
            this.emit();
        }
    }

    emit() {
        this.onChange({
            status: this.status,
            currentTrack: this.currentTrack,
            nextTracks: this.nextTracks,
            previousTracks: this.previous.slice(),
        });
    }
}
