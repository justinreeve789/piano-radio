import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RadioStation } from '../../resources/js/radio/station.mjs';
import { FakePlayer, FakeTime, flush, track } from './helpers.mjs';

function schedule(currentSeconds, tracks, { previous = [], date = '2026-11-23' } = {}) {
    return {
        current_seconds: currentSeconds,
        date,
        current_track: tracks[0],
        next_tracks: tracks.slice(1),
        previous_tracks: previous,
    };
}

/**
 * responses: schedule responses (or functions returning a promise), used in order; the
 * last one is repeated.
 */
function setup(responses, options = {}) {
    const time = new FakeTime();
    const player = new FakePlayer(time);
    const reports = [];
    const fetches = [];
    const states = [];
    const queue = responses.slice();
    const station = new RadioStation({
        player,
        nowMs: time.now,
        timers: time.timers,
        options,
        fetchSchedule: () => {
            fetches.push(time.ms);
            const next = queue.length > 1 ? queue.shift() : queue[0];
            return typeof next === 'function' ? next() : Promise.resolve(next);
        },
        reportFailure: (t) => reports.push(t.youtube_id),
        onChange: (state) => states.push(state),
    });
    player.attach(station);

    // Moves time forward in steps, letting promises settle in between.
    async function advance(ms, step = 250) {
        for (let done = 0; done < ms; done += step) {
            time.advance(Math.min(step, ms - done), player);
            await flush();
        }
    }

    return { time, player, station, reports, fetches, states, advance };
}

const near = (actual, expected, tolerance = 0.3) =>
    assert.ok(Math.abs(actual - expected) <= tolerance, `expected ~${expected}, got ${actual}`);

// ---- Joining the schedule --------------------------------------------------------------------

test('joins the current track at its scheduled position, allowing for load time', async () => {
    const { station, player, advance } = setup([schedule(1000, [track(1, 900, 1200), track(2, 1200, 1500)])]);
    player.readyDelayMs = 3000;

    await station.start();
    assert.deepEqual(player.loads(), ['yt1']);
    await advance(3000);

    near(player.seeks()[0], 103);
    assert.equal(player.isPaused(), false);
    await advance(1000);
    assert.equal(station.status, 'playing');
});

test('applies the start trim when seeking', async () => {
    const t = track(1, 900, 1200, { youtube_start_ms: 20000, youtube_duration_ms: 320000 });
    const { station, player, advance } = setup([schedule(1000, [t])]);

    await station.start();
    await advance(500);

    near(player.seeks()[0], 120.5);
});

test('sets the volume from the track loudness', async () => {
    const { station, player } = setup([schedule(10, [track(1, 0, 100, { loudness: -8 })])]);

    await station.start();

    assert.equal(player.volume, 0.9);
});

// ---- Moving through the day ------------------------------------------------------------------

test('plays the next track from the start when its slot begins', async () => {
    const { station, player, advance } = setup([schedule(1190, [track(1, 900, 1200), track(2, 1200, 1500)])]);

    await station.start();
    await advance(10_500);

    assert.deepEqual(player.loads(), ['yt1', 'yt2']);
    near(player.seeks().at(-1), 0.5, 0.6);
    assert.equal(station.currentTrack.track_id, 2);
    assert.equal(station.previous[0].track_id, 1);
});

test('a video ending early waits for the next slot instead of starting it early', async () => {
    const { station, player, advance } = setup([schedule(1190, [track(1, 900, 1200), track(2, 1200, 1500)])]);
    player.durations.yt1 = 295; // 5 s shorter than its slot

    await station.start();
    await advance(5_000);
    assert.equal(player.isPaused(), true, 'silent after the video ends');
    assert.deepEqual(player.loads(), ['yt1'], 'next track not loaded early');

    await advance(6_000);
    assert.deepEqual(player.loads(), ['yt1', 'yt2']);
});

