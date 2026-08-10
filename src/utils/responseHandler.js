const sendSuccess = (res, data, message, statusCode) => {
   return res.status(statusCode).json({
       success: true,
       message,
       data
   });
};

const sendError = (res, message, statusCode) => {
   return res.status(statusCode).json({
       success: false,
       message
   });
}

module.exports = {
   sendSuccess,
   sendError
}