const { getModel } = require('../helpers/models')
const { checkErrors } = require('../helpers/errorSummaryHandlers')
const { getGrantValues } = require('../helpers/grants-info')
const { formatUKCurrency } = require('../helpers/data-formats')
const { SELECT_VARIABLE_TO_REPLACE, DELETE_POSTCODE_CHARS_REGEX } = require('ffc-grants-common-functionality').regex
const { getYarValue, setYarValue } = require('ffc-grants-common-functionality').session
const { getQuestionAnswer } = require('ffc-grants-common-functionality').utils
const { guardPage } = require('ffc-grants-common-functionality').pageGuard
const { getUrl } = require('../helpers/urls')
const { GRANT_PERCENTAGE, VERANDA_FUNDING_CAP_REACHED } = require('./grant-details')
const senders = require('../messaging/senders')

const { startPageUrl, urlPrefix, serviceEndDate, serviceEndTime } = require('./../config/server')

const emailFormatting = require('./../messaging/email/process-submission')
const gapiService = require('../services/gapi-service')

const {
  getConfirmationId,
  handleConditinalHtmlData,
  getCheckDetailsModel,
  getEvidenceSummaryModel,
  getDataFromYarValue,
  getConsentOptionalData
} = require('./pageHelpers')

const { getUserScore } = require('../messaging/application')
const { tableOrder } = require('./score-table-helper')
const createMsg = require('../messaging/create-msg')
const { desirability } = require('./../messaging/scoring/create-desirability-msg')
const { ALL_QUESTIONS } = require('../config/question-bank')
const { PROJECT_TYPE_KEY } = require('./contants')

const createModel = (data, backUrl, url) => {
  return {
    backLink: backUrl,
    formActionPage: url,
    ...data
  }
}

const checkYarKeyReset = (thisAnswer, request) => {
  if (thisAnswer?.yarKeysReset) {
    thisAnswer.yarKeysReset.forEach(yarKey => setYarValue(request, yarKey, null))
  }
}

const getReplacementText = (request, key, questionType, questionKey, trueReturn, falseReturn) => {
  return getYarValue(request, key) === getQuestionAnswer(questionType, questionKey, ALL_QUESTIONS) ? trueReturn : falseReturn
}

const insertYarValue = (field, request) => {
  return field.replace(SELECT_VARIABLE_TO_REPLACE, (_ignore, additionalYarKeyName) => field.includes('£') ? formatUKCurrency(getYarValue(request, additionalYarKeyName) || 0) : getYarValue(request, additionalYarKeyName))
}

const titleCheck = (question, title, request) => {
  if (title?.includes('{{_')) {
    question = {
      ...question,
      title: insertYarValue(title, request)
    }
  }

  return question
}

const labelTextCheck = (question, label, request) => {
  if (label?.text?.includes('{{_')) {
    question = {
      ...question,
      label: {
        ...label,
        text: insertYarValue(label.text, request)
      }
    }
  }

  return question
}

const hintTextCheck = (question, hint, request) => {
  if (hint?.html?.includes('{{_')) {
    question = {
      ...question,
      hint: {
        ...hint,
        html: insertYarValue(hint.html, request)
      }
    }
  }
  
  return question
}

const sidebarCheck = (question, request ) => {
  if (question.sidebar?.values[0]?.content[0]?.para.includes('{{_')) {
    question = {
      ...question,
      sidebar: {
        values: [
          {
            ...question.sidebar.values[0],
            content: [{
              ...question.sidebar.values[0].content[0],
              para: insertYarValue(question.sidebar.values[0].content[0].para, request),
            }
            ]
          }
        ]
      }
    }
  }

  if (question.sidebar?.values[0]?.content[0]?.items?.some(item => item.includes('{{_'))) {
    question = {
      ...question,
      sidebar: {
        values: [
          {
            ...question.sidebar.values[0],
            content: [
              {
                ...question.sidebar.values[0].content[0],
                items: question.sidebar.values[0].content[0].items.map(item => 
                  item.includes('{{_') ? insertYarValue(item, request) : item
                
                )
              }
            ]
          }
        ]
      }
    }
  }

  return question
}

