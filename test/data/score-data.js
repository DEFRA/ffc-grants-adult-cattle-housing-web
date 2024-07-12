
const msgData = {
  "grantScheme": { 
    "key": "ADULTCATTLEHOUSING01",
    "name": "Adult Cattle Housing"
  }, 
  "desirability": { 
    "questions": [
      { 
        "key": "current-system", 
        "answers": [
          { 
            "key": "current-system", 
            "title": "What type of hen housing system do you currently use in the building?", 
            "input": [
              { 
                "key": "current-system-A3", 
                "value": "Barn" 
              }
            ] 
          }
          ], 
          "rating": { 
            "score": 7, 
            "band": "WEAK", 
            "importance": null 
          } 
        }
    ], 
    "overallRating": { 
      "score": 7, 
      "band": "Weak" 
    } 
  }
}
module.exports = msgData
