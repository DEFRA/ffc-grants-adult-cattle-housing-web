const emailConfig = require('./config/email')
const { GRANT_PERCENTAGE } = require('../../helpers/grant-details')
const spreadsheetConfig = require('./config/spreadsheet')
const { microEmployeesNum, smallEmployeesNum, mediumEmployeesNum } = require('./business-size-constants')

const IMPACT_ROW_NUMBER = 503;

function getQuestionScoreBand(questions, questionKey) {
  return questions.filter(question => question.key === questionKey).length > 0
    ? questions.find(question => question.key === questionKey).rating.band
    : ''
}

function generateRow(rowNumber, name, value, bold = false) {
  return {
    row: rowNumber,
    values: ['', name, value],
    bold
  }
}

function calculateBusinessSize(employees) {
  const employeesNum = Number(employees)

  if (employeesNum < microEmployeesNum) {
    return 'Micro'
  } else if (employeesNum < smallEmployeesNum) {
    return 'Small'
  } else if (employeesNum < mediumEmployeesNum) {
    return 'Medium'
  } else {
    return 'Large'
  }
}

function addAgentDetailsAddress(agentsDetails) {
  return [
    generateRow(29, 'Agent Address line 1', agentsDetails?.address1 ?? ''),
    generateRow(30, 'Agent Address line 2', agentsDetails?.address2 ?? ''),
    generateRow(32, 'Agent Address line 4 (town)', agentsDetails?.town ?? ''),
    generateRow(33, 'Agent Address line 5 (County)', agentsDetails?.county ?? ''),
    generateRow(34, 'Agent Postcode (use capitals)', agentsDetails?.postcode ?? '')
  ]
}

function addAgentDetails(agentsDetails) {
  return [
    generateRow(26, 'Agent Surname', agentsDetails?.lastName ?? ''),
    generateRow(27, 'Agent Forename', agentsDetails?.firstName ?? ''),
    ...addAgentDetailsAddress(agentsDetails),
    generateRow(35, 'Agent Landline number', agentsDetails?.landlineNumber ?? ''),
    generateRow(36, 'Agent Mobile number', agentsDetails?.mobileNumber ?? ''),
    generateRow(37, 'Agent Email', agentsDetails?.emailAddress ?? ''),
    generateRow(28, 'Agent Business Name', agentsDetails?.businessName ?? '')
  ]
}

function getScoringFields(submission) {
  return [
    generateRow(IMPACT_ROW_NUMBER, 'Impact', submission.impact),
  ]
}

