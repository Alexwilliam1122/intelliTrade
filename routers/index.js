'use strict'

const AuthenMiddleware = require('../middleware/authenMiddleware')
const router = require('express').Router()
const { ErrorHandler } = require('../middleware/errorHandler')

const adminRouter = require('./adminRouter')
const marketRouters = require('./marketRouter')
const dashboardRouters = require('./dashboardRouter')

const AuthenController = require('../controllers/authenController')
const PortfolioController = require('../controllers/portfolioController')

router.get('/', AuthenMiddleware.isLoggedOut, AuthenController.renderLandingPage)

router.get('/login', AuthenMiddleware.isLoggedOut, AuthenController.renderLogin)
router.post('/login', AuthenMiddleware.isLoggedOut, AuthenController.handleLogin)
router.get('/signup', AuthenMiddleware.isLoggedOut, AuthenController.renderSignup)
router.post('/signup', AuthenMiddleware.isLoggedOut, AuthenController.handleSignup)
router.get('/signout', AuthenMiddleware.isLoggedIn, AuthenController.handleLogout)
router.get('/home', AuthenMiddleware.isLoggedIn, AuthenController.renderHome)

router.get('/portfolio', AuthenMiddleware.isLoggedIn, PortfolioController.renderPortfolio)
router.use('/admin', AuthenMiddleware.isAdmin, adminRouter)
router.use('/market', AuthenMiddleware.isLoggedIn, marketRouters)
router.use('/dashboard', AuthenMiddleware.isLoggedIn, dashboardRouters)

router.use((req, res, next) => {
    const err = new Error(`Page Not Found. ( ${req.originalUrl} ). The requested URL was not found on this server. Please check the URL for errors and try again, or navigate back to a valid page.`);
    err.status = 404;
    err.name = 'Request Not Found'
    next(err);
});
router.use(ErrorHandler)

module.exports = router