const validateErrorCheck = (question, validate, url, request) => {

  // this sonar issue fix actually breaks all tests
  if (question?.validate && question.validate[0].error.includes('{{_')) {
    question = {
      ...question,
      validate: [
        {
          ...validate[0],
          error: insertYarValue(question.validate[0].error, request)
        },
        ...validate
      ]
    }
  }

  return question
}

const ineligibleContentCheck = (question, ineligibleContent, url,  request) => {
  if (question?.ineligibleContent?.messageContent.includes('{{_')) {
    question = {
      ...question,
      ineligibleContent: {
        ...question.ineligibleContent,
        messageContent: insertYarValue(ineligibleContent.messageContent, request)
      }
    }
  }
  
  return question
}

const showHideAnswer = (question, request) => { 
  if (question?.answers){
    for (let answer of question.answers) {
      if (answer.dependantShowHideKey && getYarValue(request, answer.dependantShowHideYarKey) === getQuestionAnswer(answer.dependantShowHideKey, answer.dependantShowHideAnswerKey, ALL_QUESTIONS)){
        question = {
          ...question,
          answers:  question.answers.filter(a =>  a.key !== answer.key)
        }
      }
    }
  }

  return question
}

const scorePageData = async (request, backUrl, url, h) => {
  const desirabilityAnswers = createMsg.getDesirabilityAnswers(request)
  const formatAnswersForScoring = desirability(desirabilityAnswers)

  try {
    const msgData = await getUserScore(formatAnswersForScoring, request.yar.id)
    console.log('[THIS IS WHAT WE GOT BACK]', msgData)

    setYarValue(request, 'current-score', msgData.desirability.overallRating.band) // do we need this alongside overAllScore? Having both seems redundant

    // Mocked score res
    let scoreChance
    switch (msgData.desirability.overallRating.band.toLowerCase()) {
      case 'strong':
        scoreChance = 'is likely to'
        break
      case 'average':
        scoreChance = 'might'
        break
      default:
        scoreChance = 'is unlikely to'
        break
    }

    setYarValue(request, 'overAllScore', msgData)

    const questions = msgData.desirability.questions.map(desirabilityQuestion => {
        const tableQuestion = tableOrder.filter(tableQuestionD => tableQuestionD.key === desirabilityQuestion.key)[0]
        desirabilityQuestion.title = tableQuestion.title
        desirabilityQuestion.desc = tableQuestion.desc ?? ''
        desirabilityQuestion.url = `${urlPrefix}/${tableQuestion.url}`
        desirabilityQuestion.order = tableQuestion.order
        desirabilityQuestion.unit = tableQuestion?.unit
        desirabilityQuestion.pageTitle = tableQuestion.pageTitle
        desirabilityQuestion.fundingPriorities = tableQuestion.fundingPriorities
        return desirabilityQuestion
    })

    await gapiService.sendGAEvent(request, { name: 'score', params: { score_presented: msgData.desirability.overallRating.band } })
    setYarValue(request, 'onScorePage', true)

    return h.view('score', createModel({
      titleText: msgData.desirability.overallRating.band,
      scoreData: msgData,
      questions: questions.sort((a, b) => a.order - b.order),
      scoreChance: scoreChance
    }, backUrl, url))
  } catch (error) {
    console.log('[Score ERROR]:',error)
    await gapiService.sendGAEvent(request, { name: gapiService.eventTypes.EXCEPTION, params: { error: error.message } })
    return h.view('500')
  }
}

const handlePotentialAmount = (request, maybeEligibleContent, url) => {
  if (url === 'potential-amount' && getYarValue(request, 'projectCost') > 1250000 && getYarValue(request, 'solarPVSystem') === 'No'){
    return {
      ...maybeEligibleContent,
      messageContent: 'You may be able to apply for a grant of up to £500,000, based on the estimated cost of £{{_projectCost_}}.',
      extraMessageContent: 'The maximum grant you can apply for is £500,000.'
    }
  } else if (url === 'potential-amount' && getYarValue(request, 'projectCost') >= 1250000 && getYarValue(request, 'solarPVSystem') === 'Yes'){
    return {
      ...maybeEligibleContent,
      messageContent: `You may be able to apply for a grant of up to £500,000, based on the estimated cost of £{{_projectCost_}}.</br></br>
      The maximum grant you can apply for is £500,000.`,
      insertText: { text:'You cannot apply for funding for a solar PV system if you have requested the maximum funding amount for building project costs.' },
      extraMessageContent: 'You can continue to check your eligibility for grant funding to replace or refurbish a {{_poultryType_}} house.'
    }
  } else if (url === 'veranda-potential-amount' && getYarValue(request, 'projectCost') > 250000) {
    return {
      ...maybeEligibleContent,
      potentialAmountConditional: true
    }
  } else if (url === 'veranda-potential-amount' && getYarValue(request, 'projectCost') <= 250000) {
    return {
      ...maybeEligibleContent,
      potentialAmountConditional: false
    }
  }
  return maybeEligibleContent
}

