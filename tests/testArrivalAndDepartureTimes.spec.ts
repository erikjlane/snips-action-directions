import { Test } from 'snips-toolkit'
import {
    createLocationFromSlot,
    createLocationToSlot,
    createTravelModeSlot,
    createDepartureTimeSlot,
    createArrivalTimeSlot }
from './utils'

const { Session, Tools} = Test
const { getMessageKey, getMessageOptions } = Tools

import './mocks/http'

// Arrival time

it('should ask to configure the current location of the device', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: '',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I will be leaving at ten pm, when will I arrive at Buckingham Palace?',
        slots: [
            createLocationToSlot('Buckingham Palace'),
            createDepartureTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.noCurrentAddress')
})

it('should ask to properly configure the current location of the device', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'random_value',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'What time should will I arrive'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.badCurrentAddress')
})

it('should ask to properly configure the home location', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '',
        home_city: '',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'What time should will I arrive'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.noHomeAddress')
})

it('should ask to properly configure the work location', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'work',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: '',
        work_city: '',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'What time should will I arrive'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.noWorkAddress')
})

it('should break as the destination is missing', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'How much time to go to'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.intentNotRecognized')
})

it('should ask the misunderstood origin and pass', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'If I leave from Buckingham Palace at ten pm, when will I arrive there?',
        slots: [
            {
                slotName: 'location_from',
                entity: 'address',
                confidenceScore: 0.05,
                rawValue: 'Buckingham Palace',
                value: {
                    kind: 'Custom',
                    value: 'Buckingham Palace'
                },
                range: {
                    start: 0,
                    end: 1
                }
            },
            createLocationToSlot('London Eye'),
            createDepartureTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const whichOriginMsg = await session.continue({
        intentName: 'snips-assistant:ElicitOrigin',
        input: 'If I leave from Buckingham Palace at ten pm, when will I arrive there?',
        slots: [
            createLocationFromSlot('Buckingham Palace')
        ]
    })
    expect(getMessageKey(whichOriginMsg)).toBe('directions.dialog.noOriginAddress')

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.arrivalTime.transit')
})

it('should ask the misunderstood origin twice and pass', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'Give me directions to go to',
        slots: [
            {
                slotName: 'location_from',
                entity: 'address',
                confidenceScore: 0.05,
                rawValue: 'Buckingham Palace',
                value: {
                    kind: 'Custom',
                    value: 'Buckingham Palace'
                },
                range: {
                    start: 0,
                    end: 1
                }
            },
            createLocationToSlot('London Eye'),
            createDepartureTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const whichOriginMsg1 = await session.continue({
        intentName: 'snips-assistant:ElicitOrigin',
        input: 'I want to go to',
        slots: [
            {
                slotName: 'location_from',
                entity: 'address',
                confidenceScore: 0.05,
                rawValue: 'Buckingham Palace',
                value: {
                    kind: 'Custom',
                    value: 'Buckingham Palace'
                },
                range: {
                    start: 0,
                    end: 1
                }
            }
        ]
    })
    expect(getMessageKey(whichOriginMsg1)).toBe('directions.dialog.noOriginAddress')

    const whichOriginMsg2 = await session.continue({
        intentName: 'snips-assistant:ElicitOrigin',
        input: 'I want to go to Buckingham Palace',
        slots: [
            createLocationFromSlot('Buckingham Palace')
        ]
    })
    expect(getMessageKey(whichOriginMsg2)).toBe('directions.dialog.noOriginAddress')

    const endMsg = await session.end()
    expect(endMsg.text && endMsg.text.includes('directions.arrivalTime.transit')).toBeTruthy()
})

it('should ask the misunderstood origin twice and fail', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'Give me directions to go to',
        slots: [
            {
                slotName: 'location_from',
                entity: 'address',
                confidenceScore: 0.05,
                rawValue: 'Buckingham Palace',
                value: {
                    kind: 'Custom',
                    value: 'Buckingham Palace'
                },
                range: {
                    start: 0,
                    end: 1
                }
            },
            createLocationToSlot('London Eye'),
            createDepartureTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const whichOriginMsg1 = await session.continue({
        intentName: 'snips-assistant:ElicitOrigin',
        input: 'I want to go',
        slots: [
            {
                slotName: 'location_from',
                entity: 'address',
                confidenceScore: 0.05,
                rawValue: 'Buckingham Palace',
                value: {
                    kind: 'Custom',
                    value: 'Buckingham Palace'
                },
                range: {
                    start: 0,
                    end: 1
                }
            }
        ]
    })
    expect(getMessageKey(whichOriginMsg1)).toBe('directions.dialog.noOriginAddress')
    
    const whichOriginMsg2 = await session.continue({
        intentName: 'snips-assistant:ElicitOrigin',
        input: 'I want to go',
        slots: [
            {
                slotName: 'location_from',
                entity: 'address',
                confidenceScore: 0.05,
                rawValue: 'Buckingham Palace',
                value: {
                    kind: 'Custom',
                    value: 'Buckingham Palace'
                },
                range: {
                    start: 0,
                    end: 1
                }
            }
        ]
    })
    expect(getMessageKey(whichOriginMsg2)).toBe('directions.dialog.noOriginAddress')

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.slotsNotRecognized')
})

