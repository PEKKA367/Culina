// Wraps a pure function and caches its results by arguments.
// When the cache reaches maxSize, the oldest entry is removed (FIFO).
export function memoize(fn, options = {}) {
    const maxSize = options.maxSize || Infinity;
    const cache = new Map();

    return function memoized(...args) {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const value = fn(...args);

        if (cache.size >= maxSize) {
            // remove the oldest inserted key
            const oldestKey = cache.keys().next().value;
            cache.delete(oldestKey);
        }

        cache.set(key, value);
        return value;
    };
}
