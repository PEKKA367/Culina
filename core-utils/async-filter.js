// Async variants of Array.prototype.filter.
//   asyncFilter   — Promise version, predicate returns Promise<boolean>
//   asyncFilterCb — callback version, predicate calls cb(err, keep)
// Both support AbortController via { signal } and clean up after themselves.

function makeAbortError() {
    // Same shape as fetch() produces when its signal is aborted.
    return new DOMException("Aborted", "AbortError");
}

export async function asyncFilter(arr, predicate, options = {}) {
    const signal = options.signal;

    if (signal && signal.aborted) {
        throw makeAbortError();
    }

    let abortReject;
    const abortPromise = new Promise((_, reject) => { abortReject = reject; });

    function onAbort() {
        abortReject(makeAbortError());
    }
    if (signal) {
        signal.addEventListener("abort", onAbort, { once: true });
    }

    try {
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            // race the predicate against abort so the await doesn't hang
            // when the consumer cancels mid-flight
            const keep = await Promise.race([
                predicate(arr[i], i),
                abortPromise
            ]);
            if (keep) {
                result.push(arr[i]);
            }
        }
        return result;
    } finally {
        // cleanup happens on success, on error AND on abort
        if (signal) {
            signal.removeEventListener("abort", onAbort);
        }
    }
}


// Error-first callback variant. The predicate must use node-style
// callback: predicate(item, i, (err, keep) => ...). Final result is
// delivered the same way: callback(err, filteredArray).
export function asyncFilterCb(arr, predicate, options, callback) {
    // allow asyncFilterCb(arr, pred, cb) without options
    if (typeof options === "function") {
        callback = options;
        options = {};
    }
    const signal = options.signal;

    if (signal && signal.aborted) {
        callback(makeAbortError());
        return;
    }

    if (arr.length === 0) {
        callback(null, []);
        return;
    }

    const keepMask = new Array(arr.length);
    let pending = arr.length;
    let done = false;

    function finish(err, result) {
        if (done) return;
        done = true;
        if (signal) {
            signal.removeEventListener("abort", onAbort);
        }
        callback(err, result);
    }

    function onAbort() {
        finish(makeAbortError());
    }
    if (signal) {
        signal.addEventListener("abort", onAbort, { once: true });
    }

    arr.forEach((item, i) => {
        predicate(item, i, (err, keep) => {
            if (done) return; // ignore late predicates after abort/error
            if (err) {
                finish(err);
                return;
            }
            keepMask[i] = ! ! keep;
            pending--;
            if (pending === 0) {
                finish(null, arr.filter((_, idx) => keepMask[idx]));
            }
        });
    });
}
