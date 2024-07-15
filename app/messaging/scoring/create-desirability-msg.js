const grantSchemeConfig = require('./config/grant-scheme')
const { desirabilityInputQuestionMapping, desirabilityQuestions: questionContent } = require('./content-mapping')
const desirabilityQuestions = ['current-system']

function getUserAnswer (answers, userInput) {
  if (answers) {
    return [userInput].flat().map(answer =>
      ({ key: Object.keys(answers).find(key => answers[key] === answer), value: answer }))
  }

  return {}
}

function getDesirabilityDetails(questionKey, userInput) {
  const content = questionContent[questionKey]
  return {
    key: questionKey,
    answers: content.map(({ key, title, answers }) => ({
      key,
      title,
      input: getUserAnswer(answers, userInput[desirabilityInputQuestionMapping[key]])
    })),
    rating: {
      score: null,
      band: null,
      importance: null
    }
  }
}

function desirability (userInput) {
  return {
    grantScheme: {
      key: grantSchemeConfig.key,
      name: grantSchemeConfig.name
    },
    desirability: {
      questions: desirabilityQuestions.map(questionKey => getDesirabilityDetails(questionKey, userInput)),
      overallRating: {
        score: null,
        band: null
      }
    }
  }
}

// had to export getUSerAnswer in order to test the if(answer) function, given that answer always came from
//   hardcoded list at top of file.
// function not used anywhere else other than this file and test file
module.exports = { desirability, getUserAnswer }
