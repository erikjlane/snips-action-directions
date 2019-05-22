# snips-action-directions

Snips action code for the Directions app

[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

## Setup

```sh
sh setup.sh
```

Don't forget to edit the `config.ini` file.

To be able to make calls to the API, you must have a [Google Directions API key](https://developers.google.com/maps/documentation/directions/get-api-key).

An assistant containing the intents listed below must be installed on your system. Deploy it following [these instructions](https://docs.snips.ai/articles/console/actions/deploy-your-assistant).

## Run

- Dev mode:

```sh
# Dev mode watches for file changes and restarts the action.
npm run dev
```

- Prod mode:

```sh
# 1) Lint, transpile and test.
npm start
# 2) Run the action.
npm run launch
```

## Test & Demo cases

This app only supports french 🇫🇷 and english 🇬🇧.

### `GetDirections`

#### Get directions from a location A to a location B optionally indicating a travel mode

Get directions to the given location
> *Hey Snips, I would like to be guided to the Statue of Liberty*

Get directions from a location A to a location B
> *Hey Snips, I need to get from Times Square to the Statue of Liberty*

Get directions from a location A to a location B by car
> *Hey Snips, how can I get from the office to the Guggenheim Museum by car?*

### `GetNavigationTime`

#### Get estimated travel time to get to a specific location optionally indicating a travel mode and the place you leave from

Get estimated travel time to get to the given location
> *Hey Snips, how long will it take me to go to the Metropolitan Museum?*

Get estimated travel time to get from location A to location B
> *Hey Snips, how long will it take me to go from Times Square to the Metropolitan Museum?*

Get estimated travel time to get from a location A to a location B, indicating a travel mode
> *Hey Snips, how long will it take me to drive from Times Square to the Metropolitan Museum?*

### `GetDepartureTime`

#### Ask about what your departure time should be to arrive to a specific location at a specific time, optionally indicating a travel mode and the location you leave from

Get the departure time to get to the given location at a specific time
> *Hey Snips, I want to be at noon at the office, when I should leave?*

Get the departure time to get to location B at a specific time, when leaving from location A
> *Hey Snips, I want to be at 11:35 am at the office, when I should leave from Times Square?*

Get the departure time to get to location B at a specific time, when leaving from location A by car
> *Hey Snips, I want to be at noon at the office, when I should leave from Times Square if I'm travelling by car?*

### `GetArrivalTime`

#### Ask about your estimated arrival time to a specific location by providing your departure time. You can optionally indicate the location you are leaving from and/or a travel mode

Get the arrival time to the given location with the given departure time
> *Hey Snips, ETA to New York departure time being 5 pm?*

Get the arrival time to location B when leaving location A at the given departure time
> *Hey Snips, what time will I arrive to Manhattan if I leave the Empire State Building at 9 pm?*

Get the arrival time to location B when leaving location A at the given departure time, indicating a travel mode
> *Hey Snips, when will I reach the airport if I take the subway from 124 Main Street by noon?*

## Debug

In the `src/index.ts` file:

```js
// Uncomment this line to print everything
// debug.enable(name + ':*')
```

## Test & Lint

*Requires [mosquitto](https://mosquitto.org/download/) to be installed.*

```sh
npm start
```

**In test mode, i18n output and http calls are mocked.**

- **http**: see `tests/httpMocks/index.js`
- **i18n**: see `src/factories/i18nFactory.js`

## Contributing

Please see the [Contribution Guidelines](https://github.com/snipsco/snips-action-directions/blob/master/CONTRIBUTING.md).

## Copyright

This library is provided by [Snips](https://snips.ai) as Open Source software. See [LICENSE](https://github.com/snipsco/snips-action-directions/blob/master/LICENSE) for more information.
