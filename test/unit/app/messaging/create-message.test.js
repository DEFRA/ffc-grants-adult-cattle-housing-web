const createMessage = require('../../../../app/messaging/create-message')

describe('create message test', () => {
  test('createMessage returns message format', async () => {
    const message = createMessage('test', 'newTest', { mock: 'yes' })

    expect(message).toEqual({
      body: 'test',
      type: 'newTest',
      source: 'ffc-grants-adult-cattle-housing-web',
      mock: 'yes'
    })
  })
})