test('ended and timeupdate both reporting the end does not skip a track', async () => {
    const tracks = [track(1, 0, 100), track(2, 100, 200), track(3, 200, 300)];
    const { station, player, advance } = setup([schedule(95, tracks)]);

    await station.start();
    await advance(1000);
    station.onEnded();
    station.onTimeUpdate();
    station.onEnded();
    await advance(5000);

    assert.equal(station.currentTrack.track_id, 2);
    assert.deepEqual(player.loads(), ['yt1', 'yt2']);
});

test('an ended event from the previous video is ignored', async () => {
    const { station, player, advance } = setup([schedule(99, [track(1, 0, 100), track(2, 100, 200)])]);

    await station.start();
    await advance(1100); // yt2 is loaded but not ready yet
    player.readyDelayMs = null;
    assert.equal(player.loads().at(-1), 'yt2');
    station.onEnded();

    assert.equal(station.finished.size, 1, 'only track 1 is finished');
    assert.equal(station.currentTrack.track_id, 2);
});

test('stops at end_ms and stays silent through the post delay', async () => {
    const t1 = track(1, 0, 63, { youtube_duration_ms: 90000, youtube_end_ms: 60000, youtube_post_delay_ms: 3000 });
    const { station, player, advance } = setup([schedule(55, [t1, track(2, 63, 200)])]);

    await station.start();
    await advance(5_500);
    assert.equal(player.isPaused(), true, 'stopped at end_ms');
    assert.ok(player.currentTime() <= 60.3);

    await advance(1_000);
    assert.deepEqual(player.loads(), ['yt1'], 'still in the post delay');

    await advance(2_000);
    assert.deepEqual(player.loads(), ['yt1', 'yt2']);
});

test('joining during the post delay waits for the next track', async () => {
    const t1 = track(1, 0, 63, { youtube_duration_ms: 60000, youtube_post_delay_ms: 3000 });
    const { station, player, advance } = setup([schedule(61, [t1, track(2, 63, 200)])]);

    await station.start();
    assert.deepEqual(player.loads(), []);

    await advance(2_500);
    assert.deepEqual(player.loads(), ['yt2']);
});

test('fetches more of the schedule when the list runs out', async () => {
    const { station, player, fetches, advance } = setup([
        schedule(95, [track(1, 0, 100)]),
        schedule(100, [track(2, 100, 200)]),
    ]);

    await station.start();
    await advance(6_000);

    assert.equal(fetches.length, 2);
    assert.deepEqual(player.loads(), ['yt1', 'yt2']);
});

test('fetches the new day\'s schedule at midnight', async () => {
    const { station, player, fetches, advance } = setup([
        schedule(86395, [track(1, 86000, 86700)]),
        schedule(0, [track(9, 0, 300)], { date: '2026-11-24' }),
    ]);

    await station.start();
    await advance(6_000);

    assert.equal(fetches.length, 2);
    assert.equal(player.loads().at(-1), 'yt9');
    assert.equal(station.currentTrack.track_id, 9);
});

test('refreshing to the same current track keeps the video playing', async () => {
    const tracks = [track(1, 0, 300), track(2, 300, 600)];
    const { station, player, advance } = setup([schedule(10, tracks), schedule(20, tracks.map((t) => ({ ...t })))]);

    await station.start();
    await advance(10_000);
    await station.refresh();
    await advance(1_000);

    assert.deepEqual(player.loads(), ['yt1']);
});

test('a slow, superseded schedule response is ignored', async () => {
    let resolveSlow;
    const slow = () => new Promise((resolve) => { resolveSlow = resolve; });
    const { station, player } = setup([slow, schedule(10, [track(2, 0, 300)])]);

    const first = station.start();
    await station.refresh();
    resolveSlow(schedule(10, [track(1, 0, 300)]));
    await first;
    await flush();

    assert.deepEqual(player.loads(), ['yt2']);
});

