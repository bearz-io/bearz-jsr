export enum SyslogSeverity {
    /**
     * System is unusable.
     */
    Emergency = 0,
    /**
     * Action must be taken immediately.
     */
    Alert = 1,
    /**
     * Critical conditions.
     */
    Critical = 2,
    /**
     * Error conditions.
     */
    Error = 3,
    /**
     * Warning conditions.
     */
    Warning = 4,
    /**
     * Normal but significant condition.
     */
    Notice = 5,
    /**
     * Informational messages.
     */
    Informational = 6,
    /**
     * Debug-level messages.
     */
    Debug = 7,
    /**
     * Trace-level messages.
     */
    Trace = 8,
}

export enum Severity {
    /**
     * No severity level.
     */
    None = 0,

    /**
     * Fatal error or application crash.
     */
    Fatal = 2,

    /**
     * Error conditions.
     */
    Error = 3,

    /**
     * Warning conditions.
     */
    Warn = 4,

    /**
     * Informational messages.
     */
    Info = 6,

    /**
     * Debug-level messages.
     */
    Debug = 7,

    /**
     * Trace-level messages.
     */
    Trace = 8,
}

export const severityNames = new Map<Severity, string>([
    [Severity.None, "None"],
    [Severity.Fatal, "Fatal"],
    [Severity.Error, "Error"],
    [Severity.Warn, "Warn"],
    [Severity.Info, "Info"],
    [Severity.Debug, "Debug"],
    [Severity.Trace, "Trace"],
]);

export const namesToSeverity = new Map<string, Severity>([
    ["None", Severity.None],
    ["none", Severity.None],
    ["Fatal", Severity.Fatal],
    ["fatal", Severity.Fatal],
    ["Error", Severity.Error],
    ["error", Severity.Error],
    ["Warning", Severity.Warn],
    ["warning", Severity.Warn],
    ["Warn", Severity.Warn],
    ["warn", Severity.Warn],
    ["Info", Severity.Info],
    ["info", Severity.Info],
    ["Informational", Severity.Info],
    ["informational", Severity.Info],
    ["information", Severity.Info],
    ["Information", Severity.Info],
    ["Debug", Severity.Debug],
    ["debug", Severity.Debug],
    ["Trace", Severity.Trace],
    ["trace", Severity.Trace],
]);

export type SeverityName = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

export function enabled(current: Severity, level: Severity | SeverityName): boolean {
    if (current === Severity.None) {
        return false;
    }

    if (typeof level === "string") {
        const temp = namesToSeverity.get(level);
        if (temp === undefined) {
            return false;
        }

        return temp <= current;
    }

    return level <= current;
}
