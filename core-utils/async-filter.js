// Async variant of Array.prototype.filter.
// Promise version: predicate returns a Promise<boolean>. Supports
// AbortController via { signal } and always cleans up after itself.

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
