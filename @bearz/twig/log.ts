import { enabled as is, Severity, type SeverityName } from "@bearz/severity";

export interface Log {
    severity: Severity;

    enabled(level: Severity | SeverityName): boolean;
    trace(...args: unknown[]): void;
    debug(...args: unknown[]): void;
    error(...args: unknown[]): void;
}

export const log: Log = {
    severity: Severity.Info,

    enabled(level: Severity | SeverityName) {
        return is(this.severity, level);
    },

    trace(...args: unknown[]) {
        console.log(...args);
    },
    debug(...args: unknown[]) {
        console.debug(...args);
    },
    error(...args: unknown[]) {
        console.error(...args);
    },
};

if (typeof globalThis.console === "undefined") {
    log.debug = log.error = log.trace = () => {};
} else {
    const hasLog = typeof globalThis.console.log === "function";

    if (typeof globalThis.console.debug === "undefined" && hasLog) {
        log.debug = (...args) => {
            console.log(...args);
        };
    }

    if (typeof globalThis.console.error === "undefined" && hasLog) {
        log.error = (...args) => {
            console.log(...args);
        };
    }
}
