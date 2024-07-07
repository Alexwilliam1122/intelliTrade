'use strict'

const ErrorValidation = require('./ErrorClass')
const Factory = require('./class')
const pool = require('../config/connection')
const bcryptjs = require('bcrypt')
const axios = require('axios')


class Model {

    //TRANSITIONED TO SEQUELIZE. CLEARED
    static async readStocks() {
        try {
            const sql = `
        SELECT 
            "Stocks"."id",
            "Stocks"."stockName",
            "Stocks"."stockCode",
            "Stocks"."dividend",
            "Stocks"."createdAt",
            "CompanyProfiles"."about",
            "CompanyProfiles"."logo",
            "CompanyProfiles"."npwp",
            "CompanyProfiles"."address",
            "CompanyProfiles"."ipoFundRaised",
            "CompanyProfiles"."ipoListingDate",
            "CompanyProfiles"."ipoOfferingShares",
            "CompanyProfiles"."ipoPercentage",
            "CompanyProfiles"."securitiesBureau",
            "recentVolume"."volume"
        FROM
            "Stocks"
        JOIN (
                SELECT 
                    "StockId",
                    "date",
                    "volume"
                FROM 
                    "StockHistories"
                WHERE 
                    "date" = (
                        SELECT 
                            MAX("StockHistories"."date")
                        FROM
                            "StockHistories"
                    )
                GROUP BY
                    "StockId",
                    "date",
                    "volume"
            ) AS "recentVolume"
            ON 
                "Stocks"."id" = "recentVolume"."StockId"
            JOIN
                "CompanyProfiles"
            ON
                "Stocks"."id" = "CompanyProfiles"."StockId"
            `

            const data = (await pool.query(sql)).rows
            const stocks = data.map((el) => {
                return Factory.createStocks(el.id, el.stockName, el.stockCode, el.dividend, el.volume, el.createdAt,
                    el.about, el.logo, el.npwp, el.address, el.ipoFundRaised, el.ipoListingDate, el.ipoOfferingShares,
                    el.ipoPercentage, el.securitiesBureau
                )
            })

            return stocks

        } catch (error) {
            console.log(error);
        }
    }

    //TRANSITIONED TO SEQUELIZE. CLEARED
    static async readHistorical(id) {
        try {
            const sql = `
            SELECT 
                *
            FROM 
                "StockHistories"
            WHERE 
                "StockId" = ${id}
            ORDER BY
                "date" ASC`

            const data = (await pool.query(sql)).rows
            const historicals = data.map((el) => {
                return Factory.createStockHistories(el.id, el.date, el.high, el.low, el.open,
                    el.close, el.volume, el.StockId)
            })
            return historicals

        } catch (error) {
            throw error
        }
    }

    static async findStock(id) {
        try {
            const stocks = await Model.readStocks()
            const stockFound = stocks.find((el) => {

                return el.id === Number(id)
            })

            return stockFound

        } catch (error) {
            console.log(error);
        }
    }

    //TRANSITIONED TO SEQUELIZE. CLEARED
    static async readOrders(UserId) {
        try {
            let sql = ''
            if (!UserId) {
                sql = `
                SELECT
                    "MarketOrders"."id",
                    "MarketOrders"."quantity",
                    "MarketOrders"."price",
                    "MarketOrders"."expiration",
                    "MarketOrders"."type",
                    "MarketOrders"."StockId",
                    "Stocks"."stockCode",
                    "Users"."id" AS "UserId",
                    "MarketOrders"."status"
                FROM
                    "MarketOrders"
                JOIN
                    "Stocks"
                ON
                    "Stocks"."id" = "MarketOrders"."StockId"
                JOIN
                    "Users"
                ON
                    "Users"."id" = "MarketOrders"."UserId"`
            } else {
                sql = `
                SELECT
                    "MarketOrders"."id",
                    "MarketOrders"."quantity",
                    "MarketOrders"."price",
                    "MarketOrders"."expiration",
                    "MarketOrders"."type",
                    "MarketOrders"."StockId",
                    "Stocks"."stockCode",
                    "Users"."id" AS "UserId",
                    "MarketOrders"."status"
                FROM
                    "MarketOrders"
                JOIN
                    "Stocks"
                ON
                    "Stocks"."id" = "MarketOrders"."StockId"
                JOIN
                    "Users"
                ON
                    "Users"."id" = "MarketOrders"."UserId"
                WHERE 
                    "MarketOrders"."UserId" = ${id}`
            }

            const orders = (await pool.query(sql)).rows.map((el) => {
                return Factory.createMarketOrders(el.id, el.type, el.quantity, el.price, el.expiration, el.StockId, el.stockCode, el.UserId, el.status)
            })

            return orders

        } catch (error) {
            console.log(error);
        }
    }

    //TRANSITIONED TO SEQUELIZE. CLEARED
    static async readPortfolio(UserId) {
        try {
            const sql = `
            SELECT
            "Portfolios"."id",
            "Portfolios"."quantity",
            "Portfolios"."StockId",
            "Stocks"."stockCode",
            "Stocks"."stockName",
            "Stocks"."dividend",
            (
                SELECT
                    "close"
                FROM
                    "StockHistories"
                WHERE
                    "StockHistories"."StockId" = "Portfolios"."StockId"
                ORDER BY
                    "date" DESC
                LIMIT
                    1
            ) AS "currentPrice"
            FROM
                "Portfolios"
            JOIN
                "Stocks"
            ON
                "Stocks"."id" = "Portfolios"."StockId"
            WHERE
                "Portfolios"."UserId" = ${UserId}
            `

            const portfolioList = (await pool.query(sql)).rows.map((el) => {
                return Factory.createPortfolios(el.id, el.quantity, el.StockId, el.stockCode,
                    el.stockName, el.dividend, el.currentPrice)
            })

            return portfolioList

        } catch (error) {
            throw error
        }
    }

    static async updateOrder(docId) {
        try {
            const checkStatus = `
            SELECT
                "MarketOrders"."status"
            FROM
                "MarketOrders"
            WHERE
                "MarketOrders"."id" = ${docId}
            `

            const orderStatus = (await pool.query(checkStatus)).rows[0].status
            let newStatus = ''

            switch (orderStatus) {
                case 'Open': {
                    newStatus = 'Processed';
                    break;
                }

                case 'Processed': {
                    newStatus = 'Completed';
                    break;
                }
            }

            const updateQuery = `
            UPDATE
                "MarketOrders"
            SET
                "status" = '${newStatus}'
            WHERE
                "id" = ${docId}
            `

            await pool.query(updateQuery)
            return orderStatus

        } catch (error) {
            throw error
        }
    }
}

module.exports = Model