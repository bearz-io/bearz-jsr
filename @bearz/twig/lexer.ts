import {
    CHAR_ASTERISK,
    CHAR_BACKWARD_SLASH,
    CHAR_CARRIAGE_RETURN,
    CHAR_COLON,
    CHAR_COMMA,
    CHAR_DOT,
    CHAR_DOUBLE_QUOTE,
    CHAR_EQUAL,
    CHAR_EXCLAMATION_MARK,
    CHAR_FORM_FEED,
    CHAR_FORWARD_SLASH,
    CHAR_HASH,
    CHAR_HYPHEN_MINUS,
    CHAR_LEFT_ANGLE_BRACKET,
    CHAR_LEFT_CURLY_BRACKET,
    CHAR_LEFT_PAREN,
    CHAR_LEFT_SQUARE_BRACKET,
    CHAR_LINE_FEED,
    CHAR_PERCENT,
    CHAR_PLUS,
    CHAR_QUESTION_MARK,
    CHAR_RIGHT_ANGLE_BRACKET,
    CHAR_RIGHT_CURLY_BRACKET,
    CHAR_RIGHT_PAREN,
    CHAR_RIGHT_SQUARE_BRACKET,
    CHAR_SEMICOLON,
    CHAR_SINGLE_QUOTE,
    CHAR_TAB,
    CHAR_UNDERSCORE,
    CHAR_VERTICAL_LINE,
    CHAR_VERTICAL_TAB,
} from "@bearz/chars/constants";
import { isDigit, isLetter, isLetterOrDigit, isSpace } from "@bearz/chars";
import { CharArrayBuilder, toCharArray } from "@bearz/slices";

interface Marker {
    index: number;
    line: number;
    column: number;
}

export class Token {
    #kind: TokenKind;
    #value: Uint32Array;
    #start?: Marker;

    constructor(kind: TokenKind, value: Uint32Array, start?: Marker) {
        this.#kind = kind;
        this.#value = value;
        this.#start = start;
    }

    get kind(): TokenKind {
        return this.#kind;
    }

    get value(): Uint32Array {
        return this.#value;
    }

    get start(): Marker | undefined {
        return this.#start;
    }
}

export class CommentToken extends Token {
    constructor(value: Uint32Array, start?: Marker, inline = false) {
        super(TokenKind.Comment, value, start);
        this.inline = inline;
    }

    inline: boolean;
}

export class TextToken extends Token {
    constructor(value: Uint32Array, start?: Marker) {
        super(TokenKind.Text, value, start);
    }
}

export class IdentifierToken extends Token {
    constructor(value: Uint32Array, start?: Marker) {
        super(TokenKind.Identifier, value, start);
    }
}

export class KeywordToken extends Token {
    constructor(value: Uint32Array, kind: Keyword, start?: Marker) {
        super(TokenKind.Keyword, value, start);
        this.keyword = kind;
    }

    keyword: Keyword;
}

export class LiteralToken extends Token {
    constructor(value: Uint32Array, kind: LiteralKind, start?: Marker) {
        super(TokenKind.Literal, value, start);
        this.literal = kind;
    }

    literal: LiteralKind;
}

export class OperatorToken extends Token {
    constructor(value: Uint32Array, kind: OperatorKind, start?: Marker) {
        super(TokenKind.Operator, value, start);
        this.operator = kind;
    }

    operator: OperatorKind;
}

export class SeparatorToken extends Token {
    constructor(value: Uint32Array, kind: SeparatorKind, start?: Marker) {
        super(TokenKind.Separator, value, start);
        this.separator = kind;
    }

    separator: SeparatorKind;
}

export class InterpolatedStringToken extends Token {
    constructor(value: Uint32Array, children: Token[], start?: Marker) {
        super(TokenKind.InterpolatedString, value, start);
        this.children = children;
    }

    children: Token[];
}

export enum TemplateState {
    Text = 0,
    Comment = 1,
    ControlStatement = 2,
    Expression = 3,
}

export enum ExpressionState {
    None = 0,
    Identifier = 1,
    Literal = 2,
    Operator = 3,
    Separator = 4,
}

