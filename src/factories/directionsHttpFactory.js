const { default: wretch } = require('wretch')
const { dedupe } = require('wretch-middlewares')
const configFactory = require('./configFactory')
const placesHttpFactory = require('./placesHttpFactory')
const {
    LANGUAGE_MAPPINGS
} = require('../constants')

const BASE_URL = 'https://maps.googleapis.com/maps/api/directions/json'

let http = wretch(BASE_URL)
    // Add a dedupe middleware, throttling cache would also be useful to prevent excessive token usage.
    .middlewares([
        dedupe(),
        next => async (url, opts) => {
            const config = configFactory.get()
            const places = await placesHttpFactory.nearbySearch(config.homeCoordinates, opts.destination)
            
            if (places.status === 'ZERO_RESULTS') {
                // Places didn't return any results, pass the request to Directions as it is
                return next(url, opts)
            } else {
                // Places returned some results, extract and pass the place_id to Directions
                const query = {
                    ...opts.query,
                    destination: 'place_id:' + places.results[0].place_id,
                    key: config.apiKey
                }
                return wretch(BASE_URL).query(query).get().res()
            }
        }
    ])

module.exports = {
    init (httpOptions = {}) {
        const config = configFactory.get()

        wretch().polyfills({
            fetch: httpOptions.mock || require('node-fetch')
        })
        http = http.query({
            key: config.apiKey
        })
    },
    calculateRoute: async ({origin, destination, travelMode, departureTime = 'now', arrivalTime = ''} = {}) => {
        const config = configFactory.get()
        const query = {
            origin: origin,
            destination: destination,
            mode: travelMode,
            departure_time: departureTime,
            arrival_time: arrivalTime,
            units: config.unitSystem,
            region: config.currentRegion,
            language: LANGUAGE_MAPPINGS[config.locale]
        }

        if (travelMode === 'bus' || travelMode === 'train') {
            query.mode = 'transit'
            query.transit_mode = travelMode
        }

        const results = await http
            .query(query)
            .options({ destination: destination, query: query })
            .get()
            .json()
            .catch(error => {
                console.log(error)
                // Network error
                if (error.name === 'TypeError')
                    throw new Error('APIRequest')
                // Other error
                throw new Error('APIResponse')
            })

        if (results && results.status === 'NOT FOUND') {
            throw new Error('place')
        }

        return results
    }
}
