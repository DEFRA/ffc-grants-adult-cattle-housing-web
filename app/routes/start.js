const { formatUKCurrency } = require('../helpers/data-formats')
const { GRANT_PERCENTAGE, MAX_GRANT, MIN_GRANT } = require('../helpers/grant-details')
const urlPrefix = require('../config/server').urlPrefix
const currentPath = `${urlPrefix}/start`
const nextPath = `${urlPrefix}/legal-status`

module.exports = {
  method: 'GET',
  path: currentPath,
  handler: (_request, h) => h.view('home', { button: { nextLink: nextPath, text: 'Start now' }, grantPercentage: GRANT_PERCENTAGE, minGrant: formatUKCurrency(MIN_GRANT), maxGrant: formatUKCurrency(MAX_GRANT) })
}
