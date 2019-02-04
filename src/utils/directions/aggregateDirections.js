const { debug } = require('../logger')

function resetAccumulatorItem(nbSteps) {
    return Array.from({length: nbSteps}, () => ({
        travel_mode: null,
        distance: 0,
        duration: 0,
        line_name: null,
        headsign: null,
        departure_stop: null,
        arrival_stop: null
    }))
}

module.exports = {
    aggregateDirections: directionsData => {
        const steps = directionsData.routes[0].legs[0].steps
        const finalData = resetAccumulatorItem(steps.length)

        let i = 0
        for (let [key, value] of Object.entries(steps)) {
            finalData[i].travel_mode = value.travel_mode
            finalData[i].distance = value.distance.value
            finalData[i].duration = value.duration.value

            if (value.travel_mode === 'TRANSIT') {
                finalData[i].line_name = value.transit_details.line.short_name
                finalData[i].headsign = value.transit_details.headsign
                finalData[i].departure_stop = value.transit_details.departure_stop.name
                finalData[i].arrival_stop = value.transit_details.arrival_stop.name
            }

            i++
        }

        return finalData
    }
}
