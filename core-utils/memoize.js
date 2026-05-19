// Wraps a pure function and caches its results by arguments.
// Supported eviction strategies:
//   FIFO (default) — removes the oldest inserted entry
//   LRU            — removes the least recently used entry (reorders on get)
//   LFU            — removes the least frequently used entry (by hit count)
//   TTL            — drops entries older than options.ttlMs
export function memoize(fn, options = {}) {
    const maxSize = options.maxSize || Infinity;
    const strategy = options.strategy || 'FIFO';
    const ttlMs = options.ttlMs;
    const cache = new Map();
    const hits = new Map();   // used only for LFU
    const expiry = new Map(); // used only for TTL

    function findLeastFrequentKey() {
        let minKey;
        let minHits = Infinity;
        for (const [key, count] of hits) {
            if (count < minHits) {
                minHits = count;
                minKey = key;
            }
        }
        return minKey;
    }

    function isExpired(key) {
        if (strategy !== 'TTL') return false;
        const exp = expiry.get(key);
        return exp !== undefined && Date.now() > exp;
    }

    return function memoized(...args) {
        const key = JSON.stringify(args);

        if (cache.has(key) && ! isExpired(key)) {
            const value = cache.get(key);

            if (strategy === 'LRU') {
                cache.delete(key);
                cache.set(key, value);
            }

            if (strategy === 'LFU') {
                hits.set(key, hits.get(key) + 1);
            }

            return value;
        }

        // either MISS or stale TTL — drop the stale one before recomputing
        if (cache.has(key)) {
            cache.delete(key);
            expiry.delete(key);
        }

        const value = fn(...args);

        if (cache.size >= maxSize) {
            let keyToEvict;
            if (strategy === 'LFU') {
                keyToEvict = findLeastFrequentKey();
            } else {
                keyToEvict = cache.keys().next().value;
            }
            cache.delete(keyToEvict);
            hits.delete(keyToEvict);
            expiry.delete(keyToEvict);
        }

        cache.set(key, value);
        if (strategy === 'LFU') {
            hits.set(key, 1);
        }
        if (strategy === 'TTL' && ttlMs) {
            expiry.set(key, Date.now() + ttlMs);
        }

        return value;
    };
}
