# culina-utils

Reusable utilities for the [Culina](https://github.com/PEKKA367/Culina) recipe app.

Currently ships two ES module exports built around a round-robin generator and a
timeout-driven consumer ("carousel"). The package is consumed by the `frontend/`
project of the Culina monorepo via a local `file:` dependency.

## Installation

`culina-utils` is published as a local package inside the Culina monorepo. The
`frontend/` workspace declares it as a file-protocol dependency:

```json
// frontend/package.json
{
  "dependencies": {
    "culina-utils": "file:../core-utils"
  }
}
```

After cloning the repo run `npm install` inside `frontend/` to materialise the
symlink:

```bash
cd frontend
npm install
```

From that point on the library is imported by its package name, not by a
relative path:

```js
// ✅
import { recipeGenerator, spinTheCarousel } from "culina-utils";

// ❌
import { recipeGenerator } from "../../core-utils/iterator.js";
```

## Usage

### `recipeGenerator(items)`

Returns an infinite round-robin iterator over the supplied array. Each call to
`.next()` yields the next element; the index wraps back to zero when the end of
the array is reached.

```js
import { recipeGenerator } from "culina-utils";

const gen = recipeGenerator(["A", "B", "C"]);
gen.next().value; // "A"
gen.next().value; // "B"
gen.next().value; // "C"
gen.next().value; // "A"  (wraps)
```

### `spinTheCarousel(iterator, durationInSeconds)`

Consumes an iterator on a fixed 900&nbsp;ms tick for `durationInSeconds`
seconds, then resolves with the most recently yielded value. Useful for slot
machine / "surprise me" UX where a value flickers through several candidates
before settling.

```js
import { recipeGenerator, spinTheCarousel } from "culina-utils";

const recipes = [{ id: 1, title: "Borscht" }, { id: 2, title: "Pelmeni" }];
const gen = recipeGenerator(recipes);
const picked = await spinTheCarousel(gen, 3); // resolves after ~3s
console.log(picked.title);
```

The current Culina home page wires this up to the "Здивуй мене" button — see
`frontend/scripts/load-recipes.js`.

## API

| Export              | Kind                | Signature                                                         |
| ------------------- | ------------------- | ----------------------------------------------------------------- |
| `recipeGenerator`   | generator function  | `function* recipeGenerator<T>(items: T[]): Generator<T>`          |
| `spinTheCarousel`   | async helper        | `spinTheCarousel<T>(it: Iterator<T>, seconds: number): Promise<T>`|

## License

[MIT](./LICENSE) © Ілля Бугай