const handleConfirmation = async (url, request, confirmationId, maybeEligibleContent, h) => {
  if (maybeEligibleContent.reference) {
    if (!getYarValue(request, 'consentMain')) {
      return h.redirect(startPageUrl)
    }

    if ((url === 'confirmation' || url === 'veranda-confirmation' || url === 'veranda-waitlist-confirmation') && getYarValue(request, 'projectResponsibility') === getQuestionAnswer('current-system','current-system-A3', ALL_QUESTIONS)){
      maybeEligibleContent = {
        ...maybeEligibleContent,
        addText: true
      }
    }

    confirmationId = getConfirmationId(request.yar.id, request)
    try {
      const emailData = await emailFormatting({ body: createMsg.getAllDetails(request, confirmationId), scoring: getYarValue(request, 'overAllScore') }, request.yar.id)
      await senders.sendDesirabilitySubmitted(emailData, request.yar.id)
      console.log('[CONFIRMATION EVENT SENT]')
    } catch (err) {
      console.log('ERROR: ', err)
    }
    maybeEligibleContent = {
      ...maybeEligibleContent,
      reference: {
        ...maybeEligibleContent.reference,
        html: maybeEligibleContent.reference.html.replace(
          SELECT_VARIABLE_TO_REPLACE, (_ignore, _confirmatnId) => (
            confirmationId
          )
        )
      }
    }
    request.yar.reset()
  }
  return maybeEligibleContent
}


const maybeEligibleGet = async (request, confirmationId, question, url, nextUrl, backUrl, h) => {
  let { maybeEligibleContent } = question
  maybeEligibleContent.title = question.title
  let consentOptionalData

  maybeEligibleContent = handlePotentialAmount(request, maybeEligibleContent, url)
  
  maybeEligibleContent = {
    ...maybeEligibleContent,
    insertText: maybeEligibleContent?.insertText?.text ?  { text: maybeEligibleContent.insertText.text.replace(
      SELECT_VARIABLE_TO_REPLACE, (_ignore, additionalYarKeyName) => (
        formatUKCurrency(getYarValue(request, additionalYarKeyName) || 0)
      )
    )} : '',
    messageContent: maybeEligibleContent?.messageContent.replace(
      SELECT_VARIABLE_TO_REPLACE, (_ignore, additionalYarKeyName) => (
        formatUKCurrency(getYarValue(request, additionalYarKeyName) || 0)
      )
    ),
    extraMessageContent: maybeEligibleContent?.extraMessageContent ?  maybeEligibleContent.extraMessageContent.replace(
      SELECT_VARIABLE_TO_REPLACE, (_ignore, additionalYarKeyName) => (
        getReplacementText(request, additionalYarKeyName, 'poultry-type', 'poultry-type-A1', 'hen', 'pullet')
      )
    ) : '',
    surveyLinkText: maybeEligibleContent?.surveyLinkText ? maybeEligibleContent.surveyLinkText.replace(
      SELECT_VARIABLE_TO_REPLACE, (_ignore, additionalYarKeyName) => (
        formatUKCurrency(getYarValue(request, additionalYarKeyName) || 0)
      )
    ) : '',
  }

  if (url === 'confirm' || url === 'veranda-confirm') {
    const consentOptional = getYarValue(request, 'consentOptional')
    consentOptionalData = getConsentOptionalData(consentOptional)
  }

  maybeEligibleContent = await handleConfirmation(url, request, confirmationId, maybeEligibleContent, h)

  const MAYBE_ELIGIBLE = { ...maybeEligibleContent, consentOptionalData, url, nextUrl, backUrl }
  return h.view('maybe-eligible', MAYBE_ELIGIBLE)
}

