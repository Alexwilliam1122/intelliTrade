'use strict'

const { sequelize, Stock, Portfolio, MarketOrder } = require('../models/index.js')
const { dateFormatter } = require('../helpers/dateFormat.js')
const { currencyFormatter, amountFormatter } = require('../helpers/numberFormat.js')
const { estimateDividend, estimateValue } = require('../helpers/valueCalculators.js')
const { instantiateValidationError,
    ErrorOrigin } = require('../utils/errorClass.js')

module.exports = class DashboardController {

    static async renderDashboard(req, res, next) {
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
                case ErrorOrigin.marketBuy: {
                    overlayType = 'buy'
                    break
                }

                case ErrorOrigin.marketSell: {
                    overlayType = 'sell'
                    break
                }
            }

            let status_filter = req.query.status
            if (!status_filter) {
                status_filter = 'Open'
            }

            let tabState = {
                open: '',
                processed: '',
                completed: ''
            }

            switch (status_filter) {
                case 'Open': {
                    tabState.open = 'Selected'
                    break;
                }

                case 'Processed': {
                    tabState.processed = 'Selected'
                    break;
                }

                case 'Completed': {
                    tabState.completed = 'Selected'
                    break;
                }
            }

            const user = req.session.user
            let filterQuery = { UserId: user.id }
            if (user.role === 'admin') filterQuery = {}
            if (user.role === 'broker') filterQuery = {}

            const { orderNumber } = req.query
            if (orderNumber) filterQuery.id = orderNumber

            const orders = await MarketOrder.readOrders(filterQuery)
            const stocks = await Stock.readStockDetails()
            const portfolios = await Portfolio.readPortfolio({ UserId: user.id })
            const transactionRoute = {
                buyPost: '/dashboard/buyorder',
                sellPost: '/dashboard/sellorder',
                reset: '/dashboard'
            }

            res.render("./pages/Dashboard", {
                orders, stocks, portfolios, status_filter,
                tabState, user, dateFormatter, currencyFormatter,
                estimateDividend, estimateValue, transactionRoute,
                amountFormatter, errors, overlayType
            })

        } catch (error) {
            next(error)
        }
    }

    static async updateOrder(req, res, next) {
        try {
            const { id } = req.params

            await sequelize.transaction(async (t) => {
                const tabState = await MarketOrder.updateOrder(Number(id), { transaction: t })
                const orderRecord = await MarketOrder.findOne({
                    where: {
                        id: id
                    },
                    raw: true
                }, { transaction: t })

                if (orderRecord.orderStatus !== 'Completed') return res.redirect(`/dashboard?status=${tabState}`)

                const portfolioRecord = await Portfolio.findOne({
                    where: {
                        StockId: orderRecord.StockId,
                        UserId: orderRecord.UserId
                    }
                }, { transaction: t })

                if (!portfolioRecord) {
                    const timeNow = new Date()
                    await Portfolio.create({
                        UserId: orderRecord.UserId,
                        StockId: orderRecord.StockId,
                        quantity: orderRecord.quantity,
                        createdAt: timeNow,
                        updatedAt: timeNow
                    }, { transaction: t })

                } else {
                    await Portfolio.update(
                        {
                            quantity: portfolioRecord.quantity + orderRecord.quantity
                        },
                        {
                            where: {
                                id: portfolioRecord.id
                            },
                            transaction: t
                        })
                }
                res.redirect(`/dashboard?status=${tabState}`)
            })

        } catch (error) {
            next(error)
        }
    }

    static async buyPost(req, res, next) {
        try {
            const { StockId, quantity, price, expiration } = req.body
            const user = req.session.user

            await MarketOrder.createOrder(user.id, StockId, quantity, price, expiration, 'Buy_Order')
            res.redirect(`/dashboard`)

        } catch (error) {
            next(instantiateValidationError(error, ErrorOrigin.marketBuy))
        }
    }

    static async sellPost(req, res, next) {
        try {
            const { StockId, quantity, price, expiration } = req.body
            const user = req.session.user

            await MarketOrder.createOrder(user.id, StockId, quantity, price, expiration, 'Sell_Order')
            res.redirect(`/dashboard`)

        } catch (error) {
            next(instantiateValidationError(error, ErrorOrigin.marketSell))
        }
    }

    static async cancelOrder(req, res, next) {
        try {
            const { id } = req.params
            const order = await MarketOrder.findOne({
                where: {
                    id: id
                }
            })

            if(order.orderStatus !== 'Open') {
                const err = new Error('Access Denied. You are unauthorized to perform that action.')
                err.status = 403
                throw err
            }

            const tabState = await MarketOrder.deleteOrder(id)
            res.redirect(`/dashboard?status=${tabState}`)

        } catch (error) {
            next(error)
        }
    }

    static async terminateOrder(req, res, next) {
        try {
            const { id } = req.params
            const tabState = await MarketOrder.deleteOrder(id)
            res.redirect(`/dashboard?status=${tabState}`)

        } catch (error) {
            next(error)
        }
    }
}
