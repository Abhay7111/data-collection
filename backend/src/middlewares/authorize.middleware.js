const authorizedRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                message: "Access denied: You can't use this route"
            })
        }
        next()
    }
}

module.exports = { authorizedRoles }