function generateExcelFilename(scheme, projectName, businessName, referenceNumber, today) {
  const dateTime = new Intl.DateTimeFormat('en-GB', {
    timeStyle: 'short',
    dateStyle: 'short',
    timeZone: 'Europe/London'
  }).format(today).replace(/\//g, '-')
  return `${scheme}_${projectName}_${businessName}_${referenceNumber}_${dateTime}.xlsx`
}

// formats for business type dora field (single answer accepted)
function getBusinessTypeC53(businessTypeArray, horticulture) {
  if (businessTypeArray.includes(horticulture) || businessTypeArray.includes('Farmer with Arable')) {
    return 'Mixed farming'
  } else {
    return 'Farmer with livestock'
  }
}

// confirm following values and mapping
const getPlanningPermissionDoraValue = planningPermission => {
  switch (planningPermission) {
    case 'Should be in place by the time I make my full application':
      return 'Applied for'
    case 'Not needed':
      return 'Not needed'
    default:
      return 'Approved'
  }
}

const generateDoraRows = (submission, subScheme, businessTypeArray, projectDescriptionString, todayStr, desirabilityScore) => {
  const horticulture = 'Farmer with Horticulture'

  return [
    generateRow(1, 'Field Name', 'Field Value', true),
    generateRow(2, 'FA or OA(EOI):', 'Outline Application'),
    generateRow(40, 'Scheme', 'Farming Transformation Fund'),
    generateRow(39, 'Sub scheme', subScheme),
    generateRow(90, 'Sub-Theme / Project type', ''),
    generateRow(41, 'Owner', 'RD'),
    generateRow(53, 'Business type', getBusinessTypeC53(businessTypeArray, horticulture)),
    generateRow(341, 'Grant Launch Date', '26/06/2024'),
    generateRow(23, 'Business Form Classification (Status of Applicant)', submission.legalStatus),

    generateRow(44, 'Description of Project', projectDescriptionString),

    generateRow(45, 'Location of project (postcode)', submission.farmerDetails.projectPostcode),
    generateRow(376, 'Project Started', submission.projectStart),
    generateRow(342, 'Land owned by Farm', submission.tenancy),
    generateRow(448, 'Project Responsibility', submission.projectResponsibility),

    ...getScoringFields(submission),

    generateRow(346, 'Planning Permission Status', getPlanningPermissionDoraValue(submission.planningPermission)),
    generateRow(366, 'Date of OA decision', ''), // confirm
    generateRow(42, 'Project name', submission.businessDetails.projectName),
    generateRow(4, 'Single business identifier (SBI)', submission.businessDetails.sbi || '000000000'),
    generateRow(518, 'CPH Number', submission.businessDetails.cph),
    generateRow(7, 'Business name', submission.businessDetails.businessName),
    generateRow(367, 'Annual Turnover', submission.businessDetails.businessTurnover),
    generateRow(22, 'Employees', submission.businessDetails.numberEmployees),
    generateRow(20, 'Business size', calculateBusinessSize(submission.businessDetails.numberEmployees)),
    generateRow(91, 'Are you an AGENT applying on behalf of your customer', submission.applying === 'Agent' ? 'Yes' : 'No'),
    generateRow(5, 'Surname', submission.farmerDetails.lastName),
    generateRow(6, 'Forename', submission.farmerDetails.firstName),
    generateRow(8, 'Address line 1', submission.farmerDetails.address1),
    generateRow(9, 'Address line 2', submission.farmerDetails.address2),
    generateRow(11, 'Address line 4 (town)', submission.farmerDetails.town),
    generateRow(12, 'Address line 5 (county)', submission.farmerDetails.county),
    generateRow(13, 'Postcode (use capitals)', submission.farmerDetails.postcode),
    generateRow(16, 'Landline number', submission.farmerDetails.landlineNumber ?? ''),
    generateRow(17, 'Mobile number', submission.farmerDetails.mobileNumber ?? ''),
    generateRow(18, 'Email', submission.farmerDetails.emailAddress),
    generateRow(89,
      'Customer Marketing Indicator: So that we can continue to improve our services and schemes, we may wish to contact you in the future.',
      + ' Please indicate if you are happy for us, or a third party working for us, to contact you',
      submission.consentOptional ? 'Yes' : 'No'),
    generateRow(368, 'Date ready for QC or decision', todayStr),
    generateRow(369, 'Eligibility Reference No.', submission.confirmationId),
    generateRow(94, 'Current location of file', 'NA Automated'),
    generateRow(92, 'RAG rating', 'Green'),
    generateRow(93, 'RAG date reviewed ', todayStr),
    generateRow(54, 'Electronic OA received date ', todayStr),
    generateRow(519, 'Date and Time of OA Receipt', submission.dateTimeToday),
    generateRow(370, 'Status', 'Pending RPA review'),
    generateRow(85, 'Full Application Submission Date', '30/01/2026'),
    generateRow(375, 'OA percent', desirabilityScore ? String(desirabilityScore.desirability.overallRating.score) : ''),
    generateRow(365, 'OA score', desirabilityScore ? desirabilityScore.desirability.overallRating.band : ''),
    ...addAgentDetails(submission.agentsDetails)
  ]
}

function getSpreadsheetDetails(submission, desirabilityScore) {
  console.log('GET SPREADSHEET DETAILS')
  const today = new Date()
  const todayStr = today.toLocaleDateString('en-GB')
  const subScheme = 'FTF-AHW-Adult-Cattle-Housing'

  const DD = String(today.getDate()).padStart(2, '0')
  const MM = String(today.getMonth() + 1).padStart(2, '0')
  const YYYY = today.getFullYear()
  const hh = String(today.getHours()).padStart(2, '0')
  const mm = String(today.getMinutes()).padStart(2, '0')

  submission.dateTimeToday = `${DD}/${MM}/${YYYY} ${hh}:${mm}`

  let projectDescriptionString = ''
  projectDescriptionString = submission.projectType + ' Adult Cattle Housing'

  return {
    filename: generateExcelFilename(
      subScheme.trim(),
      submission.businessDetails.projectName.trim(),
      submission.businessDetails.businessName.trim(),
      submission.confirmationId.trim(),
      today
    ),
    uploadLocation: `Farming Investment Fund/Farming Transformation Fund/${spreadsheetConfig.uploadEnvironment}/Adult Cattle Housing/`,
    worksheets: [
      {
        title: 'DORA DATA',
        ...(spreadsheetConfig.protectEnabled ? { protectPassword: spreadsheetConfig.protectPassword } : {}),
        hideEmptyRows: spreadsheetConfig.hideEmptyRows,
        defaultColumnWidth: 30,
        rows: generateDoraRows(submission, subScheme, [], projectDescriptionString, todayStr, desirabilityScore)
      }
    ]
  }
}

function getCurrencyFormat(amount) {
  return Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, style: 'currency', currency: 'GBP' })
}

