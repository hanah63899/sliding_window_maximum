import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SlidingWindowMaximum } from '../src/index.js';

test('constructor rejects non-positive or non-integer window sizes', () => {
  assert.throws(() => new SlidingWindowMaximum(0), RangeError);
  assert.throws(() => new SlidingWindowMaximum(-1), RangeError);
  assert.throws(() => new SlidingWindowMaximum(2.5), RangeError);
});

test('max returns null and isEmpty is true before any value is pushed', () => {
  const swm = new SlidingWindowMaximum(3);
  assert.equal(swm.max(), null);
  assert.equal(swm.isEmpty(), true);
  assert.equal(swm.size(), 0);
});

test('size grows up to windowSize', () => {
  const swm = new SlidingWindowMaximum(3);
  swm.push(5);
  assert.equal(swm.size(), 1);
  swm.push(6);
  assert.equal(swm.size(), 2);
  swm.push(7);
  assert.equal(swm.size(), 3);
  swm.push(8);
  assert.equal(swm.size(), 3);
});

test('windowSize of 1 keeps only the latest value', () => {
  const swm = new SlidingWindowMaximum(1);
  swm.push(10);
  assert.equal(swm.max(), 10);
  swm.push(20);
  assert.equal(swm.max(), 20);
  swm.push(5);
  assert.equal(swm.max(), 5);
});

test('classic monotonic example: [1,3,-1,-3,5,3,6,7] over window 3', () => {
  const swm = new SlidingWindowMaximum(3);
  const expected = [3, 3, 5, 5, 6, 7];
  const input = [1, 3, -1, -3, 5, 3, 6, 7];
  const out = [];
  for (const v of input) {
    swm.push(v);
    if (swm.size() === 3) out.push(swm.max());
  }
  assert.deepEqual(out, expected);
});

test('strictly decreasing input keeps the front value until it expires', () => {
  const swm = new SlidingWindowMaximum(3);
  swm.push(9); swm.push(8); swm.push(7);
  assert.equal(swm.max(), 9);
  swm.push(6);
  assert.equal(swm.max(), 8);
  swm.push(5);
  assert.equal(swm.max(), 7);
});

test('strictly increasing input updates max on every push', () => {
  const swm = new SlidingWindowMaximum(3);
  swm.push(1); assert.equal(swm.max(), 1);
  swm.push(2); assert.equal(swm.max(), 2);
  swm.push(3); assert.equal(swm.max(), 3);
  swm.push(4); assert.equal(swm.max(), 4);
});

test('equal values evict the back so duplicates do not pile up', () => {
  const swm = new SlidingWindowMaximum(2);
  swm.push(5);
  swm.push(5);
  assert.equal(swm.max(), 5);
  swm.push(5);
  assert.equal(swm.max(), 5);
});

test('negative numbers are handled correctly', () => {
  const swm = new SlidingWindowMaximum(2);
  swm.push(-5); assert.equal(swm.max(), -5);
  swm.push(-3); assert.equal(swm.max(), -3);
  swm.push(-10); assert.equal(swm.max(), -3);
  swm.push(-1); assert.equal(swm.max(), -1);
});

test('maximum drops once the global peak leaves the window', () => {
  const swm = new SlidingWindowMaximum(2);
  swm.push(100); assert.equal(swm.max(), 100);
  swm.push(1); assert.equal(swm.max(), 100);
  swm.push(2); assert.equal(swm.max(), 2);
});

test('zero is a valid value', () => {
  const swm = new SlidingWindowMaximum(2);
  swm.push(0); assert.equal(swm.max(), 0);
  swm.push(-1); assert.equal(swm.max(), 0);
});

test('push rejects non-finite numbers', () => {
  const swm = new SlidingWindowMaximum(3);
  assert.throws(() => swm.push(NaN), TypeError);
  assert.throws(() => swm.push(Infinity), TypeError);
  assert.throws(() => swm.push(-Infinity), TypeError);
});
