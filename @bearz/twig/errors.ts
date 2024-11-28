import type { Marker } from "./types.ts";

export class TwigError extends Error {
    override name: string = "TwigError";

    constructor(message?: string, file?: string) {
        super(message ?? "Unknown Twig error");
        this.file = file;
    }

    file?: string;

    override toString(): string {
        return `${this.name}: ${this.message}`;
    }
}

export class TwigLexError extends TwigError {
    override name: string = "TwigLexerError";

    constructor(message?: string, file?: string, marker?: Marker) {
        super(message, file);
        this.marker = marker;
    }

    marker?: Marker;
}
