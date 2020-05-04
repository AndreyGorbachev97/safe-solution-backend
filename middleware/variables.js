module.exports = function(req, res, next) {
    //залогинен пользователь или нет
    res.locals.isAuth = req.session.isAuthenticated;
    
    
    next();
};