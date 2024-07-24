const { YAR_KEYS } = require('../config/question-bank')
const Joi = require('joi')
const { getDataFromYarValue } = require('./../helpers/pageHelpers')
const { getQuestionByKey } = require('ffc-grants-common-functionality').utils
const { getYarValue } = require('ffc-grants-common-functionality').session

const multiAnswer = 'multi-answer'

const getDependentSideBar = (questions, sidebar, request) => {
  const { values, dependentQuestionKeys } = sidebar
  dependentQuestionKeys?.forEach((dependentQuestionKey, index) => {
    const yarKey = getQuestionByKey(dependentQuestionKey, questions).yarKey
    const selectedAnswers = getYarValue(request, yarKey)

    if (selectedAnswers) {
      values[index].content[0].items = [selectedAnswers].flat()
    } else {
      values[index].content[0].items = ['Not needed']
    }

  })
  return {
    ...sidebar
  }
}

function getAllDetails (request, confirmationId) {
  return YAR_KEYS.reduce(
    (allDetails, key) => {
      allDetails[key] = getYarValue(request, key)
      return allDetails
    },
    { confirmationId }
  )
}

const desirabilityAnswersSchema = Joi.object({
  impact: Joi.array().items(Joi.string()),
})

function getDesirabilityAnswers (request) {
  try {
    const val = {
      impact: getDataFromYarValue(request, 'impact', multiAnswer),
    }

    const result = desirabilityAnswersSchema.validate(val, {
      abortEarly: false
    })
    if (result.error) {
      throw new Error(`The scoring data is invalid. ${result.error.message}`)
    }
    return result.value
  } catch (ex) {
    console.log(ex, 'error')
    return null
  }
}

module.exports = {
  getDesirabilityAnswers,
  getAllDetails,
  getDependentSideBar
}
