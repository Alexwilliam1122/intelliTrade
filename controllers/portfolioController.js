'use strict'

const { Portfolio } = require('../models/index.js')
const { dateFormatter } = require('../helpers/dateFormat.js')
const { currencyFormatter, amountFormatter } = require('../helpers/numberFormat.js')
const { estimateDividend, estimateValue } = require('../helpers/valueCalculators.js')

module.exports = class PortfolioController {

    static async renderPortfolio (req, res, next) {
        try {
            const user = req.session.user

            const portfolios = await Portfolio.readPortfolio({ UserId: user.id })
            res.render("./pages/Portfolio", {
                portfolios, amountFormatter,
                user, dateFormatter, currencyFormatter,
                estimateDividend, estimateValue,
            })

        } catch (error) {
            next(error)
        }
    }
}