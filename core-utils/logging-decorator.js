export function loggingDecorator(fn, options = {}) {
    // We receive the logger instance via options (Dependency Injection principle)
    const logger = options.logger;
    const level = options.level || "INFO";

    // The decorator returns a NEW function that wraps the original one
    return function (...args) {
        const functionName = fn.name || "anonymousFunction";

        // Execution time profiling
        const startTime = performance.now();

        const handleSuccess = (result) => {
            const endTime = performance.now();
            const executionTime = (endTime - startTime).toFixed(2);

            // If the level is "ERROR", we remain completely silent on success
            if (level !== "ERROR") {
                logger[level.toLowerCase()](
                    "Function [" + functionName + "] completed in " + executionTime + "ms.",
                    { arguments: args, result: result }
                );
            }
            return result;
        };

        const handleError = (error) => {
            const endTime = performance.now();
            const executionTime = (endTime - startTime).toFixed(2);

            logger.error(
                "Function [" + functionName + "] failed after " + executionTime + "ms.",
                { arguments: args, error: error.message || error }
            );

            // Re-throw the error so the main application can still catch and handle it
            throw error;
        };

        try {
            // Execute the original function with its original context and arguments
            const result = fn.apply(this, args);

            if (result !== null && result !== undefined && typeof result.then === "function") {
                // If fn is async and has Promise. We wait for it to resolve or reject.
                return result.then(handleSuccess).catch(handleError);
            } else {
                // If fn is synchronous
                return handleSuccess(result);
            }
        } catch (error) {
            // Catch any synchronous errors that happened immediately
            return handleError(error);
        }
    };
}