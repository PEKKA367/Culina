// Wraps a pure function and caches its results by arguments.
// Supported eviction strategies:
//   FIFO (default) — removes the oldest inserted entry
//   LRU            — removes the least recently used entry (reorders on get)
//   LFU            — removes the least frequently used entry (by hit count)
export function memoize(fn, options = {}) {
    const maxSize = options.maxSize || Infinity;
    const strategy = options.strategy || 'FIFO';
    const cache = new Map();
    const hits = new Map(); // used only for LFU

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

    return function memoized(...args) {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
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

        const value = fn(...args);

        if (cache.size >= maxSize) {
            let keyToEvict;
            if (strategy === 'LFU') {
                keyToEvict = findLeastFrequentKey();
            } else {
                // FIFO and LRU both drop the first key in the Map
                keyToEvict = cache.keys().next().value;
            }
            cache.delete(keyToEvict);
            hits.delete(keyToEvict);
        }

        cache.set(key, value);
        if (strategy === 'LFU') {
            hits.set(key, 1);
        }

        return value;
    };
}
