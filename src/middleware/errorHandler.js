const errorHandler = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Invalid token" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  if(err.name === "NotFoundError"){
    return res.status(404).json({ message: "Not found" });
  }
  if (err) {
    console.log(err);
    
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = errorHandler;