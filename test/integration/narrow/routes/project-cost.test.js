const { commonFunctionsMock } = require('../../../session-mock')
const { crumbToken } = require('./test-helper')

const utilsList = {}

describe('Project cost page', () => {
  let varList = {}
  let valList = {}

  process.env.GRANT_PERCENTAGE = 50
  process.env.GRANT_PERCENTAGE_SOLAR = 25

  commonFunctionsMock(varList, undefined, utilsList, valList)
  
  it('should load page successfully - project type is refurbishing', async () => {

    const options = {
      method: 'GET',
      url: `${global.__URLPREFIX__}/project-cost`
    }

    const response = await global.__SERVER__.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.payload).toContain('What is the estimated cost of the items?')
    expect(response.payload).toContain('You can only apply for a grant of up to 50% of the estimated costs. The minimum grant you can apply for this project is £20,000 (50% of £62,500). The maximum grant is £500,000.')
  })

  describe('Validation errors', () => {

    beforeEach(() => {
      valList.projectCost = {
        error: 'Enter a whole number with a maximum of 7 digits',
        return: false
      }
    })
  
    afterEach(() => {
      delete valList.projectCost
    })

    it('should return an error message if number contains a space', async () => {
      const postOptions = {
        method: 'POST',
        url: `${global.__URLPREFIX__}/project-cost`,
        payload: { projectCost: '1234 6', crumb: crumbToken },
        headers: { cookie: 'crumb=' + crumbToken }
      }
  
      const postResponse = await global.__SERVER__.inject(postOptions)
      expect(postResponse.statusCode).toBe(200)
      expect(postResponse.payload).toContain('Enter a whole number with a maximum of 7 digits')
    })
  
    it('should return an error message if number contains a comma "," ', async () => {
      const postOptions = {
        method: 'POST',
        url: `${global.__URLPREFIX__}/project-cost`,
        payload: { projectCost: '123,456', crumb: crumbToken },
        headers: { cookie: 'crumb=' + crumbToken }
      }
  
      const postResponse = await global.__SERVER__.inject(postOptions)
      expect(postResponse.statusCode).toBe(200)
      expect(postResponse.payload).toContain('Enter a whole number with a maximum of 7 digits')
    })

    it('should return an error message if a fraction is typed in - it contains a dot "." ', async () => {
      const postOptions = {
        method: 'POST',
        url: `${global.__URLPREFIX__}/project-cost`,
        payload: { projectCost: '123.456', crumb: crumbToken },
        headers: { cookie: 'crumb=' + crumbToken }
      }
  
      const postResponse = await global.__SERVER__.inject(postOptions)
      expect(postResponse.statusCode).toBe(200)
      expect(postResponse.payload).toContain('Enter a whole number with a maximum of 7 digits')
    })

    it('should return an error message if the number of digits typed exceed 7', async () => {
      const postOptions = {
        method: 'POST',
        url: `${global.__URLPREFIX__}/project-cost`,
        payload: { projectCost: '12345678', crumb: crumbToken },
        headers: { cookie: 'crumb=' + crumbToken }
      }
  
      const postResponse = await global.__SERVER__.inject(postOptions)
      expect(postResponse.statusCode).toBe(200)
      expect(postResponse.payload).toContain('Enter a whole number with a maximum of 7 digits')
    })

    it('should return an error message if no value entered', async () => {
      valList['NOT_EMPTY'] = {
        error: 'Enter the total estimated cost of the items',
        return: false
      }
  
      const postOptions = {
        method: 'POST',
        url: `${global.__URLPREFIX__}/project-cost`,
        payload: { crumb: crumbToken },
        headers: { cookie: 'crumb=' + crumbToken }
      }
  
      const postResponse = await global.__SERVER__.inject(postOptions)
      expect(postResponse.statusCode).toBe(200)
      expect(postResponse.payload).toContain('Enter the total estimated cost of the items')
    })
  })
})
