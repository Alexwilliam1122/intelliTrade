'use strict'

module.exports = class AuthenMiddleware {

    static isLoggedIn(req, res, next) {
        if (!req.session.user) {
            return res.redirect('/')
        }
        next()
    }

    static isLoggedOut(req, res, next) {
        if (req.session.user) {
            return res.redirect('/home')
        }
        next()
    }

    static isAdmin(req, res, next) {
        if (!req.session.user) {
            return res.redirect('/')
        }
        if (req.session.user.role !== 'admin') {
            return res.redirect('/home')
        }
        next()
    }

    static isAuthorized(req, res, next) {
        if (!req.session.user) {
            return res.redirect('/')
        }
        if (req.session.user.role !== 'admin' && req.session.user.role !== 'broker') {
            return res.redirect('/dashboard')
        }
        next()
    }
}