it('should ask the missing departure time and pass', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I have to be at Buckingham Palace, when should I leave?',
        slots: [
            createLocationToSlot('Buckingham Palace')
        ]
    })

    const whichDepartureTimeMsg = await session.continue({
        intentName: 'snips-assistant:ElicitDepartureTime',
        input: 'I want to go at Buckingham Palace',
        slots: [
            createDepartureTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })
    expect(getMessageKey(whichDepartureTimeMsg)).toBe('directions.dialog.noDepartureTime')

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.arrivalTime.transit')
    expect(getMessageKey(getMessageOptions(endMsg).location_from)).toBe('directions.fromLocation.home')
    expect(getMessageOptions(endMsg).location_to).toBe('Buckingham Palace')
})

it('should break as the origin is misunderstood & the departure time not provided', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I have to be at, when should I leave?',
        slots: [
            {
                slotName: 'location_from',
                entity: 'address',
                confidenceScore: 0.05,
                rawValue: 'Buckingham Palace',
                value: {
                    kind: 'Custom',
                    value: 'Buckingham Palace'
                },
                range: {
                    start: 0,
                    end: 1
                }
            },
            createLocationToSlot('London Eye')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.intentNotRecognized')
})

it('should query the arrival time when going to Buckingham Palace (default: home & transit)', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I will be leaving at ten pm, when will I arrive at Buckingham Palace?',
        slots: [
            createLocationToSlot('Buckingham Palace'),
            createDepartureTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.arrivalTime.transit')
})

it('should query the arrival time when going from work to Buckingham Palace if leaving at ten pm by foot', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I will be leaving at ten pm, when will I arrive at Buckingham Palace if I am walking?',
        slots: [
            createLocationFromSlot('work'),
            createLocationToSlot('Buckingham Palace'),
            createTravelModeSlot('walk'),
            createDepartureTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.arrivalTime.walking')
})

// Departure time

it('should ask to configure the current location of the device', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: '',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I have to be at Buckingham Palace at ten pm, when should I leave?',
        slots: [
            createLocationToSlot('Buckingham Palace'),
            createArrivalTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.noCurrentAddress')
})

it('should ask to properly configure the current location of the device', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'random_value',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'When should I leave'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.badCurrentAddress')
})

it('should ask to properly configure the home location', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '',
        home_city: '',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'What time should I leave'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.noHomeAddress')
})

it('should ask to properly configure the work location', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'work',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: '',
        work_city: '',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'What time should I leave'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.noWorkAddress')
})

it('should break as the destination is missing', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'How much time to go to'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.intentNotRecognized')
})

it('should ask the misunderstood origin and pass', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'If I leave from Buckingham Palace at ten pm, when will I arrive there?',
        slots: [
            {
                slotName: 'location_from',
                entity: 'address',
                confidenceScore: 0.05,
                rawValue: 'Buckingham Palace',
                value: {
                    kind: 'Custom',
                    value: 'Buckingham Palace'
                },
                range: {
                    start: 0,
                    end: 1
                }
            },
            createLocationToSlot('London Eye'),
            createArrivalTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const whichOriginMsg = await session.continue({
        intentName: 'snips-assistant:ElicitOrigin',
        input: 'If I leave from Buckingham Palace at ten pm, when will I arrive there?',
        slots: [
            createLocationFromSlot('Buckingham Palace')
        ]
    })
    expect(getMessageKey(whichOriginMsg)).toBe('directions.dialog.noOriginAddress')

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.departureTime.transit')
})