test('retries when the schedule request fails', async () => {
    let calls = 0;
    const { station, player, advance } = setup([() => {
        calls++;
        return calls === 1 ? Promise.reject(new Error('offline')) : Promise.resolve(schedule(10, [track(1, 0, 300)]));
    }]);

    await station.start();
    assert.equal(station.status, 'error');
    await advance(5_500);

    assert.deepEqual(player.loads(), ['yt1']);
});

// ---- Timeouts and failures -------------------------------------------------------------------

test('buffering for a while is not reported as a broken video', async () => {
    const { station, player, reports, advance } = setup([schedule(10, [track(1, 0, 600)])]);

    await station.start();
    await advance(5_000);
    player.stalled = true;
    await advance(20_000);
    player.stalled = false;
    await advance(5_000);

    assert.deepEqual(reports, []);
    assert.equal(player.isPaused(), false);
});

test('a video that played and then stalls for a long time is reloaded, not reported', async () => {
    const { station, player, reports, advance } = setup([schedule(10, [track(1, 0, 600)])]);

    await station.start();
    await advance(5_000);
    player.stalled = true;
    await advance(70_000);

    assert.deepEqual(reports, []);
    assert.ok(player.loads().length >= 3, 'reloaded');
    player.stalled = false;
    await advance(16_000); // back in step within the drift-correction cooldown
    near(player.currentTime(), 10 + 5 + 70 + 16, 1.5);
});

test('a video that never starts is reported once and its slot is skipped on schedule', async () => {
    const { station, player, reports, advance } = setup([schedule(10, [track(1, 0, 100), track(2, 100, 200)])]);
    player.broken.add('yt1');

    await station.start();
    await advance(29_000);
    assert.deepEqual(reports, [], 'not before the timeout');

    await advance(2_000);
    assert.deepEqual(reports, ['yt1']);
    assert.equal(station.status, 'unavailable');

    await advance(60_000);
    assert.deepEqual(reports, ['yt1'], 'reported once');
    assert.equal(player.loads().at(-1), 'yt2');
    near(player.seeks().at(-1), 0.5, 0.6);
});

test('tries play() and then a reload before giving up', async () => {
    const { station, player, advance } = setup([schedule(10, [track(1, 0, 600)])]);
    player.broken.add('yt1');

    await station.start();
    await advance(7_000);
    const plays = player.calls.filter((c) => c[0] === 'play').length;
    assert.ok(plays >= 2, 'nudged with play()');
    assert.deepEqual(player.loads(), ['yt1']);

    await advance(10_000);
    assert.deepEqual(player.loads(), ['yt1', 'yt1'], 'reloaded once');
});

test('starts the video anyway if the player never says it is ready', async () => {
    const { station, player, advance } = setup([schedule(10, [track(1, 0, 600)])]);
    player.readyDelayMs = null;

    await station.start();
    player.ready = true; // ready, but the event was missed
    await advance(7_000);

    assert.equal(player.isPaused(), false);
    near(player.seeks()[0], 16, 1);
});

test('short stalls spread over a track do not add up to a failure', async () => {
    const { station, player, reports, advance } = setup([schedule(10, [track(1, 0, 3600)])]);

    await station.start();
    for (let i = 0; i < 20; i++) {
        await advance(5_000);
        player.stalled = !player.stalled;
    }

    assert.deepEqual(reports, []);
    assert.deepEqual(player.loads(), ['yt1'], 'never reloaded');
});

test('a YouTube "embedding not allowed" error is reported straight away', async () => {
    const { station, player, reports, advance } = setup([schedule(10, [track(1, 0, 100), track(2, 100, 200)])]);

    await station.start();
    await advance(1_000);
    station.onError(150);

    assert.deepEqual(reports, ['yt1']);
    assert.equal(player.isPaused(), true);
});

test('a transient player error reloads instead of reporting', async () => {
    const { station, player, reports, advance } = setup([schedule(10, [track(1, 0, 600)])]);

    await station.start();
    await advance(1_000);
    station.onError(5);

    assert.deepEqual(reports, []);
    assert.deepEqual(player.loads(), ['yt1', 'yt1']);
});

