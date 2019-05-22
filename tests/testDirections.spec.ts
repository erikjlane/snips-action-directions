import { Test } from 'snips-toolkit'
import {
    createLocationFromSlot,
    createLocationToSlot,
    createTravelModeSlot,
    mockConfig
} from './utils'

const { Session, Tools} = Test
const { getMessageKey } = Tools

import './mocks/http'

it('should ask to configure the current location of the device', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'uk',
        current_location: '',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go to'
    })

    // In test mode, the i18n output is mocked as a JSON containing the i18n key and associated options.
    // (basically the arguments passed to i18n, in serialized string form)
    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.noCurrentAddress')
})

it('should ask to properly configure the current location of the device', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'uk',
        current_location: 'random_value',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go to'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.badCurrentAddress')
})

it('should ask to properly configure the home location', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '',
        home_city: '',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go to'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.noHomeAddress')
})

it('should ask to properly configure the work location', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'uk',
        current_location: 'work',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: '',
        work_city: '',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go to'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.noWorkAddress')
})

it('should break as the destination is missing', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'How much time to go'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.intentNotRecognized')
})

it('should set the current location as the origin', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'How much time to go to Buckingham Palace',
        slots: [
            createLocationToSlot('Buckingham Palace')
        ]
    })

    const endMsg = await session.end()
    expect(endMsg.text && endMsg.text.includes('directions.directions.transit.toDestination')).toBeTruthy()
    expect(endMsg.text && endMsg.text.includes('directions.fromLocation.home')).toBeTruthy()
})

it('should ask the misunderstood origin and pass', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
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
            createLocationToSlot('London Eye')
        ]
    })

    const whichOriginMsg = await session.continue({
        intentName: 'snips-assistant:ElicitOrigin',
        input: 'I want to go to Buckingham Palace',
        slots: [
            createLocationFromSlot('Buckingham Palace')
        ]
    })
    expect(getMessageKey(whichOriginMsg)).toBe('directions.dialog.noOriginAddress')

    const endMsg = await session.end()
    expect(endMsg.text && endMsg.text.includes('directions.directions.transit.walkToMetro')).toBeTruthy()
    expect(endMsg.text && endMsg.text.includes('directions.directions.transit.metro')).toBeTruthy()
})

it('should ask the misunderstood origin twice and pass', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
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
            createLocationToSlot('London Eye')
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
    expect(endMsg.text && endMsg.text.includes('directions.directions.transit.walkToMetro')).toBeTruthy()
    expect(endMsg.text && endMsg.text.includes('directions.directions.transit.metro')).toBeTruthy()
})

it('should ask the misunderstood origin twice and fail', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
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
            createLocationToSlot('London Eye')
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

it('should query the directions to go to Buckingham Palace (default: home & transit)', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go to Buckingham Palace',
        slots: [
            createLocationToSlot('Buckingham Palace'),
        ]
    })

    const endMsg = await session.end()
    expect(endMsg.text && endMsg.text.includes('directions.directions.transit.walkToMetro')).toBeTruthy()
    expect(endMsg.text && endMsg.text.includes('directions.directions.transit.metro')).toBeTruthy()
})

//TODO: the user asked for a trip by bus, but another transit mode is returned by Google (metro)
it('should query the directions to go from work to Buckingham Palace by bus', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'uk',
        current_location: 'work',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go from work to Buckingham Palace by bus',
        slots: [
            createLocationFromSlot('work'),
            createLocationToSlot('Buckingham Palace'),
            createTravelModeSlot('bus')
        ]
    })

    const endMsg = await session.end()
    expect(endMsg.text && endMsg.text.includes('directions.directions.transit.walkToMetro')).toBeTruthy()
    expect(endMsg.text && endMsg.text.includes('directions.directions.transit.metro')).toBeTruthy()
})

it('should suggest another travel mode instead of car', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'uk',
        current_location: 'work',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go from work to Buckingham Palace by car',
        slots: [
            createLocationFromSlot('work'),
            createLocationToSlot('Buckingham Palace'),
            createTravelModeSlot('car')
        ]
    })

    const endMsg = await session.end()
    expect(endMsg.text && endMsg.text.includes('noTripWithTravelMode')).toBeTruthy()
    expect(endMsg.text && endMsg.text.includes('directions.directions.transit.walkToMetro')).toBeTruthy()
    expect(endMsg.text && endMsg.text.includes('directions.directions.transit.walkToMetro')).toBeTruthy()
})

it('should laugh of you', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'uk',
        current_location: 'work',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go from work to work by foot',
        slots: [
            createLocationFromSlot('work'),
            createLocationToSlot('work'),
            createTravelModeSlot('walking')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.dialog.sameLocations')
})
