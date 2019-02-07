const { default: wretch } = require('wretch')
const { dedupe } = require('wretch-middlewares')
const configFactory = require('./configFactory')
const logger = require('../utils/logger')

const BASE_URL = 'https://maps.googleapis.com/maps/api/directions/json'

let http = wretch(BASE_URL)
    // Add a dedupe middleware, throttling cache would also be useful to prevent excessive token usage.
    // (https://github.com/elbywan/wretch-middlewares)
    .middlewares([
        dedupe()
        /*
        next => async (url, opts) => {
            const response = await next(url, opts)
            const clone = await response.clone()
            const body = await clone.json()
            if (!body.geocoded_waypoints[1].types.includes('street_address')) {
                // chope l'id dans le body
                return next( nouvelle url , opts)
            } else {
                return response
            }
        }
        */
    ])

module.exports = {
    init (httpOptions = {}) {
        const config = configFactory.get()

        wretch().polyfills({
            fetch: httpOptions.mock || require('node-fetch')
        })
        http = http.query({
            key: config.key
        })
    },
    calculateRoute: async ({origin, destination, travelMode, departureTime = 'now', arrivalTime = ''} = {}) => {
        const config = configFactory.get()

        const results = await http
            .query({
                origin: origin,
                destination: destination,
                mode: travelMode,
                departure_time: departureTime,
                arrival_time: arrivalTime,
                units: config.unitSystem,
                region: config.currentRegion
            })
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
