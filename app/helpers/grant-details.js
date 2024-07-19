require('dotenv').config()
const MIN_GRANT = 20000
const MAX_GRANT = 500000
const GRANT_PERCENTAGE = process.env.GRANT_PERCENTAGE
const FUNDING_CAP_REACHED = process.env.FUNDING_CAP_REACHED === 'true'

module.exports = {
  MIN_GRANT,
  MAX_GRANT,
  GRANT_PERCENTAGE,
  FUNDING_CAP_REACHED
}
