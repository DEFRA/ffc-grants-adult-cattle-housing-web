const { commonFunctionsMock } = require('../../../session-mock')
const { crumbToken } = require('./test-helper')

describe('Page: /impact', () => {
  let varList = {}
  let valList = {}
  
  commonFunctionsMock(varList, undefined, {}, valList)

  it('page loads successfully, with all the options', async () => {
    const options = {
      method: 'GET',
      url: `${global.__URLPREFIX__}/impact`
    }

    const response = await global.__SERVER__.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.payload).toContain('What impact will this project have?')
    expect(response.payload).toContain('Increasing volume of added-value products')
    expect(response.payload).toContain('Allow selling direct to consumer')
    expect(response.payload).toContain('Creating added-value products for the first time')
  })

  it('no option selected -> show error message', async () => {
    valList['NOT_EMPTY'] = {
      error: 'Select what eligible items does your project need',
      return: false
    }

    const postOptions = {
      method: 'POST',
      url: `${global.__URLPREFIX__}/impact`,
      headers: { cookie: 'crumb=' + crumbToken },
      payload: { crumb: crumbToken }
    }

    const postResponse = await global.__SERVER__.inject(postOptions)
    expect(postResponse.statusCode).toBe(200)
    expect(postResponse.payload).toContain('Select what eligible items does your project need')
  })

  it('user selects eligible option(Allow selling direct to consumer) -> store user response and redirect to /score', async () => {
    const postOptions = {
      method: 'POST',
      url: `${global.__URLPREFIX__}/impact`,
      headers: { cookie: 'crumb=' + crumbToken },
      payload: { impact: 'Allow selling direct to consumer',  crumb: crumbToken }
    }

    const postResponse = await global.__SERVER__.inject(postOptions)
    expect(postResponse.statusCode).toBe(302)
    expect(postResponse.headers.location).toBe('score')
  })

  it('page loads with correct back link - /project-cost', async () => {
    const options = {
      method: 'GET',
      url: `${global.__URLPREFIX__}/impact`
    }
    const response = await global.__SERVER__.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.payload).toContain('<a href=\"project-cost\" class=\"govuk-back-link\">Back</a>')
  })
})
