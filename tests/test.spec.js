require('./helpers/setup').bootstrap()
const Session = require('./helpers/session')
const { createLocationFromSlot, createLocationToSlot, createTravelModeSlot } = require('./utils')

it('should query a Pokemon by its id and output its name', async () => {
    const session = new Session()
    await session.start({
        intentName: 'GetDirections',
        input: 'Give me the directions to go from 18 rue Saint-Marc to 3 rue des Acacias by metro',
        slots: [
            createLocationFromSlot('18 rue Saint-Marc'),
            createLocationToSlot('3 rue des Acacias'),
            createTravelModeSlot('transit')
        ]
    })
    // In test mode, the i18n output is mocked as a JSON containing the i18n key and associated options.
    // (basically the arguments passed to i18n, in serialized string form)
    const { key, options } = JSON.parse((await session.end()).text)
    expect(key).toBe('pokemon.info')
    expect(options.name).toBe('bulbasaur')
    expect(options.weight).toBe(69)
    expect(options.height).toBe(7)
})
