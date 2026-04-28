export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    status: error.status || "error",
    message: error.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
  });
};

