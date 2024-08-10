class scoreAnswer {
    constructor(section, answers, score, fundingPriorities) {
        this.section = section;
        this.answers = answers;
        this.score = score;
        this.fundingPriorities = fundingPriorities;
    }
}

module.exports = { scoreAnswer }