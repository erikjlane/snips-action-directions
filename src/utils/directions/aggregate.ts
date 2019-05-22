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

export const aggregate = {
    aggregateDirections: directionsData => {
        const steps = directionsData.routes[0].legs[0].steps
        const finalData = resetAccumulatorItem(steps.length)

        let i = 0
        for (let element of Object.values(steps)) {
            finalData[i].travel_mode = element.travel_mode
            finalData[i].distance = element.distance.value
            finalData[i].duration = element.duration.value

            if (element.travel_mode === 'TRANSIT') {
                finalData[i].line_name = element.transit_details.line.short_name
                finalData[i].vehicle_type = element.transit_details.line.vehicle.type
                finalData[i].headsign = element.transit_details.headsign
                finalData[i].departure_stop = element.transit_details.departure_stop.name
                finalData[i].arrival_stop = element.transit_details.arrival_stop.name
            }

            i++
        }

        return finalData
    }
}
