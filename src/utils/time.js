const { HOUR_MILLISECONDS, DAY_MILLISECONDS, FORECAST_DAYS_LIMIT } = require('../constants')

function intersect (interval1, interval2) {
    return (
        interval1.from <= interval2.to &&
        interval1.to >= interval2.from
    )
}

module.exports = {
    isToday (date) {
        const today = new Date()
        today.setHours(0,0,0,0)
        const interval = {
            min: today.getTime(),
            max: today.getTime() + DAY_MILLISECONDS
        }

        return date.getTime() >= interval.min && date.getTime() <= interval.max
    },
    isTomorrow (date) {
        const tomorrow = new Date(Date.now() + DAY_MILLISECONDS)
        tomorrow.setHours(0,0,0,0)
        const interval = {
            min: tomorrow.getTime(),
            max: tomorrow.getTime() + DAY_MILLISECONDS
        }

        return date.getTime() >= interval.min && date.getTime() <= interval.max
    },
    extractTimeInterval: timeSlots => {
        const result = module.exports.extractTimeIntervals(timeSlots)
        if(result && result.length > 0)
            return result[0]
        return null
    },
    extractTimeIntervals: timeSlots => {
        const today = new Date()
        today.setHours(0,0,0,0)

        // No time slots specified, use the current day
        if(timeSlots.length < 1) {
            return [{
                from: today.getTime(),
                to: today.getTime() + DAY_MILLISECONDS
            }]
        }

        const limits = {
            min: today.getTime(),
            max: today.getTime() + FORECAST_DAYS_LIMIT
        }

        let intervals = []

        timeSlots.forEach(timeSlot => {
            const { value, raw_value } = timeSlot

            let intervalValue = {
                from: null,
                to: null
            }

            const slotValue = value.value

            if(value.value_type === 4) {
                // Instant time
                const { grain, precision } = slotValue

                const instantTime = new Date(slotValue.value).getTime()

                if(instantTime < today.getTime() || grain < 4)
                    throw new Error('intersection')

                // Set the interval based on the grain and precision
                intervalValue.from = instantTime
                intervalValue.to =
                    grain === 4 ?
                        instantTime + DAY_MILLISECONDS * precision :
                    grain === 5 ?
                        instantTime + HOUR_MILLISECONDS * precision :
                    instantTime

            } else {
                // Interval
                intervalValue.from = slotValue.from && new Date(slotValue.from).getTime() || Date.now()
                intervalValue.to = slotValue.to && new Date(slotValue.to).getTime() || Date.now()
            }

            // If the interval is out of the supported range
            if(intervalValue.from < limits.min || intervalValue.to > limits.max)
                throw new Error('intersection')

            if(!intervals.length) {
                intervals.push({ from: intervalValue.from, to: intervalValue.to, raw_value })
            } else {
                const intersected = intervals.some(interval => {
                    if(intersect(interval, intervalValue)) {
                        if(intervalValue.from < interval.from) {
                            interval.from = intervalValue.from
                        }
                        if(intervalValue.to > interval.to) {
                            interval.to = intervalValue.to
                        }
                        return true
                    }
                })
                if(!intersected) {
                    intervals.push({ from: intervalValue.from, to: intervalValue.to, raw_value })
                }
            }
        })

        // Sort in ascending order
        intervals.sort((i1, i2) => i1.from - i2.from)

        return intervals
    }
}
