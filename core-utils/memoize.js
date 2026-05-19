// Wraps a pure function and caches its results by arguments.
// Supported eviction strategies:
//   FIFO (default) — removes the oldest inserted entry
//   LRU            — removes the least recently used entry (reorders on get)
//   LFU            — removes the least frequently used entry (by hit count)
//   TTL            — drops entries older than options.ttlMs
//   custom         — calls options.customEvict(cache) to pick a key to remove
export function memoize(fn, options = {}) {
    const maxSize = options.maxSize || Infinity;
    const strategy = options.strategy || 'FIFO';
    const ttlMs = options.ttlMs;
    const customEvict = options.customEvict;
    const cache = new Map();
    const hits = new Map();   // used only for LFU
    const expiry = new Map(); // used only for TTL

    // finds the key with the lowest hit count for LFU eviction
    function findLeastFrequentKey() {
        let minKey;
        let minHits = Infinity; // start high so any real count is smaller
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
        const key = JSON.stringify(args); // array of args → string key for the Map

        if (cache.has(key) && !isExpired(key)) {
            const value = cache.get(key);

            if (strategy === 'LRU') {
                // re-insert to move key to end (Map preserves insertion order)
                cache.delete(key);
                cache.set(key, value);
            }

            if (strategy === 'LFU') {
                hits.set(key, hits.get(key) + 1);
            }

            return value;
        }

        // cache MISS or stale TTL — drop the stale entry before recomputing
        if (cache.has(key)) {
            cache.delete(key);
            expiry.delete(key);
        }

        const value = fn(...args);

        if (cache.size >= maxSize) {
            let keyToEvict;
            if (strategy === 'LFU') {
                keyToEvict = findLeastFrequentKey();
            } else if (strategy === 'custom' && customEvict) {
                keyToEvict = customEvict(cache); // user decides which key to remove
            } else {
                keyToEvict = cache.keys().next().value; // first key = oldest (FIFO/LRU)
            }
            cache.delete(keyToEvict);
            hits.delete(keyToEvict);
            expiry.delete(keyToEvict);
        }

        cache.set(key, value);
        if (strategy === 'LFU') {
            hits.set(key, 1); // new entry starts with 1 hit
        }
        if (strategy === 'TTL' && ttlMs) {
            expiry.set(key, Date.now() + ttlMs); // record when this entry expires
        }

        return value;
    };
}