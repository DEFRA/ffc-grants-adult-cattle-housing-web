const { commonFunctionsMock } = require('../../../session-mock')
const { crumbToken } = require('./test-helper')

describe('Page: /current-system', () => {
  let varList = {
    poultryType: 'hen',
  }

  let valList = {}
  
  commonFunctionsMock(varList, undefined, {}, valList)

  it('page loads successfully, with all the options', async () => {
    const options = {
      method: 'GET',
      url: `${global.__URLPREFIX__}/current-system`
    }

    const response = await global.__SERVER__.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.payload).toContain('What type of hen housing system do you currently use in the building?')
    expect(response.payload).toContain('Colony cage')
    expect(response.payload).toContain('Combi-cage')
    expect(response.payload).toContain('Barn')
    expect(response.payload).toContain('Free range')
    expect(response.payload).toContain('Organic')
    expect(response.payload).toContain('None of the above')
  })

  it('no option selected -> show error message', async () => {
    valList['NOT_EMPTY'] = {
      error: 'Select what type of hen housing system you currently use',
      return: false
    }

    const postOptions = {
      method: 'POST',
      url: `${global.__URLPREFIX__}/current-system`,
      headers: { cookie: 'crumb=' + crumbToken },
      payload: { crumb: crumbToken }
    }

    const postResponse = await global.__SERVER__.inject(postOptions)
    expect(postResponse.statusCode).toBe(200)
    expect(postResponse.payload).toContain('Select what type of hen housing system you currently use')
  })

  it('user selects eligible option(Barn) -> store user response and redirect to /score', async () => {
    const postOptions = {
      method: 'POST',
      url: `${global.__URLPREFIX__}/current-system`,
      headers: { cookie: 'crumb=' + crumbToken },
      payload: { currentSystem: 'Barn',  crumb: crumbToken }
    }

    const postResponse = await global.__SERVER__.inject(postOptions)
    expect(postResponse.statusCode).toBe(302)
    expect(postResponse.headers.location).toBe('score')
  })

  it('page loads with correct back link - /project-type', async () => {
    const options = {
      method: 'GET',
      url: `${global.__URLPREFIX__}/current-system`
    }
    const response = await global.__SERVER__.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.payload).toContain('<a href=\"project-type\" class=\"govuk-back-link\">Back</a>')
  })
})
