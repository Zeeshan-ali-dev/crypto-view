const formatResponse = (status = false, message = '', data = []) => {
    return {
        status,
        message,
        data
    }
}

module.exports = {formatResponse}