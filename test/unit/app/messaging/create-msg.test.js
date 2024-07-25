process.env.MIN_GRANT = 20000
process.env.MAX_GRANT = 500000

describe('create-msg', () => {

  jest.mock('ffc-grants-common-functionality', () => {
    const original = jest.requireActual('ffc-grants-common-functionality')
    return {
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
        ...original.utils,
        getQuestionAnswer: (questionKey, answerKey, allQuestions) => null,
      },
      errorHelpers: {
        validateAnswerField: (request, key, regex, error) => null,
        checkInputError: (request, key, error) => null,
      },
      pageGuard: {
        guardPage: (request, h, page, next) => null
      }
    }
  });
  const { getYarValue } = require('ffc-grants-common-functionality').session

  const { getDesirabilityAnswers, getAllDetails, getDependentSideBar } = require('../../../../app/messaging/create-msg')

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

  describe('SideBar population', () => {
    test('should populate sidebar content items with answers from dependent questions', () => {
      const questions = [{ key: 'key-one', yarKey: 'keyOne' }, { key: 'key-two', yarKey: 'keyTwo' }];
      const sidebar = {
        values: [
          {
            content: [
              {
                items: [],
              },
            ],
          },
        ],
        dependentQuestionKeys: ['key-two'],
      } 
      const request = { yar: {
        keyOne: 'valueOne',
        keyTwo: ['valueTwo-1', 'valueTwo-2', 'valueTwo-3'], 
      }};
      getYarValue.mockImplementation((req, key) => (request.yar[key]))
  
      const result = getDependentSideBar(questions, sidebar, request);
  
      expect(result).toEqual({
        values: [
          {
            content: [
              {
                items: ['valueTwo-1', 'valueTwo-2', 'valueTwo-3'],
              },
            ],
          },
        ],
        dependentQuestionKeys: ['key-two'],
      })
    })

    test(`should populate sidebar content items with 'Not needed' if no answer from dependent questions`, () => {
      const questions = [{ key: 'key-one', yarKey: 'keyOne' }, { key: 'key-two', yarKey: 'keyTwo' }];
      const sidebar = {
        values: [
          {
            content: [
              {
                items: [],
              },
            ],
          },
        ],
        dependentQuestionKeys: ['key-two'],
      } 
      const request = { yar: {
        keyOne: 'valueOne',
      }};
      getYarValue.mockImplementation((req, key) => (request.yar[key]))
  
      const result = getDependentSideBar(questions, sidebar, request);
  
      expect(result).toEqual({
        values: [
          {
            content: [
              {
                items: ['Not needed'],
              },
            ],
          },
        ],
        dependentQuestionKeys: ['key-two'],
      })
    })
  })

})
