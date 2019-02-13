# snips-action-directions
#### Get Directions &amp; Traffic info

## Setup

```
npm install
```

## Run

```
node action.js
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