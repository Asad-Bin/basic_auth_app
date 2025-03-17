
// error handler middleware
const errorHandler = (err, erq, ers, next) => {
    // check if response headers have already sent to the client
    if(res.headerSent){
        return next(err);
    }

    // set the status code of the response
    const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

    res.status(statusCode);

    // log error stack trace to the console if not in production -->
    // for debugging 
    if(process.env.NODE_ENV !== "production"){
        console.log(err);
    }

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

export default errorHandler;