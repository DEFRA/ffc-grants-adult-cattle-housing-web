class guard {
    static isNotNull(value, errorMessage) {
        if (value === null) {
            throw new Error(errorMessage);
        } 
    }
}

module.exports = guard;
  