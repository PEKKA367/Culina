//   asyncFilter   — Promise version, predicate returns Promise<boolean>
//   asyncFilterCb — callback version, predicate calls cb(err, keep)

// Creates a standard DOMException to mimic native fetch() abort behavior
function makeAbortError() {
    // Same shape as fetch() produces when its signal is aborted.
    return new DOMException("Aborted", "AbortError");
}

// Processes items sequentially. Uses Promise.race for immediate cancellation
export async function asyncFilter(arr, predicate, options = {}) {
    const signal = options.signal;

    // Check if already aborted before starting
    if (signal && signal.aborted) {
        throw makeAbortError();
    }

    // Promise that resolves only to reject when abort is triggered
    let abortReject;
    const abortPromise = new Promise((_, reject) => {
        abortReject = reject;
    });

    function onAbort() {
        abortReject(makeAbortError());
    }

    if (signal) {
        signal.addEventListener("abort", onAbort, {once: true});
    }

    try {
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            // Race the predicate against the abort signal to prevent hanging requests
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
        // Strict cleanup: ensure event listener is removed to prevent memory leaks
        if (signal) {
            signal.removeEventListener("abort", onAbort);
        }
    }
}


// Processes items in parallel. Strict adherence to Node.js callback standards
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

    // Unified exit point to prevent multiple callback invocations
    function finish(err, result) {
        if (done) return;
        done = true;

        // Strict cleanup on abort or finish
        if (signal) {
            signal.removeEventListener("abort", onAbort);
        }
        callback(err, result);
    }

    function onAbort() {
        finish(makeAbortError());
    }

    if (signal) {
        signal.addEventListener("abort", onAbort, {once: true});
    }

    arr.forEach((item, i) => {
        predicate(item, i, (err, keep) => {
            if (done) return; // ignore late predicates after abort/error
            if (err) {
                finish(err);
                return;
            }
            keepMask[i] = !!keep;
            pending--;
            if (pending === 0) {
                finish(null, arr.filter((_, idx) => keepMask[idx]));
            }
        });
    });
}