const getUrlSwitchFunction = async (data, question, request, conditionalHtml, backUrl, nextUrl, h) => {
  switch (question.url) {
    case 'check-details': {
      return h.view('check-details', getCheckDetailsModel(request, question, backUrl, nextUrl))
    }
    case 'business-details':
    case 'agent-details':
    case 'applicant-details':
    default:
      return h.view('page', getModel(data, question, request, conditionalHtml))
  }
}

const getPage = async (question, request, h) => {
  let { url, nextUrlObject, type, title, hint, yarKey, ineligibleContent, label } = question
  const preValidationObject = question.preValidationObject ?? question.preValidationKeys 
  const nextUrl = getUrl(nextUrlObject, question.nextUrl, request)
  const isRedirect = guardPage(request, preValidationObject, startPageUrl, serviceEndDate, serviceEndTime, ALL_QUESTIONS)
  
  if (isRedirect) {
    return h.redirect(startPageUrl)
  }

  // formatting variables block
  question = titleCheck(question, title, request)
  question = sidebarCheck(question, request)
  question = ineligibleContentCheck(question, ineligibleContent, url, request)
  question = hintTextCheck(question, hint, request)
  question = labelTextCheck(question, label, request)
  question =  showHideAnswer(question, request)

  // score contains maybe eligible, so can't be included in getUrlSwitchFunction
  if (url === 'score') {
    return scorePageData(request, question.backUrl, url, h)
  }

  const confirmationId = ''
  await processGA(question, request)

  if (question.maybeEligible) {
    return maybeEligibleGet(request, confirmationId, question, url, nextUrl, question.backUrl, h)
  }

  const data = getDataFromYarValue(request, yarKey, type)

  let conditionalHtml
  if (question?.conditionalKey && question?.conditionalLabelData) {
    const conditional = yarKey === 'businessDetails' ? yarKey : question.conditionalKey
    conditionalHtml = handleConditinalHtmlData(
      type,
      question.conditionalLabelData,
      conditional,
      request
    )
  }
  return (getUrlSwitchFunction(data, question, request, conditionalHtml, question.backUrl, nextUrl, h))
}

const multiInputPostHandler = (currentQuestion, request, dataObject, payload, yarKey) => {
  const allFields = currentQuestion.allFields
  allFields.forEach(field => {
    const payloadYarVal = payload[field.yarKey]
      ? payload[field.yarKey].replace(DELETE_POSTCODE_CHARS_REGEX, '').split(/(?=.{3}$)/).join(' ').toUpperCase()
      : ''
    dataObject = {
      ...dataObject,
      [field.yarKey]: (
        (field.yarKey === 'postcode' || field.yarKey === 'projectPostcode')
          ? payloadYarVal
          : payload[field.yarKey] || ''
      ),
      ...field.conditionalKey ? { [field.conditionalKey]: payload[field.conditionalKey] } : {}
    }
  })
  setYarValue(request, yarKey, dataObject)
}

const multiInputForLoop = (payload, answers, type, yarKey, request) => {
  let thisAnswer
  if (yarKey === 'consentOptional' && !Object.keys(payload).includes(yarKey)) {
    setYarValue(request, yarKey, '')
  }

  for (const [key, value] of Object.entries(payload)) {
    // if statement added for multi-input eligibility for non-eligible
    if (typeof (value) === 'object') {
      thisAnswer = answers?.find(answer => (answer.value === value[0]))
    } else {
      thisAnswer = answers?.find(answer => (answer.value === value))
    }

    if (type !== 'multi-input' && key !== 'secBtn') {
      setYarValue(request, key, key === 'projectPostcode' ? value.replace(DELETE_POSTCODE_CHARS_REGEX, '').split(/(?=.{3}$)/).join(' ').toUpperCase() : value)
    }
  }

  return thisAnswer
}

