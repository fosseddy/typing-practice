const enum CharState {
    NOT_ENTERED,
    CORRECT,
    INCORRECT
}

interface Char {
    symbol: string;
    special: string | null;
    state: CharState;
    html: HTMLSpanElement;
}

interface Cursor {
    value: number;
    html: HTMLSpanElement;
}

interface Text_ { // _ to avoid collision with built in Text type
    chars: Char[];
    cursor: Cursor;
    html: HTMLPreElement;
}

const charStateColor: Record<CharState, string> = {
    [CharState.NOT_ENTERED]: "gray",
    [CharState.CORRECT]: "black",
    [CharState.INCORRECT]: "red"
};

function charSetState(c: Char, s: CharState): void {
    let fg = charStateColor[s];
    let bg = "white";

    if (s === CharState.INCORRECT) {
        [fg, bg] = [bg, fg] // swap
    }

    c.state = s;
    c.html.style.color = fg;
    c.html.style.background = bg;
}

function charSymbol(c: Char): string {
    return c.special ?? c.symbol;
}

function textInit(s: string): Text_ {
    const text: Text_ = {
        chars: [],
        cursor: {
            value: 0,
            html: document.createElement("span")
        },
        html: document.createElement("pre")
    };

    for (let i = 0; i < s.length; i++) {
        const char: Char = {
            symbol: s[i]!,
            special: null,
            state: CharState.NOT_ENTERED,
            html: document.createElement("span")
        };

        char.html.textContent = char.symbol;
        char.html.style.color = charStateColor[char.state];

        if (char.symbol === "\n" || char.symbol === "\t") {
            const span = document.createElement("span");
            let ch = "↵";

            if (char.symbol === "\t") {
                ch = "»";
            }

            span.textContent = ch;

            char.special = ch;
            char.html.prepend(span);
        }

        text.chars.push(char);
        text.html.appendChild(char.html);
    }

    text.html.style.position = "relative";
    text.html.style.fontSize = "1rem";

    text.cursor.html.style.position = "absolute";
    text.cursor.html.style.color = "white";
    text.cursor.html.style.background = "black";

    // art, 06.10.24: assuming text always has at least one char
    const first = text.chars[0]!;

    text.cursor.html.textContent = charSymbol(first);
    first.html.before(text.cursor.html);

    return text;
}

function textBack(t: Text_): void {
    if (t.cursor.value === 0) {
        return;
    }

    const char = t.chars[--t.cursor.value]!;

    charSetState(char, CharState.NOT_ENTERED);
    text.cursor.html.textContent = charSymbol(char);
    char.html.before(text.cursor.html);
}

function textForward(t: Text_, ch: string): void {
    if (t.cursor.value === t.chars.length) {
        return;
    }

    const char = t.chars[t.cursor.value++]!;
    let state = CharState.INCORRECT;

    if (char.symbol === ch) {
        state = CharState.CORRECT;
    }

    charSetState(char, state);

    const nextchar = t.chars[t.cursor.value];
    let sym = " ";

    if (nextchar) {
        sym = charSymbol(nextchar);
    }

    text.cursor.html.textContent = sym;
    char.html.after(text.cursor.html);
}

const text = textInit(`\nToday's Internet\n\tis arguably the largest engineered system ever created by mankind.`);

//const text = textInit(`Today's Internet is arguably the largest engineered system ever created by mankind,
//with hundreds of millions of connected computers, communication links, and
//switches; with billions of users who connect via laptops, tablets, and smartphones;
//and with an array of new Internet-connected "things" including game consoles,
//surveillance systems, watches, eye glasses, thermostats, and cars.

//Given that the Internet is so large and has so many diverse components and uses, is there any hope of
//understanding how it works? Are there guiding principles and structure that can
//provide a foundation for understanding such an amazingly large and complex system?
//And if so, is it possible that it actually could be both interesting and fun to
//learn about computer networks? Fortunately, the answer to all of these questions is
//a resounding YES! Indeed, it's our aim in this book to provide you with a modern
//introduction to the dynamic field of computer networking, giving you the principles and
//practical insights you'll need to understand not only today's networks, but tomorrow's as well.`);

document.body.appendChild(text.html);

window.addEventListener("keydown", (event) => {
    let key = event.key;

    if (key === "Enter") {
        key = "\n";
    } else if (key === "Tab") {
        event.preventDefault();
        key = "\t";
    } else if (key === " ") {
        event.preventDefault();
    } else if (key === "Backspace") {
        textBack(text);
        return;
    }

    // accept only characters
    if (key.length > 1) {
        return;
    }

    textForward(text, key);
});
