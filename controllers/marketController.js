'use strict'

const { sequelize, Stock, StockHistory, Portfolio, MarketOrder } = require('../models/index.js')
const { currencyFormatter, amountFormatter } = require('../helpers/numberFormat.js')
const { Op } = require('sequelize');
const { dateFormatter } = require('../helpers/dateFormat.js')
const { ValidationError, instantiateValidationError,
    ErrorOrigin } = require('../utils/errorClass.js')

module.exports = class MarketController {

    static async renderMarket(req, res, next) {
        try {
            const { search } = req.query
            const filterQuery = {}
            if (search) {
                filterQuery[Op.or] = [
                    { stockName: { [Op.iLike]: `%${search}%` } },
                    { stockCode: { [Op.iLike]: `%${search}%` } }
                ];
            }

            const stocks = await Stock.readStockDetails(filterQuery)
            res.render("./pages/Market", { stocks, amountFormatter })

        } catch (error) {
            next(error)
        }
    }

    static async stockDetails(req, res, next) {
        try {
            const encodedError = req.query.error
            const errorObj = encodedError ? JSON.parse(decodeURIComponent(encodedError)) : {}
            let errors = errorObj.errors

            if (!errors) {
                errors = {
                    StockId: '',
                    quantity: '',
                    price: '',
                    expiration: '',
                }
            }

            let overlayType = ''
            switch (errorObj.origin) {
                case ErrorOrigin.historicalBuy: {
                    overlayType = 'buy'
                    break
                }

                case ErrorOrigin.historicalSell: {
                    overlayType = 'sell'
                    break
                }
            }

            const { id } = req.params
            const historicalDatas = await StockHistory.readHistorical(id)
            const stockDetail = await Stock.findStock(id)
            const stocks = [stockDetail]
            const user = req.session.user
            const portfolios = await Portfolio.readPortfolio({
                UserId: user.id,
                StockId: id
            })
            const transactionRoute = {
                buyPost: `/market/${id}/buyorder`,
                sellPost: `/market/${id}/sellorder`,
                reset: `/market/${id}`
            }

            const stockEntity = await Stock.findByPk(id) //redundancy due to requirement instance method/getter

            res.render("./pages/Historicals", {
                historicalDatas: JSON.stringify(historicalDatas),
                stockDetail, portfolios, transactionRoute,
                stocks, currencyFormatter, amountFormatter,
                dateFormatter, stockEntity, overlayType, errors
            })

        } catch (error) {
            next(error)
        }
    }

    static async buyPost(req, res, next) {
        try {
            const { id } = req.params
            const { StockId, quantity, price, expiration } = req.body
            const user = req.session.user

            await MarketOrder.createOrder(user.id, StockId, quantity, price, expiration, 'Buy_Order')
            res.redirect(`/market/${id}`)

        } catch (error) {
            const { id } = req.params
            next(instantiateValidationError(error, ErrorOrigin.historicalBuy, {id}))
        }
    }

    static async sellPost(req, res, next) {
        try {
            const { id } = req.params
            const { StockId, quantity, price, expiration } = req.body
            const user = req.session.user

            await MarketOrder.createOrder(user.id, StockId, quantity, price, expiration, 'Sell_Order')
            res.redirect(`/market/${id}`)

        } catch (error) {
            const { id } = req.params
            next(instantiateValidationError(error, ErrorOrigin.historicalSell, {id}))
        }
    }
}