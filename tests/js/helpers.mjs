// Test doubles for RadioStation: a controllable clock, timers and video player.

export class FakeTime {
    constructor(startMs = 1_000_000) {
        this.ms = startMs;
        this.nextId = 1;
        this.tasks = new Map(); // id -> { at, fn, every }
        this.timers = {
            setTimeout: (fn, ms) => this.add(fn, ms, null),
            clearTimeout: (id) => this.tasks.delete(id),
            setInterval: (fn, ms) => this.add(fn, ms, ms),
            clearInterval: (id) => this.tasks.delete(id),
        };
        this.now = () => this.ms;
    }

    add(fn, ms, every) {
        const id = this.nextId++;
        this.tasks.set(id, { at: this.ms + Math.max(0, ms || 0), fn, every });
        return id;
    }

    /** Moves time forward, running due timers in order. */
    advance(ms, player) {
        const end = this.ms + ms;
        for (;;) {
            let nextId = null;
            let next = null;
            for (const [id, task] of this.tasks) {
                if (task.at <= end && (next === null || task.at < next.at)) {
                    nextId = id;
                    next = task;
                }
            }
            if (next === null) {
                break;
            }
            // Overdue timers (e.g. after a sleep) run late, as in a browser.
            const at = Math.max(this.ms, next.at);
            if (player) {
                player.advanceTo(at);
            }
            this.ms = at;
            if (next.every) {
                next.at = at + next.every;
            } else {
                this.tasks.delete(nextId);
            }
            next.fn();
        }
        if (player) {
            player.advanceTo(end);
        }
        this.ms = end;
    }
}

/**
 * Behaves like the Plyr/YouTube player as far as RadioStation can tell. While playing, its
 * position moves with FakeTime (when passed to advance()), and it reports timeupdate and
 * ended back to the station.
 */
export class FakePlayer {
    constructor(time) {
        this.time = time;
        this.calls = [];
        this.videoId = null;
        this.position = 0;
        this.paused = true;
        this.ready = false;
        this.volume = 1;
        this.durations = {};     // videoId -> seconds
        this.broken = new Set(); // videoIds that never start
        this.stalled = false;    // true: position doesn't move (buffering)
        this.playResult = undefined;
        this.readyDelayMs = 500;   // null: call becomeReady() by hand
        this.station = null;
        this.lastMs = time.ms;
    }

    attach(station) {
        this.station = station;
    }

    load(videoId) {
        this.calls.push(['load', videoId]);
        this.videoId = videoId;
        this.position = 0;
        this.paused = true;
        this.ready = false;
        if (this.readyDelayMs !== null) {
            const loadedId = this.videoId;
            this.time.timers.setTimeout(() => {
                if (this.videoId === loadedId && !this.ready) {
                    this.becomeReady();
                }
            }, this.readyDelayMs);
        }
    }

    /** Simulates the embed finishing loading. */
    becomeReady() {
        this.ready = true;
        this.station.onReady();
    }

    play() {
        this.calls.push(['play']);
        if (!this.broken.has(this.videoId)) {
            this.paused = false;
        }
        return this.playResult;
    }

    pause() {
        this.calls.push(['pause']);
        this.paused = true;
    }

    seek(position) {
        this.calls.push(['seek', position]);
        this.position = position;
    }

    currentTime() {
        return this.position;
    }

    isPaused() {
        return this.paused;
    }

    setVolume(volume) {
        this.volume = volume;
    }

    advanceTo(ms) {
        const elapsed = (ms - this.lastMs) / 1000;
        this.lastMs = ms;
        if (this.paused || this.stalled || !this.ready || elapsed <= 0 || !this.station) {
            return;
        }
        const duration = this.durations[this.videoId] ?? Infinity;
        this.position = Math.min(duration, this.position + elapsed);
        this.station.onTimeUpdate();
        if (this.position >= duration && !this.paused) {
            this.paused = true;
            this.station.onEnded();
        }
    }

    loads() {
        return this.calls.filter((c) => c[0] === 'load').map((c) => c[1]);
    }

    seeks() {
        return this.calls.filter((c) => c[0] === 'seek').map((c) => c[1]);
    }
}

export function track(id, secsStart, secsEnd, extra = {}) {
    return Object.assign({
        track_id: id,
        youtube_id: `yt${id}`,
        youtube_duration_ms: (secsEnd - secsStart) * 1000,
        youtube_start_ms: null,
        youtube_end_ms: null,
        youtube_post_delay_ms: null,
        secs_start: secsStart,
        secs_end: secsEnd,
    }, extra);
}

export function flush() {
    return new Promise((resolve) => setImmediate(resolve));
}
