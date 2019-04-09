const { default: wretch } = require('wretch')
const { dedupe } = require('wretch-middlewares')
const configFactory = require('./configFactory')
const {
    LANGUAGE_MAPPINGS
} = require('../constants')

const BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'

let placesHttp = wretch(BASE_URL)
    .middlewares([
        dedupe()
    ])

module.exports = {
    init (httpOptions = {}) {
        const config = configFactory.get()

        wretch().polyfills({
            fetch: httpOptions.mock || require('node-fetch')
        })
        placesHttp = placesHttp.query({
            key: config.apiKey
        })
    },
    nearbySearch: async (coords, name) => {
        const config = configFactory.get()
        const query = {
            location: coords,
            radius: 50000,
            name,
            language: LANGUAGE_MAPPINGS[config.locale]
        }

        const results = await placesHttp
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

        return results
    }
}
