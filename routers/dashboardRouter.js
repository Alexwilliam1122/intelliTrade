'use strict'

const router = require('express').Router()
const DashboardController = require('../controllers/dashboardController')
const AuthenMiddleware = require('../middleware/authenMiddleware')

router.get('/', DashboardController.renderDashboard)
router.get('/updateOrder/:id', AuthenMiddleware.isAuthorized, DashboardController.updateOrder)
router.get('/cancel/:id', DashboardController.cancelOrder)
router.get('/terminate/:id', AuthenMiddleware.isAuthorized, DashboardController.terminateOrder)
router.post('/buyorder', DashboardController.buyPost)
router.post('/sellorder', DashboardController.sellPost)


module.exports = router