const appInsights = require('./app-insights')
const { getYarValue } = require('ffc-grants-common-functionality').session
const blockDefaultPageViews = ['login', 'start', 'applying', 'session-timeout']

const isBlockDefaultPageView = url => {
  const currentUrl = url.split('/').pop().toString().toLowerCase()
  return blockDefaultPageViews.indexOf(currentUrl) >= 0 && !url.includes('assets')
}

const grantType = 'Adult Cattle Housing'

const eventTypes = {
  PAGEVIEW: 'pageview',
  SCORE: 'score',
  ELIGIBILITY: 'eligibility_passed',
  CONFIRMATION: 'confirmation',
  ELIMINATION: 'elimination',
  EXCEPTION: 'exception'
}

const sendGAEvent = async (request, metrics) => {
  const timeSinceStart = getTimeofJourneySinceStart(request).toString()
  const pagePath = request.route.path
  const hostName = request.info.hostname
  const { name, params } = metrics
  const isEliminationEvent = name === eventTypes.ELIMINATION
  const isEligibilityEvent = name === eventTypes.ELIGIBILITY
  const isScoreEvent = name === eventTypes.SCORE
  const isConfirmationEvent = name === eventTypes.CONFIRMATION
  const dmetrics = {
    ...params,
    ...(isEliminationEvent && { elimination_time: timeSinceStart }),
    ...(isEligibilityEvent && { eligibility_time: timeSinceStart }),
    ...(isScoreEvent && { score_time: timeSinceStart }),
    ...(isConfirmationEvent && { final_score: getYarValue(request, 'current-score') ?? 'Eligible', user_type: getYarValue(request, 'applying'), confirmation_time: timeSinceStart }),
    ...(params?.score_presented && { score_presented: params.score_presented }),
    ...(params?.scoreReached && { scoreReached: params.scoreReached }),
    grant_type: grantType,
    page_title: pagePath,
    host_name: hostName
  }
  try {
    console.log(name, 'dmetrics:::::: ', dmetrics)
    const event = { name, params: dmetrics }
    await request.ga.view(request, [event])
    console.log('Metrics Sending analytics %s for %s', name, request.route.path)
  } catch (err) {
    appInsights.logException(request, { error: err })
  }
  console.log('[ %s MATRIC SENT ]', name.toUpperCase())
}

const getTimeofJourneySinceStart = request => {
  if (getYarValue(request, 'journey-start-time')) {
    return Math.abs(((new Date()).getTime() - (new Date(getYarValue(request, 'journey-start-time'))).getTime()) / 1000)
  }
  return 0
}

module.exports = {
  isBlockDefaultPageView,
  sendGAEvent,
  eventTypes
}
