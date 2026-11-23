import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    ScheduleClock,
    indexAt,
    positionAt,
    scheduledLength,
    videoEnd,
    videoStart,
    volumeFor,
} from '../../resources/js/radio/schedule.mjs';
import { track } from './helpers.mjs';

test('video start defaults to the beginning', () => {
    assert.equal(videoStart(track(1, 0, 100)), 0);
    assert.equal(videoStart(track(1, 0, 100, { youtube_start_ms: 4500 })), 4.5);
});

test('video end is end_ms, else the video duration, else unknown', () => {
    assert.equal(videoEnd(track(1, 0, 100)), 100);
    assert.equal(videoEnd(track(1, 0, 100, { youtube_end_ms: 90000 })), 90);
    assert.equal(videoEnd(track(1, 0, 100, { youtube_duration_ms: null })), Infinity);
});

test('slot length matches the server formula: played part plus post delay', () => {
    assert.equal(scheduledLength(track(1, 0, 200)), 200);
    assert.equal(scheduledLength(track(1, 0, 0, {
        youtube_duration_ms: 200000, youtube_start_ms: 10000, youtube_end_ms: 190000, youtube_post_delay_ms: 3000,
    })), 183);
    // Values from MySQL can arrive as strings.
    assert.equal(scheduledLength(track(1, 0, 0, { youtube_duration_ms: '120000', youtube_start_ms: '2000' })), 118);
});

test('position is the offset into the slot, shifted by the start trim', () => {
    const t = track(1, 1000, 1200, { youtube_start_ms: 5000, youtube_duration_ms: 205000 });
    assert.equal(positionAt(t, 1000), 5);
    assert.equal(positionAt(t, 1100), 105);
});

test('no position before the slot or during the silence after the video', () => {
    const t = track(1, 1000, 1203, { youtube_duration_ms: 200000, youtube_post_delay_ms: 3000 });
    assert.equal(positionAt(t, 999), null);
    assert.equal(positionAt(t, 1199.5), 199.5);
    assert.equal(positionAt(t, 1200), null);
    assert.equal(positionAt(t, 1202), null);
});

test('finds the track scheduled at a time', () => {
    const list = [track(1, 0, 100), track(2, 100, 250), track(3, 250, 300)];
    assert.equal(indexAt(list, 0), 0);
    assert.equal(indexAt(list, 99.9), 0);
    assert.equal(indexAt(list, 100), 1, 'a track starting exactly now is current');
    assert.equal(indexAt(list, 299), 2);
    assert.equal(indexAt(list, 300), -1, 'past the end of the list');
    assert.equal(indexAt([track(5, 50, 60)], 10), -1, 'before the list starts');
    assert.equal(indexAt([], 10), -1);
});

test('louder tracks are turned down, quiet ones are not', () => {
    assert.equal(volumeFor({ loudness: -8 }), 0.9);
    assert.equal(volumeFor({ loudness: -25 }), 0.95);
    assert.equal(volumeFor({ loudness: -35 }), 1.0);
    assert.equal(volumeFor({ loudness: null }), 1.0);
    assert.equal(volumeFor({}), 1.0);
    assert.equal(volumeFor({ loudness: -35 }, 0.5), 0.5);
});

test('clock carries the server time forward', () => {
    let ms = 50_000;
    const clock = new ScheduleClock(3600, () => ms);
    assert.equal(clock.seconds(), 3600);
    ms += 2500;
    assert.equal(clock.seconds(), 3602.5);
    ms += 86_400_000;
    assert.equal(clock.seconds(), 3602.5 + 86400, 'keeps counting past midnight');
});

test('clock accepts the server value as a string', () => {
    const clock = new ScheduleClock('120', () => 0);
    assert.equal(clock.seconds(), 120);
});