// formatting variables block - needed for error validations
const formatVariablesBlock = (currentQuestion, title, baseUrl, request, validate, ineligibleContent, hint) => {
  currentQuestion = titleCheck(currentQuestion, title, request)
  currentQuestion = validateErrorCheck(currentQuestion, validate, baseUrl, request)
  currentQuestion = sidebarCheck(currentQuestion, request)
  currentQuestion = ineligibleContentCheck(currentQuestion, ineligibleContent, baseUrl, request)
  currentQuestion = hintTextCheck(currentQuestion, hint, request)
  currentQuestion = labelTextCheck(currentQuestion, currentQuestion.label, request)
  currentQuestion = showHideAnswer(currentQuestion, request)
  return currentQuestion
}

const handleRedirects = (baseUrl, request) => {
  if (baseUrl === PROJECT_TYPE_KEY && VERANDA_FUNDING_CAP_REACHED && getYarValue(request, 'projectType') === getQuestionAnswer(PROJECT_TYPE_KEY, 'project-type-A1', ALL_QUESTIONS)){
    return '/adult-cattle-housing/veranda-funding-cap'
  } else if (baseUrl === 'veranda-confirm' && VERANDA_FUNDING_CAP_REACHED){
    return '/adult-cattle-housing/veranda-waitlist-confirmation'
  }
  return null
}

const showPostPage = (currentQuestion, request, h) => {
  let { yarKey, answers, baseUrl, ineligibleContent, nextUrlObject, title, hint, type, validate } = currentQuestion
  const payload = request.payload

  if (baseUrl !== 'score') {
    setYarValue(request, 'onScorePage', false)
  }

  currentQuestion = formatVariablesBlock(currentQuestion, title, baseUrl, request, validate, ineligibleContent, hint)

  const thisAnswer = multiInputForLoop(payload, answers, type, yarKey, request)
  let NOT_ELIGIBLE = { ...currentQuestion?.ineligibleContent, backUrl: baseUrl }
  let dataObject

  checkYarKeyReset(thisAnswer, request)

  if (type === 'multi-input') {
    multiInputPostHandler(currentQuestion, request, dataObject, payload, yarKey)
  }

  const errors = checkErrors(payload, currentQuestion, h, request)
  if (errors) {
    return errors
  }

  const solarPVSystem = getYarValue(request, 'solarPVSystem')

  if (baseUrl === 'veranda-project-cost'){
    NOT_ELIGIBLE = { ...NOT_ELIGIBLE, specificTitle: `The minimum grant you can apply for is £5,000 (${GRANT_PERCENTAGE}% of £12,500)` }
  } else if (baseUrl === 'project-cost') {
    const insertText = solarPVSystem === 'Yes' ? { 
      text: 'You cannot apply for funding for solar PV system if you have not requested the minimum grant funding amount for a building.' 
    } : ''
    NOT_ELIGIBLE = { 
      ...NOT_ELIGIBLE, 
      specificTitle: `The minimum grant you can apply for is £15,000 (${GRANT_PERCENTAGE}% of £37,500)`, 
      insertText
    }
  }

  if (thisAnswer?.notEligible) {
    gapiService.sendGAEvent(request,
      { name: gapiService.eventTypes.ELIMINATION, params: {} })
    return h.view('not-eligible', NOT_ELIGIBLE)
  }

  const nextUrl = currentQuestion.nextUrl

  const redirectUrl = handleRedirects(baseUrl, request)
  if (redirectUrl) {
    return h.redirect(redirectUrl)
  }
    
  if (thisAnswer?.redirectUrl) {
    return h.redirect(thisAnswer?.redirectUrl)
  }

  return h.redirect(getUrl(nextUrlObject, nextUrl, request, payload.secBtn, currentQuestion.url))
}

const getHandler = question => (request, h) => getPage(question, request, h)

const getPostHandler = currentQuestion => (request, h) => showPostPage(currentQuestion, request, h)

const processGA = async (question, request) => {
  if (question.ga) {
    if (question.ga.journeyStart) {
      setYarValue(request, 'journey-start-time', Date.now())
      console.log('[JOURNEY STARTED] ')
    } else {
      await gapiService.sendGAEvent(request, question.ga)
    }
  }
}

module.exports = {
  getHandler,
  getPostHandler,
  insertYarValue,
  createModel
}
