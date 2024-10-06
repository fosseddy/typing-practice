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

const charStateColors: Record<CharState, string> = {
    [CharState.NOT_ENTERED]: "gray",
    [CharState.CORRECT]: "black",
    [CharState.INCORRECT]: "red"
};

function charSetState(c: Char, s: CharState): void {
    let color = charStateColors[s];

    c.state = s;
    if (c.state === CharState.INCORRECT) {
        c.html.style.color = "white";
        c.html.style.background = color;
    } else {
        c.html.style.color = color;
        c.html.style.background = "white";
    }
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
        char.html.style.color = charStateColors[char.state];

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

    text.html.style.position = "relative";
    text.html.style.fontSize = "1rem";

    text.cursor.html.style.position = "absolute";
    text.cursor.html.style.background = "black";

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

const text = textInit(`Today's Internet is arguably the largest engineered system ever created by mankind,
with hundreds of millions of connected computers, communication links, and
switches; with billions of users who connect via laptops, tablets, and smartphones;
and with an array of new Internet-connected "things" including game consoles,
surveillance systems, watches, eye glasses, thermostats, and cars.

Given that the Internet is so large and has so many diverse components and uses, is there any hope of
understanding how it works? Are there guiding principles and structure that can
provide a foundation for understanding such an amazingly large and complex system?
And if so, is it possible that it actually could be both interesting and fun to
learn about computer networks? Fortunately, the answer to all of these questions is
a resounding YES! Indeed, it's our aim in this book to provide you with a modern
introduction to the dynamic field of computer networking, giving you the principles and
practical insights you'll need to understand not only today's networks, but tomorrow's as well.`);

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
