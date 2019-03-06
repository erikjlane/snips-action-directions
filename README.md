# snips-action-directions
#### Action code for the Snips directions &amp; traffic info skill

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

## Test & Demo cases

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

Get estimated travel time to drive from a location A to a location B
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