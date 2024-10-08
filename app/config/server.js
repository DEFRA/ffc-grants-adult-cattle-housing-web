const Joi = require('joi')
const urlPrefix = '/adult-cattle-housing'
const startPageUrl = '/start'
const serviceEndDate = '2025/07/12'
const serviceEndTime = '23:59:59'

require('dotenv').config()

// Define config schema
const schema = Joi.object({
  urlPrefix: Joi.string().default(urlPrefix),
  serviceEndDate: Joi.string().default(serviceEndDate),
  serviceEndTime: Joi.string().default(serviceEndTime),
  cookiePassword: Joi.string().default('dummycookiepassworddummycookiepassword'),
  surveyLink: Joi.string().default('someValue'),
  googleTagManagerKey: Joi.string().default('GTM-WJ5C78H'),
  googleTagManagerServerKey: Joi.string().default('G-1NQ7QYDS14'),
  analyticsPropertyApi: Joi.string().default('dummy'),
  analyticsTagKey: Joi.string().default('GT-MJPRKW7'),
  protectiveMonitoringUrl: Joi.string().allow(''),
  startPageUrl: Joi.string().default(`${urlPrefix}${startPageUrl}`),
  cookieOptions: Joi.object({
    ttl: Joi.number().default(1000 * 60 * 60 * 24 * 365),
    encoding: Joi.string().valid('base64json').default('base64json'),
    isSecure: Joi.bool().default(true),
    isHttpOnly: Joi.bool().default(true),
    clearInvalid: Joi.bool().default(false),
    strictHeader: Joi.bool().default(true),
    isSameSite: Joi.string().valid('Strict').default('Strict')
  }),
  appInsights: {
    key: Joi.string(),
    role: Joi.string().default('ffc-grants-adult-cattle-housing')
  }
})

// Build config
const config = {
  urlPrefix: process.env.URL_PREFIX,
  cookiePassword: process.env.COOKIE_PASSWORD,
  surveyLink: process.env.SURVEY_LINK,
  googleTagManagerKey: process.env.GOOGLE_TAG_MANAGER_KEY,
  googleTagManagerServerKey: process.env.GOOGLE_TAG_MANAGER_SERVER_KEY,
  analyticsPropertyApi: process.env.ANALYTICS_PROPERTY_API,
  analyticsTagKey: process.env.ANALYTICS_TAG_KEY,
  protectiveMonitoringUrl: process.env.PROTECTIVE_MONITORING_URL,
  startPageUrl: process.env.START_PAGE_URL,
  serviceEndDate: process.env.SERVICE_END_DATE,
  serviceEndTime: process.env.SERVICE_END_TIME,
  cookieOptions: {
    ttl: process.env.COOKIE_TTL_IN_MILLIS,
    encoding: 'base64json',
    isSecure: process.env.NODE_ENV === 'production',
    isHttpOnly: true,
    clearInvalid: false,
    strictHeader: true,
    isSameSite: 'Strict'
  },
  appInsights: {
    key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
    role: process.env.APPINSIGHTS_CLOUDROLE
  }
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}
module.exports = result.value
