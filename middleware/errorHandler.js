'use strict'
const { ErrorOrigin } = require('../utils/errorClass')
const { readFile, writeFile } = require('fs').promises
module.exports = {
    ErrorHandler: async (err, req, res, next) => {
        const prevLog = JSON.parse(await readFile('./logs/errorLogs.json'))
        const newError = {
            time: new Date(),
            statusCode: err.statusCode,
            name: err.name,
            message: err.message,
            origin: err.path,
            stack: err.stack.split('\n')
        }
        prevLog.push(newError)
        const currentLog = JSON.stringify(prevLog, null, 2)
        await writeFile('./logs/errorLogs.json', currentLog)

        if (err.status === 404) {
            res.render('auth/ErrorPage', { err })

        } else if (err.status === 403) {
            res.render('auth/ErrorPage', { err })

        } else if (err.status === 400) {
            switch (err.origin) {
                case ErrorOrigin.signup: {
                    const encodedError = encodeURIComponent(JSON.stringify(err.errors))
                    return res.redirect(`/signup?error=${encodedError}`)
                }

                case ErrorOrigin.login: {
                    const encodedError = encodeURIComponent(JSON.stringify(err.errors))
                    return res.redirect(`/login?error=${encodedError}`)
                }

                case ErrorOrigin.companyUpdate: {
                    const encodedError = encodeURIComponent(JSON.stringify(err))
                    return res.redirect(`/admin/companyData?error=${encodedError}`)
                }

                case ErrorOrigin.companyDelete: {
                    const encodedError = encodeURIComponent(JSON.stringify(err))
                    return res.redirect(`/admin/companyData/?deleteId=${err.target.deleteId}&deleteName=${err.target.viewDelete}&error=${encodedError}`)
                }

                case ErrorOrigin.companyCreate: {
                    const encodedError = encodeURIComponent(JSON.stringify(err))
                    return res.redirect(`/admin/companyData?error=${encodedError}`)
                }

                case ErrorOrigin.userDelete: {
                    const encodedError = encodeURIComponent(JSON.stringify(err))
                    return res.redirect(`/admin/userManage/?deleteId=${err.target.deleteId}&deleteName=${err.target.viewDelete}&error=${encodedError}`)
                }

                case ErrorOrigin.userCreate: {
                    const encodedError = encodeURIComponent(JSON.stringify(err))
                    return res.redirect(`/admin/userManage?error=${encodedError}`)
                }

                case ErrorOrigin.historicalBuy: {
                    const encodedError = encodeURIComponent(JSON.stringify(err))
                    return res.redirect(`/market/${err.target.id}?error=${encodedError}`)
                }

                case ErrorOrigin.historicalSell: {
                    const encodedError = encodeURIComponent(JSON.stringify(err))
                    return res.redirect(`/market/${err.target.id}?error=${encodedError}`)
                }

                case ErrorOrigin.marketBuy: {
                    const encodedError = encodeURIComponent(JSON.stringify(err))
                    return res.redirect(`/dashboard?error=${encodedError}`)
                }

                case ErrorOrigin.marketSell: {
                    const encodedError = encodeURIComponent(JSON.stringify(err))
                    return res.redirect(`/dashboard?error=${encodedError}`)
                }
            }

        } else if (err.name === 'Request failed with status code 401') {
            return res.render('auth/ErrorPage', { err })

        } else {
            err.status = 500
            err.name = 'Internal Server Error'
            err.message = 'The server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later or contact the administrator for assistance.'
            return res.render('auth/ErrorPage', { err })
        }
    }
}