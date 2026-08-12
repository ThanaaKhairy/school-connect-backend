const errorHandler = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Invalid token" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  if(err.name === "NotFoundError"){
    return res.status(404).json({ message: err.message });
  }
  if (err) {
    console.log(err);
    
    return res.status(500).json({ message: "Internal server error" });
  }
};

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.name = "NotFoundError"
  error.statusCode = 404;
  next(error);
};

module.exports = {
  notFound,
  errorHandler
};