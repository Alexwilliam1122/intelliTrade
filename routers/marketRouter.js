'use strict'

const router = require('express').Router()
const MarketController = require('../controllers/marketController')

router.get('/', MarketController.renderMarket)
router.get('/:id', MarketController.stockDetails)
router.post('/:id/buyorder', MarketController.buyPost)
router.post('/:id/sellorder', MarketController.sellPost)

module.exports = router