function getScoreChance(rating) {
  switch (rating.toLowerCase()) {
    case 'strong':
      return 'seems likely to'
    case 'average':
      return 'might'
    default:
      return 'seems unlikely to'
  }
}

const scoringQuestions = (submission, desirabilityScore) => {
    return {
      // Scoring Questions
      impact: submission.impact,
      impactScore: getQuestionScoreBand(desirabilityScore.desirability.questions, 'impact'),
      scoreChance: getScoreChance(desirabilityScore.desirability.overallRating.band),
      overallRating: desirabilityScore.desirability.overallRating.band,
    }
}

const commonQuestionsForAdultCattleHousing = (submission) => {
  return {
    ...commonQuestionsForAllJourney(submission),
    itemsNeeded: submission.itemsNeeded,
  }
}

const commonQuestionsForAllJourney = (submission) => {
  return {
    legalStatus: submission.legalStatus,
    projectCost: getCurrencyFormat(submission.projectCost),
    potentialFunding: getCurrencyFormat(submission.calculatedGrant),
    remainingCost: submission.remainingCosts,
    grantRate: `Up to ${GRANT_PERCENTAGE}%`,
  }
}

const commonBusinessQuestions = (submission, isAgentEmail) => { 
  return {
    firstName: isAgentEmail ? submission.agentsDetails.firstName : submission.farmerDetails.firstName,
    lastName: isAgentEmail ? submission.agentsDetails.lastName : submission.farmerDetails.lastName,
    referenceNumber: submission.confirmationId,
    projectName: submission.businessDetails.projectName,
    businessName: submission.businessDetails.businessName,
    cphNumber: submission.businessDetails.cph,
    projectPostcode: submission.farmerDetails.projectPostcode,
    farmerName: submission.farmerDetails.firstName,
    farmerSurname: submission.farmerDetails.lastName,
    farmerEmail: submission.farmerDetails.emailAddress,
    agentName: submission.agentsDetails?.firstName ?? 'N/A',
    agentSurname: submission.agentsDetails?.lastName ?? ' ',
    agentBusinessName: submission.agentsDetails?.businessName ?? 'N/A',
    agentEmail: submission.agentsDetails?.emailAddress ?? 'N/A',
    contactConsent: submission.consentOptional ? 'Yes' : 'No',
    scoreDate: new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
  }
}

const commonEligibilityQuestions = (submission) => {
  return {
    projectType: submission.projectType,
    legalStatus: submission.legalStatus,
  }
}


function getEmailDetails(submission, desirabilityScore, rpaEmail, isAgentEmail = false) {
  const email = isAgentEmail ? submission.agentsDetails.emailAddress : submission.farmerDetails.emailAddress

  return {
    notifyTemplate: emailConfig.notifyTemplate,
    emailAddress: rpaEmail || email,
    details: {
      // Common Eligibility Questions
      ...commonEligibilityQuestions(submission),
      // Scoring Questions
      ...scoringQuestions(submission, desirabilityScore),

      // Adult Cattle Housing questions email variable
      ...commonQuestionsForAdultCattleHousing(submission),

      // Farmer and Agent details
      ...commonBusinessQuestions(submission, isAgentEmail)
    }
  }
}

function spreadsheet(submission, desirabilityScore) {
  return getSpreadsheetDetails(submission, desirabilityScore)
}

module.exports = function (submission, desirabilityScore, rating = '') {
  return {
    applicantEmail: getEmailDetails(submission, desirabilityScore, false),
    agentEmail: submission.applying === 'Agent' ? getEmailDetails(submission, desirabilityScore, false, true) : null,
    rpaEmail: spreadsheetConfig.sendEmailToRpa ? getEmailDetails(submission, desirabilityScore, spreadsheetConfig.rpaEmail) : null,
    spreadsheet: spreadsheet(submission, desirabilityScore),
    getScoreChance: getScoreChance(rating)
  }
}
