const { YAR_KEYS } = require('../config/question-bank')
const Joi = require('joi')
const { getYarValue } = require('ffc-grants-common-functionality').session
const { inspect } = require('util')

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
  impact: Joi.array().items(Joi.string()),
})

function getDesirabilityAnswers (request) {
  try {
    console.log(`REQUEST=${inspect(request)}`)
    const val = {
      impact: getYarValue(request, 'impact'),
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
