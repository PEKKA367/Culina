export class Logger {
    constructor(options = {}) {
        this.output = options.output || "console";
        this.format = options.format || "text";
    }

    _log(level, message, data = null) {
        // ISO timestamp, not Date.now()
        const timestamp = new Date().toISOString();

        const logEntry = {
            timestamp: timestamp,
            level: level,
            message: message
        };

        // Add extra data if it exists (like function arguments or results)
        if (data !== null && data !== undefined) {
            logEntry.data = data;
        }

        // Support structured logging (JSON output)
        if (this.format === "json") {
            this._write(level, JSON.stringify(logEntry));
        } else {
            let textOutput = "[" + timestamp + "] [" + level + "] [" + message + "]";
            if (data !== null && data !== undefined) {
                textOutput += " | Data: " + JSON.stringify(data);
            }
            this._write(level, textOutput);
        }
    }

    _write(level, formattedMessage) {
        // Allow logging to console, file, or external services
        if (this.output === "file") {
            console.log("[FILE_SIMULATION] " + formattedMessage);
        } else {
            if (level === "ERROR") {
                console.error(formattedMessage);
            } else if (level === "DEBUG") {
                console.debug(formattedMessage);
            } else {
                console.log(formattedMessage);
            }
        }
    }

    info(message, data) {
        this._log("INFO", message, data);
    }

    debug(message, data) {
        this._log("DEBUG", message, data);
    }

    error(message, data) {
        this._log("ERROR", message, data);
    }
}