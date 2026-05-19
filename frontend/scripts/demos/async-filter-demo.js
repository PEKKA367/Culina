// Demo for asyncFilter / asyncFilterCb from culina-utils.
// Open DevTools console after loading pages/demos.html and watch the output.

import { asyncFilter, asyncFilterCb } from "culina-utils";


function delay(ms, signal) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            if (signal) signal.removeEventListener("abort", onAbort);
            resolve();
        }, ms);

        function onAbort() {
            clearTimeout(timer);
            reject(new DOMException("Aborted", "AbortError"));
        }

        if (signal) {
            signal.addEventListener("abort", onAbort, { once: true });
        }
    });
}


// 20 fake recipe ids. The predicate keeps even ones, sleeping 200ms each
// to simulate a slow async check (e.g. a network call).
const ids = Array.from({ length: 20 }, (_, i) => i);


//PROMISE VERSION
console.log("--- asyncFilter (Promise) ---");
const evens = await asyncFilter(ids, async (n) => {
    await delay(200);
    return n % 2 === 0;
});
console.log("evens:", evens); // [0, 2, 4, ..., 18]


//CALLBACK VERSION (error-first)
console.log("--- asyncFilterCb (callback) ---");
asyncFilterCb(
    ids,
    (n, i, cb) => {
        setTimeout(() => cb(null, n % 3 === 0), 100);
    },
    (err, divisibleByThree) => {
        if (err) {
            console.error("cb error:", err);
            return;
        }
        console.log("divisible by 3:", divisibleByThree);
    }
);


//CANCEL BUTTON: wire up #btn-cancel-filter to abort a slow filter
const btnCancel = document.getElementById("btn-cancel-filter");
const outCancel = document.getElementById("out-cancel-filter");

if (btnCancel && outCancel) {
    btnCancel.addEventListener("click", async () => {
        const controller = new AbortController();
        outCancel.textContent = "Running... click Cancel to abort";
        btnCancel.textContent = "Cancel";
        btnCancel.onclick = () => controller.abort();

        try {
            const result = await asyncFilter(
                ids,
                async (n, i, /* no signal in predicate API */) => {
                    // honour the same signal inside our slow predicate
                    await delay(500, controller.signal);
                    return n % 2 === 0;
                },
                { signal: controller.signal }
            );
            outCancel.textContent = "Result: " + JSON.stringify(result);
        } catch (err) {
            if (err.name === "AbortError") {
                outCancel.textContent = "Aborted by user";
            } else {
                outCancel.textContent = "Error: " + err.message;
            }
        } finally {
            btnCancel.textContent = "Run slow filter";
            btnCancel.onclick = null;
        }
    });
}
