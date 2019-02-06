const { default: wretch } = require('wretch')
const { dedupe } = require('wretch-middlewares')
const configFactory = require('./configFactory')

const BASE_URL = 'https://maps.googleapis.com/maps/api/directions/json'

const http = wretch(BASE_URL)
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
        wretch().polyfills({
            fetch: httpOptions.mock || require('node-fetch')
        })
    },
    calculateRoute: async ({origin, destination, travelMode, departureTime = 'now', arrivalTime = ''} = {}) => {
        const config = configFactory.get()

        const results = await http
            .url('')
            .query({
                origin: origin,
                destination: destination,
                mode: travelMode,
                departure_time: departureTime,
                arrival_time: arrivalTime,
                units: config.unitSystem,
                region: config.currentRegion,
                key: 'AIzaSyD44qt1yNsG4sucw6voNSLy9VU-2-PT-60'
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

        return results
    }
}