export enum SeparatorKind {
    None = -1,
    ControlStart = 0,
    ControlEnd = 1,
    ExpressionStart = 2,
    ExpressionEnd = 3,
    CommentStart = 4,
    CommentEnd = 5,
    LeftParen = 6,
    RightParent = 7,
    LeftBracket = 8,
    RightBracket = 9,
    LeftBrace = 10,
    RightBrace = 11,
    Comma = 6,
    Colon = 7,
    Semicolon = 8,
    Dot = 9,
    Pipe = 14,
}

export enum Keyword {
    Start = 0,
    End = 1,
    With = 2,
    Not = 3,
    In = 4,
    Every = 5,
    Some = 6,
    And = 7,
    Or = 8,
    Xor = 9,
    BinaryAnd = 10,
    BinaryOr = 11,
    BinaryXor = 12,
    Matches = 14,
    Has = 15,
    Is = 16,
}

export enum OperatorKeyword {
    And = 7,
    Or = 8,
    Xor = 9,
    BinaryAnd = 10,
    BinaryOr = 11,
    BinaryXor = 12,
}

export const KEYWORDS = new Map<Uint32Array, Keyword>([
    [toCharArray("start"), Keyword.Start],
    [toCharArray("end"), Keyword.End],
    [toCharArray("with"), Keyword.With],
    [toCharArray("not"), Keyword.Not],
    [toCharArray("in"), Keyword.In],
    [toCharArray("every"), Keyword.Every],
    [toCharArray("some"), Keyword.Some],
    [toCharArray("matches"), Keyword.Matches],
    [toCharArray("has"), Keyword.Has],
    [toCharArray("and"), Keyword.And],
    [toCharArray("or"), Keyword.Or],
    [toCharArray("is"), Keyword.Is],
    [toCharArray("xor"), Keyword.Xor],
    [toCharArray("binary_and"), Keyword.BinaryAnd],
    [toCharArray("binary_or"), Keyword.BinaryOr],
    [toCharArray("binary_xor"), Keyword.BinaryXor],
]);

export const OPERATOR_KEYWORDS = new Map<Uint32Array, OperatorKeyword>([
    [toCharArray("and"), OperatorKeyword.And],
    [toCharArray("or"), OperatorKeyword.Or],
    [toCharArray("xor"), OperatorKeyword.Xor],
    [toCharArray("binary_and"), OperatorKeyword.BinaryAnd],
    [toCharArray("binary_or"), OperatorKeyword.BinaryOr],
    [toCharArray("binary_xor"), OperatorKeyword.BinaryXor],
]);

export enum LiteralKind {
    StringLiteral = 0,
    String = 1,
    Number = 2,
    Boolean = 3,
    Null = 4,
    Hex = 5,
}

export enum OperatorKind {
    Assignment = 0,
    Addition = 1,
    Subtraction = 2,
    Multiplication = 3,
    Division = 4,
    Modulus = 5,
    Exponentiation = 6,
    LogicalAnd = 7,
    LogicalOr = 8,
    LogicalNot = 9,
    BitwiseAnd = 10,
    BitwiseOr = 11,
    BitwiseNot = 12,
    Equal = 13,
    NotEqual = 14,
    GreaterThan = 15,
    LessThan = 16,
    GreaterThanOrEqual = 17,
    LessThanOrEqual = 18,
    Ternary = 19,
    TernaryElse = 20,
}

export enum TokenKind {
    Identifier = 0,
    Comment = 10,
    Literal = 20,
    Keyword = 30,
    Separator = 40,
    Operator = 50,
    Text = 60,
    InterpolatedString = 70,
}

export class Reader implements Iterable<number> {
    #source: string;
    #position: number;
    #current: number;
    #line: number;
    #column: number;
    #recordNextPosition: boolean;
    #markers: Marker[] = [];

    constructor(source: string) {
        this.#source = source;
        this.#position = 0;
        this.#current = 0;
        this.#line = 1;
        this.#column = 1;
        this.#recordNextPosition = true;
    }

    get lastMarker(): Marker {
        return this.#markers[this.#markers.length - 1];
    }

    get markers(): Marker[] {
        return this.#markers;
    }

    get line(): number {
        return this.#line;
    }

    get column(): number {
        return this.#column;
    }

    get length(): number {
        return this.#source.length;
    }

    get position(): number {
        return this.#position;
    }

    get remaining(): number {
        return this.length - this.position;
    }

