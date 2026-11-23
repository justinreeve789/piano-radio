/*
 * Pure helpers for following the daily schedule that GET /api/v1/track returns.
 *
 * Times called "seconds" are seconds since midnight on the server's clock, the same unit as a
 * track's secs_start / secs_end. Times called "position" are seconds into the video.
 */

export const SECONDS_PER_DAY = 86400;

function ms(value) {
    return value === null || value === undefined || value === '' ? null : Number(value);
}

/** Where in the video the track starts. */
export function videoStart(track) {
    return (ms(track.youtube_start_ms) ?? 0) / 1000;
}

/**
 * Where in the video the track stops: end_ms if set, otherwise the end of the video.
 * Infinity when neither is known, in which case the player's "ended" event decides.
 */
export function videoEnd(track) {
    const end = ms(track.youtube_end_ms) ?? ms(track.youtube_duration_ms);
    return end === null ? Infinity : end / 1000;
}

/**
 * Length of the track's slot in the schedule: the part of the video that's played plus
 * post_delay_ms of silence. Must match the formula in Settings::generateSql().
 */
export function scheduledLength(track) {
    const end = ms(track.youtube_end_ms) ?? ms(track.youtube_duration_ms) ?? 0;
    return (end - (ms(track.youtube_start_ms) ?? 0) + (ms(track.youtube_post_delay_ms) ?? 0)) / 1000;
}

/**
 * Where the video should be at `seconds`, or null if the track isn't audible then
 * (its slot hasn't started, or only its trailing silence is left).
 */
export function positionAt(track, seconds) {
    const offset = seconds - track.secs_start;
    if (offset < 0) {
        return null;
    }
    const position = videoStart(track) + offset;
    return position < videoEnd(track) ? position : null;
}

/**
 * Index of the track scheduled at `seconds` in a play-ordered list, or -1 when the list
 * doesn't cover that time (it has run out, or hasn't started yet).
 */
export function indexAt(tracks, seconds) {
    for (let i = tracks.length - 1; i >= 0; i--) {
        if (tracks[i].secs_start <= seconds) {
            return seconds < tracks[i].secs_end ? i : -1;
        }
    }
    return -1;
}

/**
 * Volume for a track. Spotify loudness is in dB (around -60 to 0); quiet recordings get
 * full volume and loud ones are turned down a little.
 */
export function volumeFor(track, baseVolume = 1.0) {
    const loudness = Number(track.loudness);
    if (Number.isNaN(loudness) || track.loudness === null || track.loudness === undefined) {
        return baseVolume;
    }
    if (loudness >= -20) {
        return baseVolume * 0.9;
    }
    if (loudness >= -30) {
        return baseVolume * 0.95;
    }
    return baseVolume;
}

/**
 * The server's time of day, carried forward with the local clock.
 *
 * The server reports current_seconds once per playlist request; this keeps counting from
 * there so a track loaded later is joined at the right place. Seconds keep going past 86400
 * after midnight; callers treat that as "the day is over".
 */
export class ScheduleClock {
    constructor(serverSeconds, nowMs = () => Date.now()) {
        this.nowMs = nowMs;
        this.serverSeconds = Number(serverSeconds);
        this.syncedAt = nowMs();
    }

    seconds() {
        return this.serverSeconds + (this.nowMs() - this.syncedAt) / 1000;
    }
}
