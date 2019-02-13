# snips-action-directions
#### Get Directions &amp; Traffic info

[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

## Setup

```
npm install
```

## Run

```
node action-directions.js
```

## Debug

In the `action-directions.js` file:

```js
// Uncomment this line to print everything
// debug.enable(name + ':*')
```

When running from the terminal, to enable full depth object printing:

```bash
env DEBUG_DEPTH=null node action-directions.js
```

## Test & Lint

*Requires [mosquitto](https://mosquitto.org/download/) to be installed.*

```sh
npm start
```

**In test mode, i18n output and http calls are mocked.**

- **http**: see `tests/httpMocks/index.js`
- **i18n**: see `src/factories/i18nFactory.js`