    get eof(): boolean {
        return this.position >= this.length;
    }

    get current(): number {
        return this.#current;
    }

    *[Symbol.iterator](): Iterator<number> {
        while (!this.eof) {
            yield this.read();
        }
    }

    /**
     * Instructs the reader to record the next position
     * when the next character is read by calling `next()`.
     */
    markNext(): void {
        this.#recordNextPosition = true;
    }

    mark(): Marker {
        const marker = { index: this.#position, line: this.#line, column: this.#column };
        this.#markers.push(marker);
        return marker;
    }

    next(): boolean {
        if (this.eof) {
            this.#current = 0;
            return false;
        }

        const old = this.#current;
        const c = this.#current = this.#source.charCodeAt(this.#position++);
        if (old === CHAR_LINE_FEED) {
            this.#line++;
            this.#column = 1;
        }

        // Handle CRLF for MacOS
        if (old === CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED) {
            this.#line++;
            this.#column = 1;
        }

        if (this.#recordNextPosition) {
            this.#recordNextPosition = false;
            this.mark();
        }

        return true;
    }

    read(): number {
        this.next();
        return this.current;
    }

    peek(advance = 1): number {
        if (this.eof) {
            return -1;
        }

        return this.#source.charCodeAt(this.#position + advance);
    }
}

export interface LexerContext {
    r: Reader;
    fileName?: string;
    cb: CharArrayBuilder;
    tokens: Token[];
    template: TemplateState;
    expression: ExpressionState;
    errors: Error[];
}

export interface LexerResult {
    tokens: Token[];
    errors: Error[];
}

export interface TwigLexErrorOptions extends ErrorOptions {
    marker?: Marker;
    file?: string;
}

export class TwigLexError extends Error {
    override name: string = "TwigLexerError";

    constructor(message?: string, options?: TwigLexErrorOptions) {
        super(message, options);
        this.marker = options?.marker;
        this.file = options?.file;
    }

    marker?: Marker;

