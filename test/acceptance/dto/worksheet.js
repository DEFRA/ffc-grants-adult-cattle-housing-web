class worksheet {
    constructor(name, fields) {
        this.name = name;
        this.fields = fields;
    }
}

class worksheetField {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}

module.exports = { worksheet, worksheetField };