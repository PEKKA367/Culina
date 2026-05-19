// Demo for the memoize() utility from culina-utils.
// Open DevTools console after loading pages/demos.html to see the output.

import { memoize } from "../../../core-utils/memoize.js";


// A "slow" function we want to memoize. The counter shows how often
// the real function actually ran (cache MISS).
let counter = 0;
function slowSquare(n) {
    counter++;
    return n * n;
}

function reset() {
    counter = 0;
}


//FIFO STRATEGY
reset();
const fifoSquare = memoize(slowSquare, { maxSize: 2 });
console.log("--- FIFO (maxSize=2) ---");
console.log("square(2):", fifoSquare(2));    // computed
console.log("square(3):", fifoSquare(3));    // computed
console.log("square(2):", fifoSquare(2));    // cached
console.log("square(4):", fifoSquare(4));    // computed, evicts square(2)
console.log("square(2):", fifoSquare(2));    // recomputed (was evicted)
console.log("real calls:", counter);         // 4


//LRU STRATEGY
reset();
const lruSquare = memoize(slowSquare, { maxSize: 2, strategy: "LRU" });
console.log("--- LRU (maxSize=2) ---");
lruSquare(2);                                // computed
lruSquare(3);                                // computed
lruSquare(2);                                // cached -> 2 becomes most recent
lruSquare(4);                                // computed, evicts 3 (not 2)
console.log("square(2):", lruSquare(2));     // still cached
console.log("real calls:", counter);         // 3


//LFU STRATEGY
reset();
const lfuSquare = memoize(slowSquare, { maxSize: 2, strategy: "LFU" });
console.log("--- LFU (maxSize=2) ---");
lfuSquare(2);                                // computed, hits=1
lfuSquare(2);                                // cached,  hits=2
lfuSquare(3);                                // computed, hits=1
lfuSquare(4);                                // evicts 3 (least frequent)
console.log("square(3):", lfuSquare(3));     // recomputed
console.log("real calls:", counter);         // 4


//TTL STRATEGY
reset();
const ttlSquare = memoize(slowSquare, { strategy: "TTL", ttlMs: 200 });
console.log("--- TTL (ttlMs=200) ---");
ttlSquare(5);                                // computed
ttlSquare(5);                                // cached
setTimeout(() => {
    console.log("after 300ms, square(5):", ttlSquare(5));   // recomputed (expired)
    console.log("real calls (TTL):", counter);              // 2
}, 300);


//CUSTOM STRATEGY: evict the largest numeric key
reset();
const customSquare = memoize(slowSquare, {
    maxSize: 2,
    strategy: "custom",
    customEvict: (cache) => {
        // pick the key whose only arg is the biggest number
        let biggestKey;
        let biggestNum = -Infinity;
        for (const key of cache.keys()) {
            const num = JSON.parse(key)[0];
            if (num > biggestNum) {
                biggestNum = num;
                biggestKey = key;
            }
        }
        return biggestKey;
    }
});
console.log("--- custom (evict biggest n) ---");
customSquare(1);                             // computed
customSquare(9);                             // computed
customSquare(3);                             // computed, evicts 9 (biggest)
console.log("square(9):", customSquare(9));  // recomputed
console.log("real calls (custom):", counter);// 4
