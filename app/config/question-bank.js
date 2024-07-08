const { 
  PROJECT_COST_REGEX,
  NAME_ONLY_REGEX,
  WHOLE_NUMBER_REGEX,
  SBI_REGEX,
  MIN_2_LETTERS_TO_USE_SPECIAL_CHARACTER,
  EMAIL_REGEX,
  CHARS_MIN_10,
  PHONE_REGEX,
  ADDRESS_REGEX,
  MIN_3_LETTERS,
  ONLY_TEXT_REGEX,
  POSTCODE_REGEX,
  CURRENCY_FORMAT
} = require('ffc-grants-common-functionality').regex

const { LIST_COUNTIES } = require('ffc-grants-common-functionality').counties

const {
  MIN_GRANT,
  MAX_GRANT,
  VERANDA_MIN_GRANT,
  VERANDA_MAX_GRANT,
  GRANT_PERCENTAGE, 
  GRANT_PERCENTAGE_SOLAR
} = require('../helpers/grant-details')

/**
 * ----------------------------------------------------------------
 * list of yarKeys not bound to an answer, calculated separately
 * -  calculatedGrant
 * -  totalRemainingCost
 *
 * Mainly to replace the value of a previously stored input
 * Format: {{_VALUE_}}
 * eg: question.title: 'Can you pay £{{_storedYarKey_}}'
 * ----------------------------------------------------------------
 */

/**
 * ----------------------------------------------------------------
 * question type = single-answer, boolean ,input, multiinput, mullti-answer
 *
 *
 * ----------------------------------------------------------------
 */

/**
 * multi-input validation schema
 *
 *  type: 'multi-input',
    allFields: [
      {
        ...
        validate: [
          {
            type: 'NOT_EMPTY',
            error: 'Error message'
          },
          {
            type: 'REGEX',
            error: 'Error message',
            regex: SAVED_REGEX
          },
          {
            type: 'MIN_MAX',
            error: 'Error message',
            min: MINIMUM,
            max: MAXIMUM
          }
        ]
      }
    ]
 */

