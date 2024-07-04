const createMessage = (body, type, options) => {
  return {
    body,
    type,
    source: 'ffc-grants-adult-cattle-housing-web',
    ...options
  }
}

module.exports = createMessage
