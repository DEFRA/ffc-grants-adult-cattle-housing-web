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
          backUrl: 'project-type',
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
            },
            {
              key: 'current-system-A2',
              value: 'Combi-cage',
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
          nextUrl: 'business-details',
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

        /// ////// ***************** After Score  ************************************/////////////////////
        {
          key: 'business-details',
          order: 360,
          title: 'Business details',
          pageTitle: '',
          url: 'business-details',
          baseUrl: 'business-details',
          //refactoring needed here
          backUrlObject: {
            dependentQuestionYarKey: 'projectType',
            dependentAnswerKeysArray: ['project-type-A1'],
            urlOptions: {
              thenUrl: 'veranda-remaining-costs',
              elseUrl: 'score'
            }
          },
          nextUrl: 'applying',
          // preValidationObject: {
          //   preValidationKeys: ['environmentalDataType', 'remainingCosts'],
          //   preValidationAnswer: ['environmental-data-type-A1', 'environmental-data-type-A2', 'environmental-data-type-A3', 'environmental-data-type-A4', 'environmental-data-type-A5', 'veranda-remaining-costs-A1'],
          //   preValidationRule: 'OR',
          //   preValidationUrls: ['environmental-data-type', 'veranda-remaining-costs']
          // },
          fundingPriorities: '',
          type: 'multi-input',
          minAnswerCount: '',
          maxAnswerCount: '',
          allFields: [
            {
              yarKey: 'projectName',
              type: 'text',
              classes: 'govuk-input--width-20',
              label: {
                text: 'Project name',
                classes: 'govuk-label'
              },
              hint: {
                text: 'For example Browns Hill Farm laying hens housing'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter a project name'
                },
                {
                  type: 'MIN_MAX_CHARS',
                  min: 0,
                  max: 30,
                  error: 'Project name must be 30 characters or fewer'
                },
                {
                  type: 'REGEX',
                  regex: NAME_ONLY_REGEX,
                  error: 'Project name must only include letters, hyphens, spaces and apostrophes'
                }
              ]
            },
            {
              yarKey: 'businessName',
              type: 'text',
              classes: 'govuk-input--width-20',
              label: {
                text: 'Business name',
                classes: 'govuk-label'
              },
              hint: {
                text: 'If you’re registered on the Rural Payments system, enter business name as registered'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter a business name'
                },
                {
                  type: 'MIN_MAX_CHARS',
                  min: 0,
                  max: 30,
                  error: 'Business name must be 30 characters or fewer'
                },
                {
                  type: 'REGEX',
                  regex: NAME_ONLY_REGEX,
                  error: 'Business name must only include letters, hyphens, spaces and apostrophes'
                }
              ]
            },
            {
              yarKey: 'numberEmployees',
              type: 'text',
              classes: 'govuk-input--width-4',
              inputmode: "numeric",
              label: {
                text: 'Number of employees',
                classes: 'govuk-label'
              },
              hint: {
                text: 'Full-time employees, including the owner'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter the number of employees'
                },
                {
                  type: 'REGEX',
                  regex: WHOLE_NUMBER_REGEX,
                  error: 'Number of employees must be a whole number, like 305'
                },
                {
                  type: 'MIN_MAX',
                  min: 1,
                  max: 9999999,
                  error: 'Number must be between 1-9999999'
                }
              ]
            },
            {
              yarKey: 'businessTurnover',
              type: 'number',
              inputmode: "numeric",
              classes: 'govuk-input--width-10',
              prefix: {
                text: '£'
              },
              label: {
                text: 'Annual business turnover (£)',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter your annual business turnover'
                },
                {
                  type: 'REGEX',
                  regex: WHOLE_NUMBER_REGEX,
                  error: 'Enter your annual business turnover, in pounds'
                },
                {
                  type: 'MIN_MAX',
                  min: 0,
                  max: 999999999,
                  error: 'Enter your annual business turnover, in pounds'
                }
              ]
            },
            {
              yarKey: 'sbi',
              type: 'number',
              title: 'Single Business Identifier (SBI) (Optional)',
              classes: 'govuk-input govuk-input--width-10',
              label: {
                text: 'Single Business Identifier (SBI) (Optional)',
                classes: 'govuk-label'
              },
              hint: {
                html: 'If you do not have an SBI, you will need to get one for full application'
              },
              validate: [
                {
                  type: 'REGEX',
                  regex: SBI_REGEX,
                  error: 'SBI number must have 9 characters, like 011115678'
                }
              ]
            },
            {
              yarKey: 'cph',
              type: 'text',
              title: 'County parish holding (CPH) number',
              classes: 'govuk-input--width-10',
              label: {
                text: 'County parish holding (CPH) number',
                classes: 'govuk-label'
              },
              hint: {
                html: 'For example, 12/345/6789'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter your Country parish holding (CPH) number'
                },
                {
                  type: 'REGEX',
                  regex: /^(\d{2}\s?)([\/\.\\\-]?)(\s?\d{3}\s?)\2(\s?\d{4})$/,
                  error: 'Enter your Country parish holding CPH number, like 12/345/6789'
                }
              ]
            },
          ],
          yarKey: 'businessDetails'
        },
        {
          key: 'applying',
          order: 370,
          title: 'Who is applying for this grant?',
          pageTitle: '',
          url: 'applying',
          baseUrl: 'applying',
          backUrl: 'business-details',
          preValidationKeys: ['businessDetails'],
          fundingPriorities: '',
          type: 'single-answer',
          classes: 'govuk-radios govuk-fieldset__legend--l',
          minAnswerCount: 1,
          validate: [
            {
              type: 'NOT_EMPTY',
              error: 'Select who is applying for this grant'
            }
          ],
          answers: [
            {
              key: 'applying-A1',
              value: 'Applicant',
              redirectUrl: 'applicant-details'
            },
            {
              key: 'applying-A2',
              value: 'Agent',
              redirectUrl: 'agent-details'
            }
          ],
          yarKey: 'applying'
        },
        {
          key: 'applicant-details',
          order: 380,
          title: 'Applicant’s details',
          pageTitle: '',
          url: 'applicant-details',
          baseUrl: 'applicant-details',
          nextUrl: 'check-details',
          preValidationKeys: ['applying'],
          backUrlObject: {
            dependentQuestionYarKey: 'applying',
            dependentAnswerKeysArray: ['applying-A2'],
            urlOptions: {
              thenUrl: 'agent-details',
              elseUrl: 'applying'
            }
          },
          fundingPriorities: '',
          type: 'multi-input',
          minAnswerCount: '',
          maxAnswerCount: '',
          allFields: [
            {
              yarKey: 'firstName',
              type: 'text',
              classes: 'govuk-input--width-20',
              label: {
                text: 'First name',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter your first name'
                },
                {
                  type: 'REGEX',
                  regex: MIN_2_LETTERS_TO_USE_SPECIAL_CHARACTER,
                  error: 'First name must include letters'
                },
                {
                  type: 'REGEX',
                  regex: NAME_ONLY_REGEX,
                  error: 'First name must only include letters, hyphens and apostrophes'
                },
                {
                  type: 'MIN_MAX_CHARS',
                  min: 0,
                  max: 30,
                  error: 'First name must be 30 characters or fewer'
                }
              ]
            },
            {
              yarKey: 'lastName',
              type: 'text',
              endFieldset: 'true',
              classes: 'govuk-input--width-20',
              label: {
                text: 'Last name',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter your last name'
                },
                {
                  type: 'REGEX',
                  regex: MIN_2_LETTERS_TO_USE_SPECIAL_CHARACTER,
                  error: 'Last name must include letters'
                },
                {
                  type: 'REGEX',
                  regex: NAME_ONLY_REGEX,
                  error: 'Last name must only include letters, hyphens and apostrophes'
                },
                {
                  type: 'MIN_MAX_CHARS',
                  min: 0,
                  max: 30,
                  error: 'Last name must include letters'
                }
              ]
            },
            {
              yarKey: 'emailAddress',
              type: 'email',
              classes: 'govuk-input--width-20',
              label: {
                text: 'Email address',
                classes: 'govuk-label'
              },
              hint: {
                text: 'We will only use this to send you confirmation'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter your email address'
                },
                {
                  type: 'REGEX',
                  regex: EMAIL_REGEX,
                  error: 'Enter an email address in the correct format, like name@example.com'
                }
              ]
            },
            {
              yarKey: 'confirmEmailAddress',
              type: 'email',
              classes: 'govuk-input--width-20',
              label: {
                text: 'Confirm email address',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Confirm your email address'
                },
                {
                  type: 'CONFIRMATION_ANSWER',
                  fieldsToCampare: ['emailAddress', 'confirmEmailAddress'],
                  error: 'Enter an email address that matches'
                }
              ]
            },
            {
              yarKey: 'mobileNumber',
              type: 'tel',
              classes: 'govuk-input--width-10',
              label: {
                text: 'Mobile phone number',
                classes: 'govuk-label'
              },
              hint: {
                text: 'We will only use this to contact you about your application'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter a mobile number (if you do not have a mobile, enter your landline number)',
                  extraFieldsToCheck: ['landlineNumber']
                },
                {
                  type: 'REGEX',
                  regex: CHARS_MIN_10,
                  error: 'Your mobile number must have at least 10 characters'
                },
                {
                  type: 'REGEX',
                  regex: PHONE_REGEX,
                  error: 'Enter a telephone number, like 01632 960 001, 07700 900 982 or +44 0808 157 0192'
                }
              ]
            },
            {
              yarKey: 'landlineNumber',
              endFieldset: 'true',
              type: 'tel',
              classes: 'govuk-input--width-10',
              label: {
                text: 'Landline number',
                classes: 'govuk-label'
              },
              hint: {
                text: 'We will only use this to contact you about your application'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter a landline number (if you do not have a landline, enter your mobile number)',
                  extraFieldsToCheck: ['mobileNumber']
                },
                {
                  type: 'REGEX',
                  regex: CHARS_MIN_10,
                  error: 'Your landline number must have at least 10 characters'
                },
                {
                  type: 'REGEX',
                  regex: PHONE_REGEX,
                  error: 'Enter a telephone number, like 01632 960 001, 07700 900 982 or +44 0808 157 0192'
                }
              ]
            },
            {
              type: 'sub-heading',
              text: 'Business address'
            },
            {
              yarKey: 'address1',
              type: 'text',
              classes: 'govuk-input--width-20',
              label: {
                html: 'Address line 1',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter your address line 1'
                },
                {
                  type: 'REGEX',
                  regex: ADDRESS_REGEX,
                  error: 'Address must only include letters, numbers, hyphens and apostrophes'
                },
                {
                  type: 'REGEX',
                  regex: MIN_3_LETTERS,
                  error: 'Address must include at least 3 letters'
                },
              ]
            },
            {
              yarKey: 'address2',
              type: 'text',
              classes: 'govuk-input--width-20',
              label: {
                html: 'Address line 2 (optional)',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'REGEX',
                  regex: ADDRESS_REGEX,
                  error: 'Address must only include letters, numbers, hyphens and apostrophes'
                },
                {
                  type: 'REGEX',
                  regex: MIN_3_LETTERS,
                  error: 'Address must include at least 3 letters'
                },
              ]
            },
            {
              yarKey: 'town',
              type: 'text',
              classes: 'govuk-input--width-10',
              label: {
                text: 'Town',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter your town'
                },
                {
                  type: 'REGEX',
                  regex: MIN_2_LETTERS_TO_USE_SPECIAL_CHARACTER,
                  error: 'Town must include letters'
                },
                {
                  type: 'REGEX',
                  regex: ONLY_TEXT_REGEX,
                  error: 'Town must only include letters, hyphens and spaces'
                }
              ]
            },
            {
              yarKey: 'county',
              type: 'select',
              classes: 'govuk-input--width-10',
              label: {
                text: 'County',
                classes: 'govuk-label'
              },
              answers: [
                ...LIST_COUNTIES
              ],
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Select your county'
                }
              ]
            },
            {
              yarKey: 'postcode',
              type: 'text',
              classes: 'govuk-input--width-5',
              label: {
                text: 'Business postcode',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter a business postcode, like AA1 1AA'
                },
                {
                  type: 'REGEX',
                  regex: POSTCODE_REGEX,
                  error: 'Enter a business postcode, like AA1 1AA'
                }
              ]
            },
            {
              yarKey: 'projectPostcode',
              type: 'text',
              endFieldset: 'true',
              classes: 'govuk-input--width-5',
              label: {
                text: 'Project postcode',
                classes: 'govuk-label'
              },
              hint: {
                text: 'The site postcode where the work will happen'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter a project postcode, like AA1 1AA'
                },
                {
                  type: 'REGEX',
                  regex: POSTCODE_REGEX,
                  error: 'Enter a project postcode, like AA1 1AA'
                }
              ]
            }
          ],
          yarKey: 'farmerDetails'
        },
        {
          key: 'agent-details',
          order: 390,
          title: 'Agent’s details',
          pageTitle: '',
          url: 'agent-details',
          baseUrl: 'agent-details',
          backUrl: 'applying',
          nextUrl: 'applicant-details',
          preValidationObject: {
            preValidationKeys: ['applying'],
            preValidationAnswer: ['applying-A2'],
            preValidationRule: 'AND',
            preValidationUrls: ['applying']
          },
          summaryPageUrl: 'check-details',
          fundingPriorities: '',
          type: 'multi-input',
          minAnswerCount: '',
          maxAnswerCount: '',
          allFields: [
            {
              yarKey: 'firstName',
              type: 'text',
              classes: 'govuk-input--width-20',
              label: {
                text: 'First name',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter your first name'
                },
                {
                  type: 'REGEX',
                  regex: MIN_2_LETTERS_TO_USE_SPECIAL_CHARACTER,
                  error: 'First name must include letters'
                },
                {
                  type: 'REGEX',
                  regex: NAME_ONLY_REGEX,
                  error: 'First name must only include letters, hyphens and apostrophes'
                },
                {
                  type: 'MIN_MAX_CHARS',
                  min: 0,
                  max: 30,
                  error: 'First name must be 30 characters or fewer'
                }
              ]
            },
            {
              yarKey: 'lastName',
              type: 'text',
              classes: 'govuk-input--width-20',
              label: {
                text: 'Last name',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter your last name'
                },
                {
                  type: 'REGEX',
                  regex: MIN_2_LETTERS_TO_USE_SPECIAL_CHARACTER,
                  error: 'Last name must include letters'
                },
                {
                  type: 'REGEX',
                  regex: NAME_ONLY_REGEX,
                  error: 'Last name must only include letters, hyphens and apostrophes'
                },
                {
                  type: 'MIN_MAX_CHARS',
                  min: 0,
                  max: 30,
                  error: 'Last name must include letters'
                }
              ]
            },
            {
              yarKey: 'businessName',
              type: 'text',
              endFieldset: 'true',
              classes: 'govuk-input--width-20',
              label: {
                text: 'Business name',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter your business name'
                },
                {
                  type: 'MIN_MAX_CHARS',
                  min: 0,
                  max: 30,
                  error: 'Name must be 30 characters or fewer'
                }
              ]
          },
            {
              yarKey: 'emailAddress',
              type: 'email',
              classes: 'govuk-input--width-20',
              label: {
                text: 'Email address',
                classes: 'govuk-label'
              },
              hint: {
                text: 'We will only use this to send you confirmation'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter your email address'
                },
                {
                  type: 'REGEX',
                  regex: EMAIL_REGEX,
                  error: 'Enter an email address in the correct format, like name@example.com'
                }
              ]
            },
            {
              yarKey: 'confirmEmailAddress',
              type: 'email',
              classes: 'govuk-input--width-20',
              label: {
                text: 'Confirm email address',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Confirm your email address'
                },
                {
                  type: 'CONFIRMATION_ANSWER',
                  fieldsToCampare: ['emailAddress', 'confirmEmailAddress'],
                  error: 'Enter an email address that matches'
                }
              ]
            },
            {
              yarKey: 'mobileNumber',
              type: 'tel',
              classes: 'govuk-input--width-10',
              label: {
                text: 'Mobile phone number',
                classes: 'govuk-label'
              },
              hint: {
                text: 'We will only use this to contact you about your application'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter a mobile phone number (if you do not have a mobile, enter your landline number)',
                  extraFieldsToCheck: ['landlineNumber']
                },
                {
                  type: 'REGEX',
                  regex: CHARS_MIN_10,
                  error: 'Your mobile number must have at least 10 characters'
                },
                {
                  type: 'REGEX',
                  regex: PHONE_REGEX,
                  error: 'Enter a telephone number, like 01632 960 001, 07700 900 982 or +44 0808 157 0192'
                }
              ]
            },
            {
              yarKey: 'landlineNumber',
              type: 'tel',
              endFieldset: 'true',
              classes: 'govuk-input--width-10',
              label: {
                text: 'Landline number',
                classes: 'govuk-label'
              },
              hint: {
                text: 'We will only use this to contact you about your application'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter a landline number (if you do not have a landline, enter your mobile phone number)',
                  extraFieldsToCheck: ['mobileNumber']
                },
                {
                  type: 'REGEX',
                  regex: CHARS_MIN_10,
                  error: 'Your landline number must have at least 10 characters'
                },
                {
                  type: 'REGEX',
                  regex: PHONE_REGEX,
                  error: 'Enter a telephone number, like 01632 960 001, 07700 900 982 or +44 0808 157 0192'
                }
              ]
            },
            {
              type: 'sub-heading',
              text: 'Business address'
            },
            {
              yarKey: 'address1',
              type: 'text',
              classes: 'govuk-input--width-20',
              label: {
                html: 'Address line 1',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter your address line 1'
                },
                {
                  type: 'REGEX',
                  regex: ADDRESS_REGEX,
                  error: 'Address must only include letters, numbers, hyphens and apostrophes'
                },
                {
                  type: 'REGEX',
                  regex: MIN_3_LETTERS,
                  error: 'Address must include at least 3 letters'
                },
              ]
            },
            {
              yarKey: 'address2',
              type: 'text',
              classes: 'govuk-input--width-20',
              label: {
                html: 'Address line 2 (optional)',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'REGEX',
                  regex: ADDRESS_REGEX,
                  error: 'Address must only include letters, numbers, hyphens and apostrophes'
                },
                {
                  type: 'REGEX',
                  regex: MIN_3_LETTERS,
                  error: 'Address must include at least 3 letters'
                },
              ]
            },
            {
              yarKey: 'town',
              type: 'text',
              classes: 'govuk-input--width-10',
              label: {
                text: 'Town',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter your town'
                },
                {
                  type: 'REGEX',
                  regex: MIN_2_LETTERS_TO_USE_SPECIAL_CHARACTER,
                  error: 'Town must include letters'
                },
                {
                  type: 'REGEX',
                  regex: ONLY_TEXT_REGEX,
                  error: 'Town must only include letters, hyphens and spaces'
                }
              ]
            },
            {
              yarKey: 'county',
              type: 'select',
              classes: 'govuk-input--width-10',
              label: {
                text: 'County',
                classes: 'govuk-label'
              },
              answers: [
                ...LIST_COUNTIES
              ],
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Select your county'
                }
              ]
            },
            {
              yarKey: 'postcode',
              type: 'text',
              endFieldset: 'true',
              classes: 'govuk-input--width-5',
              label: {
                text: 'Postcode',
                classes: 'govuk-label'
              },
              validate: [
                {
                  type: 'NOT_EMPTY',
                  error: 'Enter your postcode, like AA1 1AA'
                },
                {
                  type: 'REGEX',
                  regex: POSTCODE_REGEX,
                  error: 'Enter a postcode, like AA1 1AA'
                }
              ]
            }
          ],
          yarKey: 'agentsDetails'
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
