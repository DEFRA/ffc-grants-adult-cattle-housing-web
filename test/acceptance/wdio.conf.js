const { ReportAggregator, HtmlReporter } = require('@rpii/wdio-html-reporter')
const log4js = require('@log4js-node/log4js-api')
const logger = log4js.getLogger('default')
const envRoot = (process.env.TEST_ENVIRONMENT_ROOT_URL || 'http://host.docker.internal:3600')
const chromeArgs = process.env.CHROME_ARGS ? process.env.CHROME_ARGS.split(' ') : []
const maxInstances = process.env.MAX_INSTANCES ? Number(process.env.MAX_INSTANCES) : 5

exports.config = {
  hostname: 'selenium',
  path: '/wd/hub',
  specs: ['./features/**/*.feature'],
  exclude: ['./scratch/**'],
  maxInstances,
  capabilities: [{
    maxInstances,
    acceptInsecureCerts: true,
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: chromeArgs
    }
  }],
  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  logLevel: 'warn',
  bail: 0,
  baseUrl: envRoot + '/selenium:4444',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  services: ['selenium-standalone'],
  framework: 'cucumber',
  specFileRetries: 1,
  specFileRetriesDelay: 30,
  reporters: ['spec',
    [HtmlReporter, {
      debug: false,
      outputDir: './html-reports/',
      filename: 'feature-report.html',
      reportTitle: 'Feature Test Report',
      showInBrowser: false,
      useOnAfterCommandForScreenshot: false,
      LOG: logger
    }]
  ],

  // If you are using Cucumber you need to specify the location of your step definitions.
  cucumberOpts: {
    require: ['./steps/**/*.js'],

    // <boolean> show full backtrace for errors
    backtrace: false,

    requireModule: [],

    // <boolean> invoke formatters without executing steps
    dryRun: false,

    // <boolean> abort the run on first failure
    failFast: false,

    // <string[]> (type[:path]) specify the output format, optionally supply PATH to redirect formatter output (repeatable)
    format: ['pretty'],

    // <boolean> disable colors in formatter output
    colors: true,

    // <boolean> hide step definition snippets for pending steps
    snippets: true,

    // <boolean> hide source uris
    source: true,

    // <string[]> (name) specify the profile to use
    profile: [],

    // <boolean> fail if there are any undefined or pending steps
    strict: false,

    // <string> (expression) only execute the features or scenarios with tags matching the expression
    tagExpression: '',

    // <number> timeout for step definitions
    timeout: 60000,

    // <boolean> Enable this config to treat undefined definitions as warnings.
    ignoreUndefinedDefinitions: false
  },

  // =====
  // Hooks
  // =====
  onPrepare: function (config, capabilities) {
    console.log(`Running tests against: ${envRoot}\n`)

    const reportAggregator = new ReportAggregator({
      outputDir: './html-reports/',
      filename: 'acceptance-test-suite-report.html',
      reportTitle: 'Acceptance Tests Report',
      browserName: capabilities.browserName
      // to use the template override option, can point to your own file in the test project:
      // templateFilename: path.resolve(__dirname, '../template/wdio-html-reporter-alt-template.hbs')
    })
    reportAggregator.clean()

    global.reportAggregator = reportAggregator
  },

  onComplete: function (exitCode, config, capabilities, results) {
    (async () => {
      await global.reportAggregator.createReport()
    })()
  },

  beforeSession: async function () {
    const chai = require('chai')

    global.expect = chai.expect
    global.assert = chai.assert
    global.should = chai.should()
  },

  afterStep: async function (featureName, feature, result, ctx) {
    if (result.passed) {
      return
    }

    const path = require('path')
    const moment = require('moment')

    const screenshotFileName = ctx.uri.split('.feature')[0].split('/').slice(-1)[0]
    const timestamp = moment().format('YYYYMMDD-HHmmss.SSS')
    const filepath = path.join('./html-reports/screenshots/', screenshotFileName + '-' + timestamp + '.png')

    await browser.saveScreenshot(filepath)
    process.emit('test:screenshot', filepath)
  }
}
