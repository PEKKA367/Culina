export class Emitter {
    constructor() {
        // Store all events and their attached listeners
        this.events = {};
    }

    // Subscribe to an event
    on(eventName, listener) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(listener);
    }

    // Unsubscribe from an event
    off(eventName, listener) {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName].filter(l => l !== listener);
    }

    // Subscribe to an event only once
    once(eventName, listener) {
        const wrapper = (...args) => {
            this.off(eventName, wrapper);
            listener(...args);
        };
        this.on(eventName, wrapper);
    }

    emit(eventName, ...args) {
        const listeners = this.events[eventName];

        // If there are no listeners for an error, throw it to prevent silent failures
        if (eventName === "error" && (!listeners || listeners.length === 0)) {
            const error = args[0] instanceof Error ? args[0] : new Error(args[0] || "Unhandled error emitted");
            throw error;
        }

        if (!listeners) return;

        // This ensures that if one listener fails, the others will still execute
        listeners.forEach(listener => {
            try {
                listener(...args);
            } catch (error) {
                // Log the error and continue the execution loop
                console.error(`[Emitter] Execution failed for listener on event "${eventName}":`, error);
            }
        });
    }
}