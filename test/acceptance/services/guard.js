function isNotNull(value, errorMessage) {
    if (value === null) {
        throw new Error(errorMessage);
    } 
}
  
module.exports = { isNotNull }
  