it('should ask the misunderstood origin twice and pass', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'Give me directions to go to',
        slots: [
            {
                slotName: 'location_from',
                entity: 'address',
                confidenceScore: 0.05,
                rawValue: 'Buckingham Palace',
                value: {
                    kind: 'Custom',
                    value: 'Buckingham Palace'
                },
                range: {
                    start: 0,
                    end: 1
                }
            },
            createLocationToSlot('London Eye'),
            createArrivalTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const whichOriginMsg1 = await session.continue({
        intentName: 'snips-assistant:ElicitOrigin',
        input: 'I want to go to',
        slots: [
            {
                slotName: 'location_from',
                entity: 'address',
                confidenceScore: 0.05,
                rawValue: 'Buckingham Palace',
                value: {
                    kind: 'Custom',
                    value: 'Buckingham Palace'
                },
                range: {
                    start: 0,
                    end: 1
                }
            }
        ]
    })
    expect(getMessageKey(whichOriginMsg1)).toBe('directions.dialog.noOriginAddress')

    const whichOriginMsg2 = await session.continue({
        intentName: 'snips-assistant:ElicitOrigin',
        input: 'I want to go to Buckingham Palace',
        slots: [
            createLocationFromSlot('Buckingham Palace')
        ]
    })
    expect(getMessageKey(whichOriginMsg2)).toBe('directions.dialog.noOriginAddress')

    const endMsg = await session.end()
    expect(endMsg.text && endMsg.text.includes('directions.departureTime.transit')).toBeTruthy()
})

it('should ask the misunderstood origin twice and fail', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'Give me directions to go to',
        slots: [
            {
                slotName: 'location_from',
                entity: 'address',
                confidenceScore: 0.05,
                rawValue: 'Buckingham Palace',
                value: {
                    kind: 'Custom',
                    value: 'Buckingham Palace'
                },
                range: {
                    start: 0,
                    end: 1
                }
            },
            createLocationToSlot('London Eye'),
            createArrivalTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const whichOriginMsg1 = await session.continue({
        intentName: 'snips-assistant:ElicitOrigin',
        input: 'I want to go',
        slots: [
            {
                slotName: 'location_from',
                entity: 'address',
                confidenceScore: 0.05,
                rawValue: 'Buckingham Palace',
                value: {
                    kind: 'Custom',
                    value: 'Buckingham Palace'
                },
                range: {
                    start: 0,
                    end: 1
                }
            }
        ]
    })
    expect(getMessageKey(whichOriginMsg1)).toBe('directions.dialog.noOriginAddress')
    
    const whichOriginMsg2 = await session.continue({
        intentName: 'snips-assistant:ElicitOrigin',
        input: 'I want to go',
        slots: [
            {
                slotName: 'location_from',
                entity: 'address',
                confidenceScore: 0.05,
                rawValue: 'Buckingham Palace',
                value: {
                    kind: 'Custom',
                    value: 'Buckingham Palace'
                },
                range: {
                    start: 0,
                    end: 1
                }
            }
        ]
    })
    expect(getMessageKey(whichOriginMsg2)).toBe('directions.dialog.noOriginAddress')

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.slotsNotRecognized')
})

it('should ask the missing arrival time and pass', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I have to be at Buckingham Palace, when should I leave?',
        slots: [
            createLocationToSlot('Buckingham Palace')
        ]
    })

    const whichArrivalTimeMsg = await session.continue({
        intentName: 'snips-assistant:ElicitArrivalTime',
        input: 'I want to go at Buckingham Palace',
        slots: [
            createArrivalTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })
    expect(getMessageKey(whichArrivalTimeMsg)).toBe('directions.dialog.noArrivalTime')

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.departureTime.transit')
    expect(getMessageKey(getMessageOptions(endMsg).location_from)).toBe('directions.fromLocation.home')
    expect(getMessageOptions(endMsg).location_to).toBe('Buckingham Palace')
})

it('should break as the origin is misunderstood & the arrival time not provided', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I have to be at, when should I leave?',
        slots: [
            {
                slotName: 'location_from',
                entity: 'address',
                confidenceScore: 0.05,
                rawValue: 'Buckingham Palace',
                value: {
                    kind: 'Custom',
                    value: 'Buckingham Palace'
                },
                range: {
                    start: 0,
                    end: 1
                }
            },
            createLocationToSlot('London Eye')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.intentNotRecognized')
})

it('should query the departure time to be at Buckingham Palace at ten pm (default: home & transit)', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I have to be at Buckingham Palace at ten pm, when should I leave?',
        slots: [
            createLocationToSlot('Buckingham Palace'),
            createArrivalTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.departureTime.transit')
})

it('should query the departure time to be at ten pm at Buckingham Palace if leaving from work by foot', async () => {
    SnipsToolkit.config = {
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    }

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I have to be at Buckingham Palace at ten pm, when should I leave from work by foot?',
        slots: [
            createLocationFromSlot('work'),
            createLocationToSlot('Buckingham Palace'),
            createTravelModeSlot('walk'),
            createArrivalTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.departureTime.walking')
})