const questionBank = {
  grantScheme: {
    key: 'FFC002',
    name: 'Slurry Infrastructure'
  },
  sections: [
    {
      name: 'eligibility',
      title: 'Eligibility',
      questions: [
        {
          key: 'project-type',
          order: 10,
          title: 'What work are you doing to this building?',
          url: 'project-type',
          baseUrl: 'project-type',
          backUrl: 'start',
          nextUrl: 'current-system',
          hint: {
            html: `If you are applying for grant funding for multiple buildings, you must submit a separate application for each one`
          },
          ineligibleContent: {
            messageContent: `
                <div class="govuk-list govuk-list--bullet">
                <p class="govuk-body">This grant is for:</p>
                      <ul>
                        <li>adding a veranda only to an existing laying hen or pullet building </li>
                        <li>refurbishing an existing laying hen or pullet building</li>
                        <li>replacing an entire laying hen or pullet building with a new building</li>
                      </ul>
                </div>`,
            messageLink: {
              url: 'https://www.gov.uk/government/organisations/rural-payments-agency',
              title: 'See other grants you may be eligible for'
            }
          },
          type: 'single-answer',
          minAnswerCount: 1,
          sidebar: {
            values: [{
              heading: 'Eligibility',
              content: [{
                para: `This grant is only for laying hen or pullet projects.\n
                The maximum grant funding each business can apply for is £500,000 for comprehensive projects, or £100,000 for veranda-only projects.`
              }]
            }]
          },
          validate: [
            {
              type: 'NOT_EMPTY',
              error: 'Select what work you are doing to this building'
            }
          ],
          answers: [
            {
              key: 'project-type-A1',
              value: 'Adding a veranda only to the existing building',
              yarKeysReset: ['poultryType', 'projectCost', 'remainingCost', 'totalRemainingCost', 'calculatedGrant'],
              hint: {
                text: 'The RPA will award veranda-only grant funding on a first come, first served basis'
              }
            },
            {
              key: 'project-type-A2',
              value: 'Refurbishing the existing building',
              hint: {
                text: 'A comprehensive project to upgrade an existing building by adding mechanical ventilation, LED lighting and an aviary or multi-tier system where they do not exist already'
              },
            },
            {
              key: 'project-type-A3',
              value: 'Replacing the entire building with a new building',
              hint: {
                text: 'A comprehensive project to include mechanical ventilation, LED lighting and an aviary or multi-tier system'
              },
            },
            {
              value: 'divider'
            },
            {
              key: 'project-type-A4',
              value: 'None of the above',
              notEligible: true
            }
          ],
          yarKey: 'projectType'
        },
        {
          key: 'check-details',
          order: 400,
          title: 'Check your details',
          pageTitle: 'Check details',
          url: 'check-details',
          backUrl: 'applicant-details',
          nextUrl: 'veranda-confirm',
          preValidationKeys: ['projectType'],
          pageData: {
            businessDetailsLink: 'business-details',
            agentDetailsLink: 'agent-details',
            farmerDetailsLink: 'applicant-details'
          },
          fundingPriorities: '',
          type: '',
          minAnswerCount: 1,
          answers: []
        },
        {
          key: 'veranda-confirm',
          title: 'Confirm and send',
          order: 410,
          url: 'veranda-confirm',
          baseUrl: 'veranda-confirm',
          backUrl: 'check-details',
          nextUrl: 'veranda-confirmation',
          // preValidationKeys: ['projectType'],
          maybeEligible: true,
          maybeEligibleContent: {
            messageHeader: 'Confirm and send',
            messageContent: `I confirm that, to the best of my knowledge, the details I have provided are correct.</br></br>
            I understand the project’s eligibility and score is based on the answers I provided.</br></br>
            I am aware that the information I submit will be checked by the RPA.</br></br>
            I am happy to be contacted by Defra and RPA (or third-party on their behalf) about my application.`,
            insertText: {
              text: 'I understand that the RPA will award the veranda-only grant funding on a first come, first served basis.'
            },
            extraMessageContent: `<h2 class="govuk-heading-m">Improving our schemes</h2>
            As we develop new services we get feedback from farmers and agents.</br></br>
            You may be contacted by us or a third party that we work with.`
          },
          answers: [
            {
              key: 'consentOptional',
              value: 'CONSENT_OPTIONAL'
            }
          ],
          yarKey: 'consentOptional'
        },
        {
          key: 'veranda-confirmation',
          order: 425,
          title: 'Details submitted',
          pageTitle: '',
          url: 'veranda-confirmation',
          baseUrl: 'veranda-confirmation',
          ga: { name: 'confirmation', params: { journey: 'veranda'} },
          preValidationKeys: ['consentOptional'],
          maybeEligible: true,
          maybeEligibleContent: {
            reference: {
              titleText: 'Details submitted',
              html: 'Your reference number<br><strong>{{_confirmationId_}}</strong>',
              surveyLink: process.env.SURVEY_LINK
            },
            messageContent: `We have sent you a confirmation email with a record of your answers.<br/><br/>
              If you do not get an email within 72 hours, please call the RPA helpline and follow the options for the Farming Investment Fund scheme.<br/><br/>
              You can <a class="govuk-link" href="start">check if you can apply</a> for another veranda. The maximum total grant amount each business can apply for is £100,000 for veranda-only projects. 
              <h2 class="govuk-heading-m">RPA helpline</h2>
              <h3 class="govuk-heading-s">Telephone</h3>
              Telephone: 0300 0200 301<br/>
              Monday to Friday, 9am to 5pm (except public holidays)<br/>
              <p><a class="govuk-link" target="_blank" href="https://www.gov.uk/call-charges" rel="noopener noreferrer">Find out about call charges (opens in a new tab)</a></p>
              <h3 class="govuk-heading-s">Email</h3>
              <a class="govuk-link" title="Send email to RPA" target="_blank" rel="noopener noreferrer" href="mailto:ftf@rpa.gov.uk">FTF@rpa.gov.uk</a><br/><br/>
            
              <h2 class="govuk-heading-m">What happens next</h2>
              <ol class="govuk-list govuk-list--number">
                <li>The RPA will contact you to invite you to submit a full application.</li>
                <li>If your application is successful, you’ll be sent a funding agreement and can begin work on the project.</li>
              </ol>
            `,
            middleWarning: {
              text: 'You must not start the project.'
            },
            extraMessageContent: `<p>Starting the project or committing to any costs (such as placing orders) before you receive a funding agreement will invalidate your application.</p> 
            <p>Before you start the project, you can:</p>
            <ul>
              <li>get quotes from suppliers</li>
              <li>apply for planning permission</li>
            </ul>
            `,
          addText: false,
          conditionalInsertText: { 
            text: `If you want your landlord to underwrite your project, you should agree this with them before you begin your full application. Your landlord will need to complete a form at full application. This will confirm that they agree to take over your project, including conditions in your Grant Funding Agreement, if your tenancy ends.` 
          },
          surveyLinkText: `<p class="govuk-body"><a class="govuk-link" href="${process.env.SURVEY_LINK}" target="_blank" rel="noopener noreferrer">What do you think of this service? (opens in a new tab)</a></p>`
          }
        },
        {
          key: 'current-system',
          order: 180,
          title: 'What type of {{_poultryType_}} housing system do you currently use in the building?',
          pageTitle: '',
          backUrl: 'interruption-scoring',
          nextUrl: 'score',
          url: 'current-system',
          baseUrl: 'current-system',
          // preValidationObject: {
            // preValidationKeys: ['remainingCosts'],
            // preValidationAnswer: ['remaining-costs-A1'],
            // preValidationRule: 'AND',
            // preValidationUrls: ['remaining-costs']
          // },
          hint: {
            text: 'The housing system you are replacing or refurbishing for this project'
          },
          preValidationKeys: ['projectType'],
          score: {
            isScore: true,
            isDisplay: true
          },
          fundingPriorities: '',
          type: 'single-answer',
          minAnswerCount: 1,
          sidebar: {
            values: [{
              heading: 'Funding priorities',
              content: [{
                para: 'RPA want to prioritise supporting farmers that are transitioning out of using colony cages.'
              }]
            }]
          },
          validate: [
            {
              type: 'NOT_EMPTY',
              error: 'Select what type of {{_poultryType_}} housing system you currently use'
            }
          ],
          answers: [
            {
              key: 'current-system-A1',
              value: 'Colony cage',
              redirectUrl: 'ramp-connection',
              yarKeysReset: ['currentMultiTierSystem']
            },
            {
              key: 'current-system-A2',
              value: 'Combi-cage',
              redirectUrl: 'ramp-connection',
              yarKeysReset: ['currentMultiTierSystem']
            },
            {
              key: 'current-system-A3',
              value: 'Barn'
            },
            {
              key: 'current-system-A4',
              value: 'Free range'
            },
            {
              key: 'current-system-A5',
              value: 'Organic'
            },
            {
              value: 'divider'
            },
            {
              key: 'current-system-A6',
              value: 'None of the above',
            }
          ],
          yarKey: 'currentSystem'
        },
        {
          key: 'score',
          order: 185,
          title: 'Score results',
          url: 'score',
          baseUrl: 'score',
          backUrl: 'environmental-data-type',
          nextUrl: 'check-details',
          // preValidationKeys: ['environmentalDataType'],
          maybeEligible: true,
          maybeEligibleContent: {
            messageHeader: 'Your results',
            messageContent: `Based on your answers, your project is:
            <div class="govuk-inset-text">
              <span class="govuk-heading-m">Eligible to apply</span>
              </div>
              <p class='govuk-body'>
              The RPA wants to fund projects that have a higher environmental benefit. <br/><br/>
              We will do this by prioritising projects in areas that need urgent action 
              to reduce nutrient pollution from agriculture and restore natural habitats.<br/><br/>
              Depending on the number of applications received, we may invite projects 
              outside these areas to submit a full application.</p>`,
            extraMessageContent: `
            <h2 class="govuk-heading-m">Next steps</h2>
            <p class="govuk-body">Next, add your business and contact details and submit them to the RPA (you should only do this once).
            <br/><br/>
            You’ll get an email with your answers and a reference number.</p>`,
            insertText: { text: '' }
          },
          answers: []
        },
     ]
    }
  ]
}

const ALL_QUESTIONS = []
questionBank.sections.forEach(({ questions }) => {
  ALL_QUESTIONS.push(...questions)
})
const ALL_URLS = []
ALL_QUESTIONS.forEach(item => ALL_URLS.push(item.url))

const YAR_KEYS = ['remainingCost', 'totalRemainingCost', 'totalProjectCost', 'calculatedGrant', 'totalCalculatedGrant','solarCalculatedGrant',  'solarProjectCost', 'cappedSolarProjectCost', 'solarRemainingCost']
ALL_QUESTIONS.forEach(item => YAR_KEYS.push(item.yarKey))
module.exports = {
  questionBank,
  ALL_QUESTIONS,
  YAR_KEYS,
  ALL_URLS
}
