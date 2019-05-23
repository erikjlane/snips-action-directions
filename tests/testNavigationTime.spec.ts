import { Test } from 'snips-toolkit'
import {
    createLocationFromSlot,
    createLocationToSlot,
    createTravelModeSlot,
    mockConfig
} from './utils'

const { Session, Tools } = Test
const { getMessageKey, getMessageOptions } = Tools

import './mocks/http'

it('should ask to configure the current location of the device', async () => {
    mockConfig({
        locale: 'en',
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
        intentName: 'snips-assistant:GetNavigationTime',
        input: 'How much time to go'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.noCurrentAddress')
})

it('should ask to properly configure the current location of the device', async () => {
    mockConfig({
        locale: 'en',
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
        intentName: 'snips-assistant:GetNavigationTime',
        input: 'How much time to go'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.badCurrentAddress')
})

it('should ask to properly configure the home location', async () => {
    mockConfig({
        locale: 'en',
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
        intentName: 'snips-assistant:GetNavigationTime',
        input: 'How much time to go'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.noHomeAddress')
})

it('should ask to properly configure the work location', async () => {
    mockConfig({
        locale: 'en',
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
        intentName: 'snips-assistant:GetNavigationTime',
        input: 'How much time to go'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.noWorkAddress')
})

it('should break as the destination is missing', async () => {
    mockConfig({
        locale: 'en',
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
        intentName: 'snips-assistant:GetNavigationTime',
        input: 'How much time to go'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.intentNotRecognized')
})

it('should set the current location as the origin', async () => {
    mockConfig({
        locale: 'en',
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
        intentName: 'snips-assistant:GetNavigationTime',
        input: 'How much time to go to Buckingham Palace',
        slots: [
            createLocationToSlot('Buckingham Palace')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.navigationTime.transit')
    expect(getMessageKey(getMessageOptions(endMsg).location_from)).toBe('directions.fromLocation.home')
    expect(getMessageOptions(endMsg).location_to).toBe('Buckingham Palace')
})

it('should ask the misunderstood origin and pass', async () => {
    mockConfig({
        locale: 'en',
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
        intentName: 'snips-assistant:GetNavigationTime',
        input: 'How much time to go to London Eye from Buckingham Palace',
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
        input: 'I want to leave from Buckingham Palace',
        slots: [
            createLocationFromSlot('Buckingham Palace')
        ]
    })
    expect(getMessageKey(whichOriginMsg)).toBe('directions.dialog.noOriginAddress')

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.navigationTime.transit')
})

it('should ask the misunderstood origin twice and pass', async () => {
    mockConfig({
        locale: 'en',
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
        intentName: 'snips-assistant:GetNavigationTime',
        input: 'How much time to go',
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
    expect(getMessageKey(endMsg)).toBe('directions.navigationTime.transit')
    expect(getMessageOptions(endMsg).location_from).toBe('Buckingham Palace')
})

it('should ask the missing origin twice and fail', async () => {
    mockConfig({
        locale: 'en',
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
        intentName: 'snips-assistant:GetNavigationTime',
        input: 'How much time to go',
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

it('should query the navigation time to go to Buckingham Palace (default: home & transit)', async () => {
    mockConfig({
        locale: 'en',
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
        intentName: 'snips-assistant:GetNavigationTime',
        input: 'How much time to go to Buckingham Palace',
        slots: [
            createLocationToSlot('Buckingham Palace'),
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.navigationTime.transit')
    expect(getMessageKey(getMessageOptions(endMsg).location_from)).toBe('directions.fromLocation.home')
    expect(getMessageOptions(endMsg).location_to).toBe('Buckingham Palace')
})

it('should query the navigation time to go from work to Buckingham Palace by bus', async () => {
    mockConfig({
        locale: 'en',
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
        intentName: 'snips-assistant:GetNavigationTime',
        input: 'How much time to from work to Buckingham Palace by bus',
        slots: [
            createLocationFromSlot('work'),
            createLocationToSlot('Buckingham Palace'),
            createTravelModeSlot('bus')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.navigationTime.bus')
    expect(getMessageKey(getMessageOptions(endMsg).location_from)).toBe('directions.fromLocation.work')
    expect(getMessageOptions(endMsg).location_to).toBe('Buckingham Palace')
})

it('should laugh of you', async () => {
    mockConfig({
        locale: 'en',
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
        intentName: 'snips-assistant:GetNavigationTime',
        input: 'How much time to from work to work by foot',
        slots: [
            createLocationFromSlot('work'),
            createLocationToSlot('work'),
            createTravelModeSlot('walking')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.dialog.sameLocations')
})

it('should query the navigation time to go from London Eye to Buckingham Palace by bike', async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetNavigationTime',
        input: 'How much time to go from London Eye to Buckingham Palace by bike',
        slots: [
            createLocationFromSlot('London Eye'),
            createLocationToSlot('Buckingham Palace'),
            createTravelModeSlot('walk')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('directions.navigationTime.walking')
    expect(getMessageOptions(endMsg).location_from).toBe('Coca-Cola London Eye')
    expect(getMessageOptions(endMsg).location_to).toBe('Buckingham Palace')
})
