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

interface Text_ { // _ to avoid collision with built in Text type
    chars: Char[];
    cursor: number;
    html: HTMLParagraphElement;
}

function charSetState(c: Char, s: CharState): void {
    c.state = CharState.NOT_ENTERED;

    switch (s) {
    case CharState.NOT_ENTERED:
        c.html.style.background = "gray";
        break;
    case CharState.CORRECT:
        c.html.style.background = "green";
        break;
    case CharState.INCORRECT:
        c.html.style.background = "red";
        break;
    default:
        const unhandled_case: never = s;
        console.log(unhandled_case);
    }
}

function textInit(s: string): Text_ {
    const text: Text_ = {
        chars: [],
        cursor: 0,
        html: document.createElement("p")
    };

    for (let i = 0; i < s.length; i++) {
        const char: Char = {
            symbol: s[i]!,
            state: CharState.NOT_ENTERED,
            html: document.createElement("span")
        };

        char.html.textContent = char.symbol;
        char.html.style.background = "gray";

        text.chars.push(char);
        text.html.appendChild(char.html);
    }

    return text;
}

function textBack(t: Text_): void {
    if (t.cursor === 0) {
        return;
    }

    charSetState(t.chars[--t.cursor]!, CharState.NOT_ENTERED);
}

function textForward(t: Text_, ch: string): void {
    if (t.cursor === t.chars.length) {
        return;
    }

    const char = t.chars[t.cursor++]!;

    charSetState(char, CharState.INCORRECT);
    if (char.symbol === ch) {
        charSetState(char, CharState.CORRECT);
    }
}

const text = textInit("Hello, world! This is some random text to type to. Let's do this!");
document.body.appendChild(text.html);

window.addEventListener("keydown", (event) => {
    if (event.key === "Backspace") {
        textBack(text);
        return;
    }

    // accept only characters
    if (event.key.length > 1) {
        return;
    }

    textForward(text, event.key);
});
