'use strict'

const { sequelize, User } = require('../models/index.js')
const News = require('../utils/newsClass.js')
const bcrypt = require('bcrypt');
const { ValidationError, instantiateValidationError,
    ErrorOrigin } = require('../utils/errorClass.js')

module.exports = class AuthenController {

    static async renderLandingPage(req, res, next) {
        try {
            res.render("./auth/LandingPage")

        } catch (error) {
            next(error)
        }
    }

    static async renderLogin(req, res, next) {
        try {
            const encodedError = req.query.error
            const errors = encodedError ? JSON.parse(decodeURIComponent(encodedError)) : {}

            res.render("./auth/LogIn", { errors })

        } catch (error) {
            next(error)
        }
    }

    static async handleLogin(req, res, next) {
        try {
            const { username, password } = req.body
            const user = await User.findOne({ where: { username } })

            if (!user) {
                const error = new ValidationError(ErrorOrigin.login)
                error.errors.username = 'Account not found.'
                throw error
            }

            const isValid = await bcrypt.compare(password, user.password)
            if (!isValid) {
                const error = new ValidationError(ErrorOrigin.login)
                error.errors.password = 'Invalid password.'
                throw error
            }

            delete user.password
            req.session.user = user
            res.redirect('/home')

        } catch (error) {
            next(instantiateValidationError(error, ErrorOrigin.login))
        }
    }

    static async renderSignup(req, res, next) {
        try {
            const encodedError = req.query.error
            const errors = encodedError ? JSON.parse(decodeURIComponent(encodedError)) : {}
            res.render("./auth/SignUp", { errors })

        } catch (error) {
            next(error)
        }
    }

    static async handleSignup(req, res, next) {
        try {
            const { username, password, rePassword, email } = req.body
            if (password !== rePassword) {
                const error = new ValidationError(ErrorOrigin.signup)
                error.errors.password = 'Retyped password is incorrect.'
                throw error
            }

            await User.create({ username, password, email })
            res.redirect('/login')

        } catch (error) {
            next(instantiateValidationError(error, ErrorOrigin.signup))
        }
    }

    static async renderHome(req, res) {
        try {
            const userId = req.session.user.id
            const user = await User.findOne({
                where: {
                    id: userId
                }
            })
            const newsData = await News.getNews()
            res.render("./pages/Home", { newsData, user })

        } catch (error) {
            next(error)
        }
    }

    static async handleLogout(req, res, next) {
        try {
            req.session.destroy()
            res.redirect('/')

        } catch (error) {
            next(error)
        }
    }
}
