# Director: An "easier" way to execute hooks

Director is an "easier" way to execute functions, scripts, and hooks within your AI Dungeon scripting scenarios.

Director executes provided `modifier` functions in a _chain_ (`FuncA => FuncB => etc.`). The return value(s) are then _passed down_ to the next function.

_Example Usage:_

```js
// { Scripts > Input }

const fn = (text) => {
  text = 'My example.';
  return { text };
};
const fnA = (text) => {
  text += ' function A.';
  return { text };
};
const fnB = (text) => {
  text += ' function B.';
  return { text };
};
const fnC = (text) => {
  text += ' function C.';
  return { text };
};

// Output: "My example. function A. function B. function C."
director.input(fnA, fnB, fnC);

// Alternatives

/*
load('input', fnA, fnB, fnC);

director.load('input', fnA, fnB, fnC);

director.onInput(fnA, fnB, fnC);
*/

// Always add `void 0` to the bottom of Scripts > *
void 0
```

---

## Installation

> For scenario creators, recommend using my "[Types for Scripting API](<https://github.com/magicoflolis/aidungeon.js/blob/main/Scripting%20Guidebook.md#types-for-scripting-api>)" along side.

Copy and paste [Source code](<https://raw.githubusercontent.com/magicoflolis/aidungeon.js/refs/heads/main/scripting/director.js>) into `Shared Library > Library`.

_Example Usage:_

```js
// { Shared Library > Library }

//#region Director

// { Director source code }

//#endregion

const stateA = () => {
  state.fooA = 'barA'
};
const stateB = () => {
  state.fooB = 'barB'
};
const stateC = () => {
  state.fooC = 'barC'
};

director.library(stateA, stateB, stateC);

/*
// Equivalent to

stateA();
stateB();
stateC();
*/

// Output: state: { "fooA": "barA", "fooB": "barB", "fooC": "barC", ... }
log(state);

// Output: "barA"
log(state.fooA);

// Output: "barB"
log(state.fooB);

// Output: "barC"
log(state.fooC);
```

**Hooks (Input/Context/Output):**

> [!IMPORTANT]
> Ensure `void 0` is **ALWAYS** present at the bottom of your hooks! _Or just add `//` as the last line.
>
> Remove/rename your `modifier` function! _Example: `const modifier` => `const fn`_
>
> Remove/replace all `modifier(text)` lines.

`Scripts > Input`

```js
const fn = (text) => {
  return { text };
};

director.input(fn); // `onInput` hook

// Always add `void 0` to the bottom of Scripts > *
void 0

/*
// Alternative

// Surround `modifier()` in curly brackets `{ }`
{
  const modifier = (text) => {
    return { text }
  }

  // Replace `modifier(text)` line
  director.input(modifier)
}
// Always add `void 0` to the bottom of Scripts > *
void 0
*/
```

`Scripts > Context`

```js
const fn = (text) => {
  return { text };
};

director.context(fn); // `onModelContext` hook

// Always add `void 0` to the bottom of Scripts > *
void 0
```

`Scripts > Output`

```js
const fn = (text) => {
  return { text };
};

director.output(fn); // `onOutput` hook

// Always add `void 0` to the bottom of Scripts > *
void 0
```

---

## API & Usages

<details>
  <summary>Modifier Functions</summary>

```ts
function ModifierFN<T extends typeof text, S extends typeof stop>(this: typeof Director, text: T, stop: S, type: "library"): {
  text: T;
  stop?: S;
};
```

```js
/**
 * @typedef { <T extends unknown, S extends boolean>(this: typeof Director, text: T, stop?: S, type: 'output') => { text: T; stop?: S } } ModifierFN
 */

/**
 * @type { ModifierFN }
 */
const fn = function (text, stop, type) {
  // Note using "this" is typeof Director
  console.log(this.text, text, stop, type);
  return { text, stop }
}
```

---

</details>

<br>

<details>
  <summary>Parameter: Strings</summary>

```js
// { Scripts > Output }

const fn = () => 'My character will ';
const fnStr = '(text) => { return { text: "Draw a card " } }';
const myFunction = (text) => {
  text += 'then pause the story.';
  return { text };
};

// Output: "My character will draw a card then pause the story."
director.output(fn, fnStr, myFunction.toString());

void 0
```

---

</details>

<br>

<details>
  <summary>Return: Array[]</summary>

```js
// { Scripts > Context }

const arr = () => {
  return ['My text.', true];
};

// Output: "stop" & stop = true
director.context(arr);

void 0
```

---

</details>

<br>

<details>
  <summary>AutoCards</summary>

_Yes it works with AutoCards._

`Shared Library > Library`

```js
//#region Director

// { Director source code }

//#endregion

/** Replace `AutoCards(null);` line with `director.library(AutoCards);` */
function AutoCards() {} director.library(AutoCards);

/** Add the rest of your library functions if any */
const libFn = () => {
  // Some other library function
}
director.library(libFn);
```

`Scripts > Input`

```js
/*
// Minimal

director.input(AutoCards);

void 0
*/

const fn = (text) => {
  // { your modifier code }
  return { text };
};

director.input(AutoCards, fn); // `onInput` hook

// Always add `void 0` to the bottom of Scripts > *
void 0

/*
// Alternative

// Surround `modifier()` in curly brackets `{ }`
{
  const modifier = (text) => {
    text = AutoCards("input", text)
    // { your modifier code }
    return { text }
  }

  // Replace `modifier(text)` line
  director.input(modifier)
}

// Always add `void 0` to the bottom of Scripts > *
void 0
*/
```

`Scripts > Context`

```js
/*
// Minimal

director.context(AutoCards);

void 0
*/

const fn = (text) => {
  // { your modifier code }
  return { text };
};

director.context(AutoCards, fn); // `onModelContext` hook

// Always add `void 0` to the bottom of Scripts > *
void 0

/*
// Alternative

// Surround `modifier()` in curly brackets `{ }`
{
  const modifier = (text) => {
    [text, stop] = AutoCards("context", text, stop)
    // { your modifier code }
    return { text, stop }
  }

  // Replace `modifier(text)` line
  director.context(modifier)
}

// Always add `void 0` to the bottom of Scripts > *
void 0
*/
```

`Scripts > Output`

```js
/*
// Minimal

director.output(AutoCards);

void 0
*/

const fn = (text) => {
  // { your modifier code }
  return { text };
};

director.output(AutoCards, fn); // `onOutput` hook

// Always add `void 0` to the bottom of Scripts > *
void 0

/*
// Alternative

// Surround `modifier()` in curly brackets `{ }`
{
  const modifier = (text) => {
    text = AutoCards("output", text)
    // { your modifier code }
    return { text, stop }
  }

  // Replace `modifier(text)` line
  director.output(modifier)
}

// Always add `void 0` to the bottom of Scripts > *
void 0
*/
```

---

</details>

<br>
