# Sliding Window Maximum (JavaScript)

Tracks the maximum value in a fixed-size sliding window over a data stream using a monotonic deque. Amortized O(1) per push and O(1) for `max()`.

## Usage

```js
import { SlidingWindowMaximum } from './src/index.js';

const swm = new SlidingWindowMaximum(3);
swm.push(1); swm.push(3); swm.push(-1);
swm.max();   // 3
swm.push(-3);
swm.max();   // 3
swm.push(5);
swm.max();   // 5
swm.size();  // 3
swm.isEmpty(); // false
```

## Why this exists

You have an unbounded stream of numbers and a fixed window width `k`, and you want the current max without re-scanning the whole window on every value. The standard solution is a deque of (index, value) pairs kept in monotonic decreasing order of value. Each element enters and leaves the deque at most once, so the total work over `n` pushes is O(n) — amortized O(1) per push.

This library implements exactly that, nothing more. `push()` takes a single number and updates the window; `max()` reads the front of the deque. Values are restricted to finite numbers: `NaN`, `Infinity`, and `-Infinity` are rejected, because `max` of a window containing `NaN` is not a well-defined number and comparing infinities against finite bounds tends to produce surprising long-lived maxima in real pipelines.

## The awkward edge

Before the window fills, `max()` still returns the largest value seen so far rather than null. If you need "only report once we have a full window", guard with `size() === windowSize`:

```js
if (swm.size() === k) {
  handle(swm.max());
}
```

`max()` returns `null` only before *any* value has been pushed. Once the first value arrives it is, by definition, the max of the (size-1) window, so it is returned.

## API

- `new SlidingWindowMaximum(windowSize)` — `windowSize` must be a positive integer. Throws `RangeError` otherwise.
- `push(value)` — append a finite number; throws `TypeError` for non-numbers or non-finite numbers.
- `max()` — `number` (the current window max) or `null` if empty.
- `size()` — current window size in `[0, windowSize]`.
- `isEmpty()` — `true` until the first `push`.

## Run the tests

```sh
node --test
```
