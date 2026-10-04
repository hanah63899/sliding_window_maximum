/**
 * SlidingWindowMaximum tracks the maximum value in a fixed-size sliding
 * window over a data stream.
 *
 * The algorithm uses a monotonic decreasing deque of values paired with
 * their insertion index. "Monotonic decreasing" means deque values are kept
 * strictly non-increasing from front (largest) to back (smallest). When a
 * new value arrives, any smaller or equal values at the back are evicted:
 * they can never become the maximum for any future window that also contains
 * the newcomer (which is strictly larger-or-equal and will leave later).
 *
 * The deque only ever holds candidates for the maximum of the CURRENT
 * window, so the front is always the answer.
 *
 * Each value enters and leaves the deque at most once, so push() and max()
 * are amortized O(1). O(windowSize) memory worst case (strictly increasing
 * input fills the deque before evictions kick in).
 */
export class SlidingWindowMaximum {
  #windowSize;
  #deque;
  #nextIndex;

  /**
   * @param {number} windowSize Maximum number of values kept in the window.
   *   Must be an integer >= 1.
   * @throws {RangeError} If windowSize is not a positive integer.
   */
  constructor(windowSize) {
    if (!Number.isInteger(windowSize) || windowSize < 1) {
      throw new RangeError('windowSize must be a positive integer');
    }
    this.#windowSize = windowSize;
    this.#deque = [];
    this.#nextIndex = 0;
  }

  /**
   * Append a value and slide the window.
   *
   * Before answering we evict the front if its index has fallen out of the
   * window. Doing this at the start of push() keeps max() trivially O(1) and
   * means an empty deque is a reliable signal that no values have been seen.
   *
   * @param {number} value A finite number.
   * @returns {void}
   * @throws {TypeError} If value is not a finite number.
   */
  push(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError('value must be a finite number');
    }
    const index = this.#nextIndex;
    this.#nextIndex += 1;

    const leftEdge = index - this.#windowSize;
    while (this.#deque.length > 0 && this.#deque[0].index <= leftEdge) {
      this.#deque.shift();
    }

    while (
      this.#deque.length > 0 &&
      this.#deque[this.#deque.length - 1].value <= value
    ) {
      this.#deque.pop();
    }
    this.#deque.push({ index, value });
  }

  /**
   * Current window size: the number of values retained. Grows from 0 to
   * windowSize as values arrive, then stays at windowSize.
   *
   * @returns {number}
   */
  size() {
    const total = this.#nextIndex;
    return Math.min(total, this.#windowSize);
  }

  /**
   * @returns {boolean} True once at least one value has been pushed.
   */
  isEmpty() {
    return this.#deque.length === 0;
  }

  /**
   * @returns {number|null} The maximum value currently in the window, or null
   *   if no values have been pushed yet.
   */
  max() {
    if (this.#deque.length === 0) {
      return null;
    }
    return this.#deque[0].value;
  }
}
