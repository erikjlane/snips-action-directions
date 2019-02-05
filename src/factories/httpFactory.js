const { default: wretch } = require('wretch')
const { dedupe } = require('wretch-middlewares')
const { logger } = require('../utils')
const configFactory = require('./configFactory')

const BASE_URL = 'https://maps.googleapis.com/maps/api/directions/json'

const http = wretch(BASE_URL)
    // Add a dedupe middleware, throttling cache would also be useful to prevent excessive token usage.
    // (https://github.com/elbywan/wretch-middlewares)
    .middlewares([
        dedupe()
    ])

module.exports = {
    init (httpOptions = {}) {
        wretch().polyfills({
            fetch: httpOptions.mock || require('node-fetch')
        })
    },
    get() {
        return http
    },
    calculateRoute: async ({origin, destination, travelMode, departureTime = 'now', arrivalTime = ''} = {}) => {
        const config = configFactory.get()

        const request = http
            .url('')
            .query({
                origin: origin,
                destination: destination,
                mode: travelMode,
                departure_time: departureTime,
                arrival_time: arrivalTime,
                units: config.unitSystem === 'metric' ? 'metric' : 'imperial',
                key: 'AIzaSyD44qt1yNsG4sucw6voNSLy9VU-2-PT-60'
            })

        logger.debug(request)

        const results = await request
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

        return results
    }
}
