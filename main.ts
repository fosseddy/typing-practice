const enum CharState {
    NOT_ENTERED,
    CORRECT,
    INCORRECT
}

interface Char {
    symbol: string;
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

function charSetState(c: Char, s: CharState): void {
    const old  = c.state;
    c.state = s;
    c.html.classList.replace(`char-state-${old}`, `char-state-${c.state}`);
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
            state: CharState.NOT_ENTERED,
            html: document.createElement("span")
        };

        char.html.textContent = char.symbol;
        char.html.classList.add(`char-state-${char.state}`);

        if (char.symbol === "\n" || char.symbol === "\t") {
            const span = document.createElement("span");
            let ch = "\\n";

            if (char.symbol === "\t") {
                ch = "\\t";
            }

            span.textContent = ch;
            char.html.prepend(span);
        }

        text.chars.push(char);
        text.html.appendChild(char.html);
    }

    text.html.classList.add("text");
    text.cursor.html.classList.add("cursor");

    text.cursor.html.appendChild(document.createTextNode(" "));
    text.chars[0]!.html.before(text.cursor.html); // assuming text always has chars

    return text;
}

function textBack(t: Text_): void {
    if (t.cursor.value === 0) {
        return;
    }

    const char = t.chars[--t.cursor.value]!;

    charSetState(char, CharState.NOT_ENTERED);
    char.html.before(text.cursor.html);
}

function textForward(t: Text_, ch: string): void {
    if (t.cursor.value === t.chars.length) {
        return;
    }

    const char = t.chars[t.cursor.value++]!;

    charSetState(char, CharState.INCORRECT);
    if (char.symbol === ch) {
        charSetState(char, CharState.CORRECT);
    }

    char.html.after(text.cursor.html);
}

const text = textInit("Hello, world!\nThis is some random text to type to.\n\tLet's do this!");

document.body.appendChild(text.html);

window.addEventListener("keydown", (event) => {
    let key = event.key;

    if (key === "Enter") {
        key = "\n";
    } else if (key === "Tab") {
        event.preventDefault();
        key = "\t";
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
