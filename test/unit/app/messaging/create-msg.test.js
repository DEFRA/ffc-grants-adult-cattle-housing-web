describe('create-msg', () => {

  jest.mock('ffc-grants-common-functionality', () => ({
    session: {
      getYarValue: jest.fn((request, key) => key),
    },
    regex: {
      PROJECT_COST_REGEX: /^[1-9]\d*$/
    },
    counties: {
      LIST_COUNTIES: ['Derbyshire', 'Leicestershire', 'Lincolnshire', 'Northamptonshire', 'Nottinghamshire', 'Rutland']
    },
    answerOptions: {
      getOptions: (data, question, conditionalHTML, request) => null,
      setOptionsLabel: (data, answers, conditonalHTML) => null
    },
    utils: {
      getQuestionAnswer: (questionKey, answerKey, allQuestions) => null,
    },
    errorHelpers: {
      validateAnswerField: (request, key, regex, error) => null,
      checkInputError: (request, key, error) => null,
    },
    pageGuard: {
      guardPage: (request, h, page, next) => null
    }
  }));
  const { getYarValue } = require('ffc-grants-common-functionality').session

  const { getDesirabilityAnswers, getAllDetails } = require('../../../../app/messaging/create-msg')

  test('check getDesirabilityAnswers()', () => {
    let dict
    getYarValue.mockImplementation((req, key) => (dict[key]))

    dict = {
      impact: ['hello'],
    }
    expect(getDesirabilityAnswers({})).toEqual({
      impact: ['hello'],
    })

    dict = {
      impact: ['hello'],
    }
    expect(getDesirabilityAnswers({})).toEqual({
      impact: ['hello'],
    })

    dict = {
      impact: null,
    }
    expect(getDesirabilityAnswers({})).toEqual(null)
  })

  test('getAllDetails', () => {
    const request = {};
    const confirmationId = '123';

    const result = getAllDetails(request, confirmationId);


    expect(result.confirmationId).toEqual('123');

  })
})
