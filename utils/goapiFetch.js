'use strict'

const axios = require('axios')
const { ValidationError, ErrorOrigin } = require('./errorClass')
module.exports = {

    fetchLatestHistoricals: async (stockId, ticker, from, to) => {
        try {
            const reqUrl = `https://api.goapi.io/stock/idx/${ticker}/historical`;
            const resData = await axios.get(reqUrl, {
                headers: {
                    'accept': 'application/json',
                    'X-API-KEY': process.env.apiKey_historical2
                },
                params: {
                    from,
                    to,
                },
            });

            if (!resData.data.data.results) throw new Error('no data')
            const receivedData = resData.data.data.results
            const normalizedData = receivedData.map((el) => {
                return {
                    date: el.date,
                    high: el.high,
                    low: el.low,
                    open: el.open,
                    close: el.close,
                    volume: el.volume,
                    StockId: stockId
                }
            })
            return normalizedData

        } catch (error) {
            error.status = 400
            throw error
        }
    },

    fetchHistoricals: async (ticker, stockId) => {
        try {
            async function requestData(ticker, from, to) {
                const reqUrl = `https://api.goapi.io/stock/idx/${ticker}/historical`;
                const resData = await axios.get(reqUrl, {
                    headers: {
                        'accept': 'application/json',
                        'X-API-KEY': process.env.apiKey_historical1
                    },
                    params: {
                        from,
                        to,
                    },
                });
                return resData.data.data.results
            }
            const allDatas = []
            allDatas.push(await requestData(ticker, '2018-01-01', '2018-12-31'))
            allDatas.push(await requestData(ticker, '2019-01-01', '2019-12-31'))
            allDatas.push(await requestData(ticker, '2020-01-01', '2020-12-31'))
            allDatas.push(await requestData(ticker, '2021-01-01', '2021-12-31'))
            allDatas.push(await requestData(ticker, '2022-01-01', '2022-12-31'))
            allDatas.push(await requestData(ticker, '2023-01-01', '2023-12-31'))
            allDatas.push(await requestData(ticker, '2024-01-01', '2024-12-31'))
            const normalizedData = []
            allDatas.forEach(arr => {
                arr.forEach(data => {
                    normalizedData.push({
                        date: data.date,
                        high: data.high,
                        low: data.low,
                        open: data.open,
                        close: data.close,
                        volume: data.volume,
                        StockId: stockId
                    })
                });
            });
            return normalizedData

        } catch (error) {
            if (error.message === "invalid API key, please register for get your API key.") {
                throw new ValidationError(ErrorOrigin.companyCreate, { stockCode: 'API Request Error.' })
            } else if (error.message === "Something went wrong") {
                throw new ValidationError(ErrorOrigin.companyCreate, { stockCode: 'Rejected: Company Not Found.' })
            } else {
                const apiError = new Error(error.response.data.message)
                apiError.name = 'Request failed with status code 401'
                apiError.status = 401
                throw apiError
            }
        }
    },

    fetchCompanyProfiles: async (ticker) => {
        try {
            const reqUrl = `https://api.goapi.io/stock/idx/${ticker}/profile`;
            const resData = await axios.get(reqUrl, {
                headers: {
                    'accept': 'application/json',
                    'X-API-KEY': process.env.apiKey_companyProfile,
                },
                params: {},
            });
            const profile = resData.data.data

            return {
                stockName: profile.name,
                about: profile.about,
                logo: profile.logo,
                npwp: profile.npwp,
                address: profile.address,
                ipoFundRaised: profile.ipo_fund_raised,
                ipoListingDate: profile.ipo_listing_date,
                ipoOfferingShares: profile.ipo_offering_shares,
                ipoPercentage: profile.ipo_percentage,
                securitiesBureau: profile.ipo_securities_administration_bureau
            }

        } catch (error) {
            if (error.response.data.message === "invalid API key, please register for get your API key.") {
                throw new ValidationError(ErrorOrigin.companyCreate, { stockCode: 'API Request Error.' })
            } else if (error.response.data.message === "Something went wrong") {
                throw new ValidationError(ErrorOrigin.companyCreate, { stockCode: 'Rejected: Company Not Found.' })
            } else {
                const apiError = new Error(error.response.data.message)
                apiError.name = 'Request failed with status code 401'
                apiError.status = 401
                throw apiError
            }
        }
    }
}
