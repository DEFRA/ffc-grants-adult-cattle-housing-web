const { commonFunctionsMock } = require('../../../session-mock')
const { crumbToken } = require('./test-helper')

describe('Page: /items-needed', () => {
  const varList = { businessLocation: 'randomData' }

  let valList = {}

  commonFunctionsMock(varList, undefined, {}, valList)

  it('page loads successfully, with all the options', async () => {
    const options = {
      method: 'GET',
      url: `${global.__URLPREFIX__}/items-needed`
    }

    const response = await global.__SERVER__.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.payload).toContain('What eligible items does your project need?')
    expect(response.payload).toContain('Constructing or improving buildings for housing')
    expect(response.payload).toContain('Processing equipment or machinery')
    expect(response.payload).toContain('Retail facilities')
    expect(response.payload).toContain('None of the above')
  })

  it('no option selected -> show error message', async () => {
    valList.itemsNeeded = {
      error: 'What eligible items does your project need?',
      return: false
    }
    const postOptions = {
      method: 'POST',
      url: `${global.__URLPREFIX__}/items-needed`,
      headers: { cookie: 'crumb=' + crumbToken },
      payload: { itemsNeeded: '', crumb: crumbToken }
    }

    const postResponse = await global.__SERVER__.inject(postOptions)
    expect(postResponse.statusCode).toBe(200)
    expect(postResponse.payload).toContain('What eligible items does your project need?')
    delete valList.itemsNeeded
  })

  it('user selects option -> store user response and redirect to /project-cost', async () => {
    const postOptions = {
      method: 'POST',
      url: `${global.__URLPREFIX__}/items-needed`,
      headers: { cookie: 'crumb=' + crumbToken },
      payload: { itemsNeeded: ['Processing equipment or machinery'], crumb: crumbToken }
    }

    const postResponse = await global.__SERVER__.inject(postOptions)
    expect(postResponse.statusCode).toBe(302)
    expect(postResponse.headers.location).toBe('project-cost')
  })

  it('page loads with correct back link', async () => {
    const options = {
      method: 'GET',
      url: `${global.__URLPREFIX__}/items-needed`
    }
    const response = await global.__SERVER__.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.payload).toContain('<a href=\"legal-status\" class=\"govuk-back-link\">Back</a>')
  })
})
