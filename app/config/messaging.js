const Joi = require('joi')

const sharedConfigSchema = {
  appInsights: Joi.object(),
  host: Joi.string().default('localhost'),
  password: Joi.string(),
  username: Joi.string(),
  useCredentialChain: Joi.bool().default(false)
}

const messageConfigSchema = Joi.object({
  contactDetailsQueue: {
    address: Joi.string().default('contactDetails'),
    type: Joi.string(),
    ...sharedConfigSchema
  },
  scoreRequestQueue: {
    address: Joi.string().default('scoreRequestQueue'),
    type: Joi.string(),
    ...sharedConfigSchema
  },
  scoreResponseQueue: {
    address: Joi.string().default('scoreResponseQueue'),
    type: Joi.string(),
    ...sharedConfigSchema
  },
  desirabilitySubmittedTopic: {
    address: Joi.string().default('desirabilitySubmittedTopic'),
    type: Joi.string(),
    ...sharedConfigSchema
  },
  desirabilitySubmittedMsgType: Joi.string(),
  fetchScoreRequestMsgType: Joi.string(),
  eligibilityAnswersMsgType: Joi.string(),
  contactDetailsMsgType: Joi.string(),
  msgSrc: Joi.string()
})

const sharedConfig = {
  appInsights: require('applicationinsights'),
  host: process.env.SERVICE_BUS_HOST,
  password: process.env.SERVICE_BUS_PASSWORD,
  username: process.env.SERVICE_BUS_USER,
  useCredentialChain: process.env.NODE_ENV === 'production'
}

const msgTypePrefix = 'uk.gov.ffc.grants' // ' '

const config = {
  contactDetailsQueue: {
    address: process.env.CONTACT_DETAILS_QUEUE_ADDRESS,
    type: 'queue',
    ...sharedConfig
  },
  scoreRequestQueue: {
    address: process.env.SCORE_REQUEST_QUEUE_ADDRESS,
    type: 'queue',
    ...sharedConfig
  },
  scoreResponseQueue: {
    address: process.env.SCORE_RESPONSE_QUEUE_ADDRESS,
    type: 'queue',
    ...sharedConfig
  },
  desirabilitySubmittedTopic: {
    address: process.env.DESIRABILITY_SUBMITTED_TOPIC_ADDRESS,
    type: 'topic',
    ...sharedConfig
  },
  desirabilitySubmittedMsgType: `${msgTypePrefix}.adultCattleHousing.desirability.notification`,
  fetchScoreRequestMsgType: `${msgTypePrefix}.fetch.adultCattleHousing.score.request`,
  eligibilityAnswersMsgType: `${msgTypePrefix}.adultCattleHousing.eligibility.details`,
  contactDetailsMsgType: `${msgTypePrefix}.adultCattleHousing.contact.details`,
  msgSrc: 'ffc-grants-adult-cattle-housing-web'
}

// Validate config
const result = messageConfigSchema.validate(config, {
  abortEarly: false
})

// // Throw if config is invalid
if (result.error) {
  throw new Error(`The message config is invalid. ${result.error.message}`)
}

module.exports = result.value
