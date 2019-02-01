const request = require('./request')
const { message, logger } = require('../utils')

module.exports = function ({origin, destination, travel_mode, departure_time = '', arrival_time = ''} = {}) {
    return request.query({
        origin: origin,
        destination: destination,
        mode: travel_mode,
        departure_time: departure_time,
        arrival_time: arrival_time,
        key: "AIzaSyD44qt1yNsG4sucw6voNSLy9VU-2-PT-60"
    }).url("").get().json()
}
