const {verifyToken,sendError} = require('../utils/helper');

module.exports = function(req, res, next) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = verifyToken(token);
        req.userId = decoded.user.id;
        req.authType = decoded.user.acctType;
        console.log(req.authType)

        next();
    } catch (err) {
        sendError(res, 401, 'Invalid token');
    }
};
