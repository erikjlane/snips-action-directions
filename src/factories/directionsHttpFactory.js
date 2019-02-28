const { default: wretch } = require('wretch')
const { dedupe } = require('wretch-middlewares')
const configFactory = require('./configFactory')
const placesHttpFactory = require('./placesHttpFactory')
const {
    LANGUAGE_MAPPINGS
} = require('../constants')

const BASE_URL = 'https://maps.googleapis.com/maps/api/directions/json'

let directionsHttp = wretch(BASE_URL)
    // Add a dedupe middleware, throttling cache would also be useful to prevent excessive token usage.
    .middlewares([
        dedupe(),
        next => async (url, opts) => {
            const config = configFactory.get()

            let query = {
                ...opts.query,
                key: config.apiKey
            }

            // Origin
            if (opts.origin !== config.homeAddress && opts.origin !== config.workAddress) {
                const originPlaces = await placesHttpFactory.nearbySearch(config.currentCoordinates, opts.origin)

                const originPlace = originPlaces.results[0]
                if (originPlaces.status !== 'ZERO_RESULTS' && originPlace) {
                    // Storing the name
                    opts.context.originName = originPlace.name
                    // Places returned some results, extract and pass the place_id to Directions
                    query = {
                        ...query,
                        origin: 'place_id:' + originPlace.place_id
                    }
                }
            }

            // Destination
            if (opts.destination !== config.homeAddress && opts.destination !== config.workAddress) {
                const destinationPlaces = await placesHttpFactory.nearbySearch(config.currentCoordinates, opts.destination)
                
                const destinationPlace = destinationPlaces.results[0]
                if (destinationPlaces.status !== 'ZERO_RESULTS' && destinationPlace) {
                    // Storing the name
                    opts.context.destinationName = destinationPlace.name
                    // Places returned some results, extract and pass the place_id to Directions
                    query = {
                        ...query,
                        destination: 'place_id:' + destinationPlace.place_id
                    }
                }

                if (opts.context.originName || opts.context.destinationName) {
                    return wretch(BASE_URL).query(query).get().res()
                } else {
                    return next(url, opts)
                }
            }
        }
    ])

module.exports = {
    init (httpOptions = {}) {
        const config = configFactory.get()

        wretch().polyfills({
            fetch: httpOptions.mock || require('node-fetch')
        })
        directionsHttp = directionsHttp.query({
            key: config.apiKey
        })
    },
    calculateRoute: async ({origin, destination, travelMode, departureTime = 'now', arrivalTime = ''} = {}) => {
        const config = configFactory.get()
        let query = {
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
            query = {
                ...query,
                mode: 'transit',
                transit_mode: travelMode
            }
        }

        const context = {}
        const results = await directionsHttp
            .query(query)
            .options({ origin, destination, query, context })
            .get()
            .json()
            .catch(error => {
                // Network error
                if (error.name === 'TypeError')
                    throw new Error('APIRequest')
                // Other error
                throw new Error('APIResponse')
            })
        
        if (results) {
            if (results.status === 'ZERO_RESULTS' || results.status === 'NOT FOUND') {
                throw new Error('place')
            }
        } else {
            throw new Error('APIResponse')
        }

        if (context.originName) {
            results.routes[0].legs[0].start_address_name = context.originName
        }
        if (context.destinationName) {
            results.routes[0].legs[0].end_address_name = context.destinationName
        }

        return results
    }
}
