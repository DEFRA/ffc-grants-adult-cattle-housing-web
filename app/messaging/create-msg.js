const { YAR_KEYS } = require('../config/question-bank')
const Joi = require('joi')
const { getDataFromYarValue } = require('./../helpers/pageHelpers')
const { getYarValue } = require('ffc-grants-common-functionality').session

const multiAnswer = 'multi-answer'

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
  currentSystem: Joi.string(),
})

function getDesirabilityAnswers (request) {
  try {
    const val = {
      currentSystem: getYarValue(request, 'currentSystem'),
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
  getAllDetails
}