    file?: string;
}

export function lex(source: string, fileName?: string): LexerResult {
    const ctx: LexerContext = {
        r: new Reader(source),
        fileName,
        errors: [],
        cb: new CharArrayBuilder(),
        tokens: [],
        template: TemplateState.Text,
        expression: ExpressionState.None,
    };

    while (!ctx.r.eof) {
        switch (ctx.template) {
            case TemplateState.Text:
                visitText(ctx);
                break;
            case TemplateState.Comment:
                vistComment(ctx);
                break;
            case TemplateState.ControlStatement:
            case TemplateState.Expression:
                visitBlock(ctx);
                break;
        }
    }

    return { tokens: ctx.tokens, errors: [] };
}

export function vistComment(ctx: LexerContext): void {
    const { r, cb, tokens, errors } = ctx;
    while (!r.eof) {
        const c = r.current;
        if (c === CHAR_PERCENT) {
            const n = r.peek();
            if (n === CHAR_RIGHT_CURLY_BRACKET) {
                // consume n
                r.next();
                cb.appendChar(c);
                cb.appendChar(n);
                r.next();
                tokens.push(new CommentToken(cb.toArray(), r.lastMarker, false));
                cb.clear();
                return;
            }
        }

        cb.appendChar(c);
        r.next();
    }

    errors.push(
        new TwigLexError("Unterminated comment block", {
            marker: r.lastMarker,
            file: ctx.fileName,
        }),
    );
}

export function visitBlock(ctx: LexerContext): void {
    const { r, cb, tokens, errors } = ctx;
    const tpl = ctx.template;
    while (!r.eof) {
        const c = r.current;

        if (
            tpl === TemplateState.ControlStatement && c === CHAR_PERCENT &&
            r.peek() === CHAR_RIGHT_CURLY_BRACKET
        ) {
            r.next(); // consume n
            tokens.push(
                new SeparatorToken(
                    new Uint32Array([c, CHAR_RIGHT_CURLY_BRACKET]),
                    SeparatorKind.ControlEnd,
                    r.lastMarker,
                ),
            );
            cb.clear();
            r.markNext();
            r.next();
            return;
        }

        if (
            tpl === TemplateState.Expression && c === CHAR_RIGHT_CURLY_BRACKET &&
            r.peek() === CHAR_RIGHT_CURLY_BRACKET
        ) {
            r.next(); // consume n
            tokens.push(
                new SeparatorToken(
                    new Uint32Array([c, CHAR_RIGHT_CURLY_BRACKET]),
                    SeparatorKind.ExpressionEnd,
                    r.lastMarker,
                ),
            );
            cb.clear();
            r.markNext();
            r.next();
            return;
        }

        visitSubExpression(c, ctx);

        // if current is } ... check to see if the previous token closes the block
        if (r.current === CHAR_RIGHT_CURLY_BRACKET && tokens.length > 0) {
            const last = tokens[tokens.length - 1];
            if (
                tpl === TemplateState.Expression && last instanceof SeparatorToken &&
                last.separator === SeparatorKind.RightBrace
            ) {
                last.separator = SeparatorKind.ExpressionEnd;
                cb.clear();
                r.markNext();
                r.next();
                return;
            } else if (
                tpl === TemplateState.ControlStatement && last instanceof OperatorToken &&
                last.operator === OperatorKind.Modulus
            ) {
                tokens.pop();
                tokens.push(
                    new SeparatorToken(
                        new Uint32Array([CHAR_PERCENT, CHAR_RIGHT_CURLY_BRACKET]),
                        SeparatorKind.ControlEnd,
                        r.lastMarker,
                    ),
                );
                cb.clear();
                r.markNext();
                r.next();
                return;
            }
        }
    }

    errors.push(
        new TwigLexError(
            `Unterminated ${
                tpl === TemplateState.ControlStatement ? "control" : "expression"
            } block`,
            { marker: r.lastMarker, file: ctx.fileName },
        ),
    );
}

export function visitSubExpression(c: number, ctx: LexerContext, t?: Token[]): void {
    const { r, cb, errors } = ctx;
    const tokens = t ?? ctx.tokens;

    if (isSpace(c)) {
        while (isSpace(r.peek())) {
            if (!r.next()) {
                return;
            }
        }

        // its up to the caller to handle invalid termination of the expression
        if (r.eof) {
            return;
        }

        // continue
        c = r.current;
    }

    // comment
    if (c === CHAR_HASH) {
        r.mark();
        cb.appendChar(c);
        r.next();
        visitInlineComment(ctx);
        return;
    }

    // string literal, no interpolation
    if (c === CHAR_SINGLE_QUOTE) {
        r.mark();
        r.next();
        visitStringLiteral(ctx);
        return;
    }

    // string literal, possible interpolation
    if (c === CHAR_DOUBLE_QUOTE) {
        r.mark();
        r.next();
        visitString(ctx);
    }

    // number
    if (isDigit(c)) {
        r.mark();
        cb.appendChar(c);
        r.next();
        visitNumber(ctx);
        return;
    }

    // identifier, keyword, or operator keyword
    if (isLetter(c)) {
        r.mark();
        cb.appendChar(c);
        r.next();
        visitIdentifier(ctx);
        return;
    }

    switch (c) {
        case CHAR_PLUS:
            tokens.push(
                new OperatorToken(
                    new Uint32Array([CHAR_PLUS]),
                    OperatorKind.Addition,
                    r.lastMarker,
                ),
            );
            r.markNext();
            r.next();
            return;
        case CHAR_HYPHEN_MINUS:
            tokens.push(
                new OperatorToken(
                    new Uint32Array([CHAR_HYPHEN_MINUS]),
                    OperatorKind.Subtraction,
                    r.lastMarker,
                ),
            );
            r.markNext();
            r.next();
            return;
        case CHAR_ASTERISK:
            if (r.peek() === CHAR_ASTERISK) {
                tokens.push(
                    new OperatorToken(
                        new Uint32Array([CHAR_ASTERISK, CHAR_ASTERISK]),
                        OperatorKind.Exponentiation,
                        r.lastMarker,
                    ),
                );
                // consume n
                r.next();
                r.markNext();
                r.next();
                return;
            } else {
                tokens.push(
                    new OperatorToken(
                        new Uint32Array([CHAR_ASTERISK]),
                        OperatorKind.Multiplication,
                        r.lastMarker,
                    ),
                );
                r.markNext();
                r.next();
                return;
            }

        case CHAR_FORWARD_SLASH:
            tokens.push(
                new OperatorToken(
                    new Uint32Array([CHAR_FORWARD_SLASH]),
                    OperatorKind.Division,
                    r.lastMarker,
                ),
            );
            r.markNext();
            r.next();
            return;

        case CHAR_PERCENT:
            tokens.push(
                new OperatorToken(
                    new Uint32Array([CHAR_PERCENT]),
                    OperatorKind.Modulus,
                    r.lastMarker,
                ),
            );
            r.markNext();
            r.next();
            return;

        case CHAR_EQUAL:
            if (r.peek() === CHAR_EQUAL) {
                tokens.push(
                    new OperatorToken(
                        new Uint32Array([CHAR_EQUAL, CHAR_EQUAL]),
                        OperatorKind.Equal,
                        r.lastMarker,
                    ),
                );
                // consume n
                r.next();
                r.markNext();
                r.next();
                return;
            } else {
                tokens.push(
                    new OperatorToken(
                        new Uint32Array([CHAR_EQUAL]),
                        OperatorKind.Assignment,
                        r.lastMarker,
                    ),
                );
                r.markNext();
                r.next();
                return;
            }

        case CHAR_DOT:
            tokens.push(
                new SeparatorToken(new Uint32Array([CHAR_DOT]), SeparatorKind.Dot, r.lastMarker),
            );
            r.markNext();
            r.next();
            return;

        case CHAR_LEFT_CURLY_BRACKET:
            tokens.push(
                new SeparatorToken(
                    new Uint32Array([CHAR_LEFT_CURLY_BRACKET]),
                    SeparatorKind.LeftBrace,
                    r.lastMarker,
                ),
            );
            r.markNext();
            r.next();
            return;

        case CHAR_RIGHT_CURLY_BRACKET:
            tokens.push(
                new SeparatorToken(
                    new Uint32Array([CHAR_RIGHT_CURLY_BRACKET]),
                    SeparatorKind.RightBrace,
                    r.lastMarker,
                ),
            );
            r.markNext();
            r.next();
            return;

        case CHAR_LEFT_SQUARE_BRACKET:
            tokens.push(
                new SeparatorToken(
                    new Uint32Array([CHAR_LEFT_SQUARE_BRACKET]),
                    SeparatorKind.LeftBracket,
                    r.lastMarker,
                ),
            );
            r.markNext();
            r.next();
            return;

        case CHAR_RIGHT_SQUARE_BRACKET:
            tokens.push(
                new SeparatorToken(
                    new Uint32Array([CHAR_RIGHT_SQUARE_BRACKET]),
                    SeparatorKind.RightBrace,
                    r.lastMarker,
                ),
            );
            r.markNext();
            r.next();
            return;

        case CHAR_LEFT_PAREN:
            tokens.push(
                new SeparatorToken(
                    new Uint32Array([CHAR_LEFT_PAREN]),
                    SeparatorKind.LeftParen,
                    r.lastMarker,
                ),
            );
            r.markNext();
            r.next();
            return;

        case CHAR_RIGHT_PAREN:
            tokens.push(
                new SeparatorToken(
                    new Uint32Array([CHAR_RIGHT_PAREN]),
                    SeparatorKind.RightParent,
                    r.lastMarker,
                ),
            );
            r.markNext();
            r.next();
            return;

        case CHAR_VERTICAL_LINE:
            tokens.push(
                new SeparatorToken(
                    new Uint32Array([CHAR_VERTICAL_LINE]),
                    SeparatorKind.Pipe,
                    r.lastMarker,
                ),
            );
            r.markNext();
            r.next();
            return;

        case CHAR_EXCLAMATION_MARK:
            if (r.peek() === CHAR_EQUAL) {
                tokens.push(
                    new OperatorToken(
                        new Uint32Array([CHAR_EXCLAMATION_MARK, CHAR_EQUAL]),
                        OperatorKind.NotEqual,
                        r.lastMarker,
                    ),
                );
                // consume n
                r.next();
                r.markNext();
                r.next();
                return;
            } else {
                errors.push(
                    new TwigLexError("Invalid operator '!'", {
                        marker: r.lastMarker,
                        file: ctx.fileName,
                    }),
                );
            }
            return;

        case CHAR_LEFT_ANGLE_BRACKET:
            if (r.peek() === CHAR_EQUAL) {
                tokens.push(
                    new OperatorToken(
                        new Uint32Array([CHAR_LEFT_ANGLE_BRACKET, CHAR_EQUAL]),
                        OperatorKind.LessThanOrEqual,
                        r.lastMarker,
                    ),
                );
                // consume n
                r.next();
                r.markNext();
                r.next();
                return;
            } else {
                tokens.push(
                    new OperatorToken(
                        new Uint32Array([CHAR_LEFT_ANGLE_BRACKET]),
                        OperatorKind.LessThan,
                        r.lastMarker,
                    ),
                );
                r.markNext();
                r.next();
                return;
            }

        case CHAR_RIGHT_ANGLE_BRACKET:
            if (r.peek() === CHAR_EQUAL) {
                tokens.push(
                    new OperatorToken(
                        new Uint32Array([CHAR_RIGHT_ANGLE_BRACKET, CHAR_EQUAL]),
                        OperatorKind.GreaterThanOrEqual,
                        r.lastMarker,
                    ),
                );
                // consume n
                r.next();
                r.markNext();
                r.next();
                return;
            } else {
                tokens.push(
                    new OperatorToken(
                        new Uint32Array([CHAR_RIGHT_ANGLE_BRACKET]),
                        OperatorKind.GreaterThan,
                        r.lastMarker,
                    ),
                );
                r.markNext();
                r.next();
                return;
            }

        case CHAR_QUESTION_MARK:
            if (r.peek() === CHAR_COLON) {
                tokens.push(
                    new OperatorToken(
                        new Uint32Array([CHAR_QUESTION_MARK, CHAR_COLON]),
                        OperatorKind.TernaryElse,
                        r.lastMarker,
                    ),
                );
                // consume n
                r.next();
                r.markNext();
                r.next();
                return;
            } else {
                tokens.push(
                    new OperatorToken(
                        new Uint32Array([CHAR_QUESTION_MARK]),
                        OperatorKind.Ternary,
                        r.lastMarker,
                    ),
                );
                r.markNext();
                r.next();
                return;
            }

        case CHAR_COLON:
            tokens.push(
                new SeparatorToken(
                    new Uint32Array([CHAR_COLON]),
                    SeparatorKind.Colon,
                    r.lastMarker,
                ),
            );
            r.markNext();
            r.next();
            return;

        case CHAR_COMMA:
            tokens.push(
                new SeparatorToken(
                    new Uint32Array([CHAR_COMMA]),
                    SeparatorKind.Comma,
                    r.lastMarker,
                ),
            );
            r.markNext();
            r.next();
            return;

        case CHAR_SEMICOLON:
            tokens.push(
                new SeparatorToken(
                    new Uint32Array([CHAR_SEMICOLON]),
                    SeparatorKind.Semicolon,
                    r.lastMarker,
                ),
            );
            r.markNext();
            r.next();
            return;

        default:
            r.markNext();
            r.next();
            // its up to the caller to handle invalid termination of the expression
            return;
    }
}

export function visitIdentifier(ctx: LexerContext): void {
    const { r, cb, tokens, errors } = ctx;
    while (!ctx.r.eof) {
        if (!(isLetterOrDigit(ctx.r.current) || ctx.r.current === CHAR_UNDERSCORE)) {
            const id = cb.toArray();
            if (KEYWORDS.has(id)) {
                if (OPERATOR_KEYWORDS.has(id)) {
                    //
                    const kind = OPERATOR_KEYWORDS.get(id)! as number;
                    tokens.push(new OperatorToken(id, kind, r.lastMarker));
                } else {
                    tokens.push(new KeywordToken(id, KEYWORDS.get(id)!, r.lastMarker));
                }
            } else {
                tokens.push(new IdentifierToken(id, r.lastMarker));
            }

            cb.clear();
            r.mark();

            return;
        }

        cb.appendChar(r.current);
        r.next();
    }

    errors.push(
        new TwigLexError("Unterminated identifier", { marker: r.lastMarker, file: ctx.fileName }),
    );
}

export function visitNumber(ctx: LexerContext): void {
    const { r, cb, tokens, errors } = ctx;
    let dotCount = 0;
    while (!r.eof) {
        const c = r.current;
        if (isDigit(c)) {
            cb.appendChar(c);
            r.next();
            continue;
        }

        if (c === CHAR_DOT) {
            if (dotCount > 0) {
                errors.push(
                    new TwigLexError("Invalid number literal. Numbers may only contain one dot.", {
                        marker: r.lastMarker,
                        file: ctx.fileName,
                    }),
                );
                return;
            }

            dotCount++;
            cb.appendChar(c);
        }

        // TODO: Handle scientific notation
        if (isLetter(c)) {
            errors.push(
                new TwigLexError("Invalid number literal", {
                    marker: r.lastMarker,
                    file: ctx.fileName,
                }),
            );
            return;
        }

        // anything else is a separator
        tokens.push(new LiteralToken(cb.toArray(), LiteralKind.Number, r.lastMarker));
        cb.clear();
        r.markNext();
        r.next();
        return;
    }
}

export function visitStringLiteral(ctx: LexerContext): void {
    const { r, cb, tokens, errors } = ctx;

    if (r.current === CHAR_SINGLE_QUOTE) {
        r.next();
    }

    while (!r.eof) {
        const c = r.current;
        if (c === CHAR_SINGLE_QUOTE) {
            tokens.push(new LiteralToken(cb.toArray(), LiteralKind.StringLiteral, r.lastMarker));
            cb.clear();
            r.markNext();
            r.next();
            return;
        }

        cb.appendChar(c);
        r.next();
    }

    errors.push(
        new TwigLexError("Unterminated string literal", {
            marker: r.lastMarker,
            file: ctx.fileName,
        }),
    );
}

export function visitString(ctx: LexerContext): void {
    const { r, cb, tokens, errors } = ctx;

    if (r.current === CHAR_DOUBLE_QUOTE) {
        r.next();
    }

    const childTokens: Token[] = [];

    while (!r.eof) {
        const c = r.current;
        if (c === CHAR_DOUBLE_QUOTE) {
            if (childTokens.length > 0) {
                childTokens.push(
                    new LiteralToken(cb.toArray(), LiteralKind.StringLiteral, r.lastMarker),
                );
                cb.clear();
                childTokens.forEach((t) => cb.appendCharArray(t.value));

                tokens.push(
                    new InterpolatedStringToken(cb.toArray(), childTokens, childTokens[0].start),
                );
                cb.clear();
            } else {
                tokens.push(new LiteralToken(cb.toArray(), LiteralKind.String, r.lastMarker));
                cb.clear();
            }

            cb.clear();
            r.markNext();
            r.next();
            return;
        }

        // handle escape sequences
        if (c === CHAR_BACKWARD_SLASH) {
            const n = r.peek();
            switch (n) {
                // \#{0}  escape interpolation
                case CHAR_HASH:
                    if (r.peek(2) === CHAR_LEFT_CURLY_BRACKET) {
                        r.next();
                        cb.appendChar(CHAR_HASH);
                        r.next();
                        cb.appendChar(CHAR_LEFT_CURLY_BRACKET);
                        r.next();
                        continue;
                    }
                    break;

                case CHAR_BACKWARD_SLASH:
                    cb.appendChar(CHAR_BACKWARD_SLASH);
                    r.next();
                    continue;

                case CHAR_DOUBLE_QUOTE:
                    cb.appendChar(CHAR_DOUBLE_QUOTE);
                    r.next();
                    continue;

                case 116:
                    // \t
                    cb.appendChar(CHAR_TAB);
                    r.next();
                    continue;

                case 118:
                    // \v
                    cb.appendChar(CHAR_VERTICAL_TAB);
                    r.next();
                    continue;

                case 114:
                    // \r
                    cb.appendChar(CHAR_CARRIAGE_RETURN);
                    r.next();
                    continue;

                case 102:
                    // \f
                    cb.appendChar(CHAR_FORM_FEED);
                    r.next();
                    continue;

                case 110:
                    // \n
                    cb.appendChar(CHAR_LINE_FEED);
                    r.next();
                    continue;

                // \x hex e.g. \x20
                case 120:
                    {
                        // hex
                        r.next();
                        const hex = new CharArrayBuilder();
                        hex.appendChar(48).appendChar(120);

                        while (!r.eof) {
                            const h = r.current;
                            if (isDigit(h) || (h >= 65 && h <= 70) || (h >= 97 && h <= 102)) {
                                hex.appendChar(h);
                                r.next();
                                continue;
                            }

                            break;
                        }

                        if (hex.length % 2 !== 0) {
                            errors.push(
                                new TwigLexError(`Invalid hex escape sequence ${hex.toString()}`, {
                                    marker: r.lastMarker,
                                    file: ctx.fileName,
                                }),
                            );
                            return;
                        }

                        cb.appendChar(Number.parseInt(hex.toString(), 16));
                    }
                    continue;
            }
        }

        // handle interpolation e.g. #{
        if (c === CHAR_HASH && r.peek() === CHAR_LEFT_CURLY_BRACKET) {
            if (cb.length > 0) {
                childTokens.push(
                    new LiteralToken(cb.toArray(), LiteralKind.StringLiteral, r.lastMarker),
                );
                cb.clear();
            }

            r.next(); // consume n
            r.markNext();
            r.next();
            let exprEnded = false;
            while (!r.eof) {
                // handle } end of interpolation
                if (r.current === CHAR_RIGHT_CURLY_BRACKET) {
                    r.markNext();
                    r.next();
                    exprEnded = true;
                    break;
                }

                visitSubExpression(r.current, ctx, childTokens);

                // check to see if the last token ends the interpolation expression e.g. }
                if (childTokens.length > 0) {
                    const last = childTokens[childTokens.length - 1];
                    if (
                        last instanceof SeparatorToken &&
                        last.separator === SeparatorKind.RightBrace
                    ) {
                        childTokens.pop();
                        r.markNext();
                        r.next();
                        exprEnded = true;
                        break;
                    }
                }
            }

            if (!exprEnded) {
                errors.push(
                    new TwigLexError("Unterminated string interpolation expression", {
                        marker: r.lastMarker,
                        file: ctx.fileName,
                    }),
                );
                return;
            }

            continue;
        }

        cb.appendChar(c);
        r.next();
    }

    errors.push(
        new TwigLexError("Unterminated string literal", {
            marker: r.lastMarker,
            file: ctx.fileName,
        }),
    );
}

export function visitInlineComment(ctx: LexerContext): void {
    const { r, cb, tokens, errors } = ctx;
    while (!r.eof) {
        const c = r.current;

        if (c === CHAR_LINE_FEED) {
            tokens.push(new CommentToken(cb.toArray(), r.lastMarker, true));
            cb.clear();
            r.markNext();
            r.next();
            return;
        }

        if (c === CHAR_CARRIAGE_RETURN && r.peek() === CHAR_LINE_FEED) {
            tokens.push(new CommentToken(cb.toArray(), r.lastMarker, true));
            cb.clear();
            // consume n
            r.next();
            // mark next pos
            r.markNext;
            r.next();
            return;
        }

        cb.appendChar(c);
        r.next();
    }

    errors.push(
        new TwigLexError("Unterminated inline comment block", {
            marker: r.lastMarker,
            file: ctx.fileName,
        }),
    );
}

export function visitText(ctx: LexerContext): void {
    const { r, cb, tokens } = ctx;
    while (!r.eof) {
        const c = r.current;
        if (c === CHAR_LEFT_CURLY_BRACKET) {
            const n = r.peek();
            let end = false;
            let kind = SeparatorKind.None;
            switch (n) {
                case CHAR_HASH:
                    end = true;
                    ctx.template = TemplateState.Comment;
                    kind = SeparatorKind.CommentStart;
                    break;
                case CHAR_PERCENT:
                    end = true;
                    ctx.template = TemplateState.ControlStatement;
                    kind = SeparatorKind.ControlStart;
                    break;
                case CHAR_LEFT_CURLY_BRACKET:
                    end = true;
                    ctx.template = TemplateState.Expression;
                    kind = SeparatorKind.ExpressionStart;
                    break;
            }

            if (end) {
                tokens.push(new TextToken(cb.toArray(), r.lastMarker));
                cb.clear();

                // consume n
                r.next();

                tokens.push(new SeparatorToken(new Uint32Array([c, n]), kind, r.lastMarker));

                r.markNext();
                r.next();
                return;
            }
        }

        cb.appendChar(c);
        r.next();
    }

    tokens.push(new TextToken(cb.toArray(), r.lastMarker));
}
