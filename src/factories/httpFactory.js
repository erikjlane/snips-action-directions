const { default: wretch } = require('wretch')
const { dedupe } = require('wretch-middlewares')
const configFactory = require('./configFactory')

const BASE_URL = 'https://maps.googleapis.com/maps/api/directions/json'

let http = wretch(BASE_URL)
    // Add a dedupe middleware, throttling cache would also be useful to prevent excessive token usage.
    // (https://github.com/elbywan/wretch-middlewares)
    .middlewares([
        dedupe()
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
            region: config.currentRegion
        }

        if (travelMode === 'bus' || travelMode === 'train') {
            query.mode = 'transit'
            query.transit_mode = travelMode
        }

        const results = await http
            .query(query)
            .get()
            .json()
            .catch(error => {
                // Network error
                if (error.name === 'TypeError')
                    throw new Error('APIRequest')
                // Other error
                throw new Error('APIResponse')
            })

        if (results && results.status === 'NOT FOUND') {
            throw new Error('place')
        }

        //logger.debug('results: %O', results)

        return results
    }
}
