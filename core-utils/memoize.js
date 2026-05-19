// Wraps a pure function and caches its results by arguments.
// Supported eviction strategies:
//   FIFO (default) — removes the oldest inserted entry
//   LRU            — removes the least recently used entry (reorders on get)
export function memoize(fn, options = {}) {
    const maxSize = options.maxSize || Infinity;
    const strategy = options.strategy || 'FIFO';
    const cache = new Map();

    return function memoized(...args) {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            const value = cache.get(key);

            // LRU: move the key to the end so it becomes "most recently used"
            if (strategy === 'LRU') {
                cache.delete(key);
                cache.set(key, value);
            }

            return value;
        }

        const value = fn(...args);

        if (cache.size >= maxSize) {
            // both FIFO and LRU remove the first key of the Map.
            // for LRU it works because we reorder on every get above
            const oldestKey = cache.keys().next().value;
            cache.delete(oldestKey);
        }

        cache.set(key, value);
        return value;
    };
}
