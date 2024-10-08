const Analytics = require('@defra/hapi-gapi/lib/analytics')
const gapiService = require('../services/gapi-service')
const { getYarValue } = require('ffc-grants-common-functionality').session
exports.plugin = {
  name: 'Gapi',
  /**
     * Initialise the hapi-gapi plugin & send default page view to google analytics.
     *
     * @param server the hapi server instance
     * @param options the hapi-gapi configuration settings
     */
  register: async (server, options) => {
    const analytics = new Analytics(options)

    server.decorate('request', 'ga', request => analytics.ga(request), { apply: true })

    server.ext('onPreResponse', async (request, h) => {
      try {
        const response = request.response
        const statusFamily = Math.floor(response.statusCode / 100)
        if (statusFamily === 2 && response.variety === 'view' && !gapiService.isBlockDefaultPageView(request.url.pathname)) {
          await gapiService.sendGAEvent(request,
            {
              name: gapiService.eventTypes.PAGEVIEW,
              params:
                {
                  page_path: request.route.path,
                  scoreReached: getYarValue(request, 'onScorePage') ? '/adult-cattle-housing/score' : '0'
                }
            })
        }
        if (statusFamily === 5) {
          await request.ga.event({ category: 'Exception', action: request.route.path, label: response.statusCode })
        }
      } catch (error) {
        console.log(`[THIS IS GA ERROR: ${error}]`)
      }
      return h.continue
    })
  }
}
