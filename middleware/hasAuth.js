
let createError = require('http-errors');

exports.isLoggedIn = (req, res, next) => {
    if(req.user){
        next();
    }
    else{
        next(createError(404, "Page does not exist."));
    }
}

exports.hasAuth = (req, res, next) => {
    if(req.user && req.user.is_admin == true){
        next();
    }
    else{
        next(createError(404, "Page does not exist."));
    }
}