test('repeated player errors are reported', async () => {
    const { station, reports, advance } = setup([schedule(10, [track(1, 0, 600)])]);

    await station.start();
    for (let i = 0; i < 3; i++) {
        await advance(1_000);
        station.onError(5);
    }

    assert.deepEqual(reports, ['yt1']);
});

test('blocked autoplay is not reported and resumes on request', async () => {
    const { station, player, reports, advance } = setup([schedule(10, [track(1, 0, 600)])]);
    const blocked = Object.assign(new Error('blocked'), { name: 'NotAllowedError' });
    player.broken.add('yt1');
    player.playResult = Promise.reject(blocked);
    player.playResult.catch(() => {});

    await station.start();
    await advance(60_000);
    assert.deepEqual(reports, []);
    assert.equal(station.status, 'blocked');

    player.broken.delete('yt1');
    player.playResult = undefined;
    station.resume();
    await advance(1_000);
    assert.equal(player.isPaused(), false);
    near(player.currentTime(), 71, 1);
});

test('a track without a YouTube video is skipped silently', async () => {
    const { station, player, reports, advance } = setup([schedule(10, [track(1, 0, 100, { youtube_id: null }), track(2, 100, 200)])]);

    await station.start();
    assert.deepEqual(player.loads(), []);
    await advance(91_000);

    assert.deepEqual(reports, []);
    assert.deepEqual(player.loads(), ['yt2']);
});

// ---- Staying in step -------------------------------------------------------------------------

test('moves back into step after falling behind', async () => {
    const { station, player, advance } = setup([schedule(10, [track(1, 0, 600)])]);

    await station.start();
    await advance(16_000);
    player.stalled = true;
    await advance(5_000); // 5 s behind, under the reload threshold
    player.stalled = false;
    await advance(2_000);

    near(player.currentTime(), 10 + 23, 1);
});

test('small differences are left alone', async () => {
    const { station, player, advance } = setup([schedule(10, [track(1, 0, 600)])]);

    await station.start();
    await advance(16_000);
    const seeks = player.seeks().length;
    player.position -= 2;
    await advance(5_000);

    assert.equal(player.seeks().length, seeks);
});

test('resumes if the video is paused from outside', async () => {
    const { station, player, advance } = setup([schedule(10, [track(1, 0, 600)])]);

    await station.start();
    await advance(3_000);
    player.pause();
    await advance(1_500);

    assert.equal(player.isPaused(), false);
});

test('a laptop waking from sleep jumps to the track scheduled now', async () => {
    const tracks = [track(1, 0, 100), track(2, 100, 200), track(3, 200, 300)];
    const { station, player, time, advance } = setup([schedule(10, tracks)]);

    await station.start();
    await advance(2_000);
    time.ms += 240_000; // asleep: no timers ran
    player.lastMs = time.ms;
    await advance(2_000);

    assert.equal(station.currentTrack.track_id, 3);
    assert.equal(player.loads().at(-1), 'yt3');
    near(player.seeks().at(-1), 53.5, 1);
});

test('reports the current, next and previous tracks', async () => {
    const tracks = [track(1, 0, 100), track(2, 100, 200), track(3, 200, 300)];
    const { station, states, advance } = setup([schedule(95, tracks, { previous: [track(0, -100, 0)] })]);

    await station.start();
    await advance(6_000);

    const last = states.at(-1);
    assert.equal(last.currentTrack.track_id, 2);
    assert.deepEqual(last.nextTracks.map((t) => t.track_id), [3]);
    assert.deepEqual(last.previousTracks.map((t) => t.track_id), [1, 0]);
});

test('previous tracks are limited', async () => {
    const tracks = Array.from({ length: 10 }, (_, i) => track(i + 1, i * 10, i * 10 + 10));
    const { station, advance } = setup([schedule(0, tracks)], { previousTrackCount: 3 });

    await station.start();
    await advance(75_000, 500);

    assert.deepEqual(station.previous.map((t) => t.track_id), [7, 6, 5]);
});
