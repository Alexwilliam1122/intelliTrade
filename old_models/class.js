'use strict'

class News {
    constructor(imageUrl, date, title, description, publisherLogo,
        publisherName, newsUrl) {
        this.imageUrl = imageUrl
        this.date = date
        this.title = title
        this.description = description
        this.publisherLogo = publisherLogo
        this.publisherName = publisherName
        this.newsUrl = newsUrl
    }
}

class MarketOrders {
    constructor(id, type, qty, price, expiration, StockId, stockCode, UserId, status) {
        this.orderNumber = id
        this.type = type
        this.qty = qty
        this.price = price
        this.expiration = expiration
        this.StockId = StockId
        this.stockCode = stockCode
        this.UserId = UserId
        this.status = status
    }

    get expirationDate() {
        const date = this.expiration
        const options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        }
        return date.toLocaleDateString('id', options)
    }
}

class Portfolio {
    constructor(id, quantity, StockId, stockCode, stockName, dividend, currentPrice) {
        this.id = id
        this.quantity = quantity
        this.StockId = StockId
        this.stockCode = stockCode
        this.stockName = stockName
        this.dividend = dividend
        this.currentPrice = currentPrice
    }

    get estimateDividend() {
        return this.quantity * this.dividend
    }

    get estimateValue() {
        return this.quantity * this.currentPrice
    }
}

class Stocks {
    #dividend
    #volume
    #createdAt
    #ipoListingDate
    #ipoPercentage
    #ipoFundRaised
    constructor(id, stockName, stockCode, dividend, volume, createdAt, about, logo, npwp,
        address, ipoFundRaised, ipoListingDate, ipoOfferingShares,
        ipoPercentage, securitiesBureau) {
        this.id = id
        this.stockName = stockName
        this.stockCode = stockCode
        this.#dividend = dividend
        this.#volume = volume
        this.#createdAt = createdAt
        this.about = about
        this.logo = logo
        this.npwp = npwp
        this.address = address
        this.#ipoFundRaised = ipoFundRaised
        this.#ipoListingDate = ipoListingDate
        this.ipoOfferingShares = ipoOfferingShares
        this.#ipoPercentage = ipoPercentage
        this.securitiesBureau = securitiesBureau
    }

    get dividend() {
        return `${this.#dividend}%`
    }

    get ipoPercentage() {
        return `${this.#ipoPercentage}%`
    }

    get volume() {
        const rawInt = this.#volume.toString();
        const parts = [];
        for (let i = rawInt.length - 1; i >= 0; i--) {
            parts.unshift(rawInt[i]);
            if ((rawInt.length - i) % 3 === 0 && i !== 0) {
                parts.unshift(',');
            }
        }
        return parts.join('');
    }

    get ipoFundRaised() {
        const rawInt = this.#ipoFundRaised.toString();
        const parts = [];
        for (let i = rawInt.length - 1; i >= 0; i--) {
            parts.unshift(rawInt[i]);
            if ((rawInt.length - i) % 3 === 0 && i !== 0) {
                parts.unshift(',');
            }
        }
        return "IDR   " + parts.join('');
    }

        get ipoFundRaised() {
        const rawInt = this.#ipoFundRaised.toString();
        const parts = [];
        for (let i = rawInt.length - 1; i >= 0; i--) {
            parts.unshift(rawInt[i]);
            if ((rawInt.length - i) % 3 === 0 && i !== 0) {
                parts.unshift(',');
            }
        }
        return "IDR   " + parts.join('');
    }

    get createdAt() {
        const date = this.#createdAt
        const options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        }
        return date.toLocaleDateString('id', options)
    }

    get ipoListingDate() {
        const date = this.#ipoListingDate
        const options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        }
        return date.toLocaleDateString('id', options)
    }
}

class StockHistories {
    constructor(id, date, high, low, open, close, volume, StockId) {
        this.id = id
        this.date = this.date(date)
        this.high = high
        this.low = low
        this.open = open
        this.close = close
        this.volume = volume
        this.StockId = StockId
    }

    date(date) {
        const dateFormat = date;
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        };

        const stringDate = dateFormat.toLocaleDateString('en-US', options).replace(/\//g, '-');
        const parts = stringDate.split('-');
        const formattedDate = parts[2] + '-' + parts[0] + '-' + parts[1];
        return formattedDate;
    }
}

class Factory {

    static createNews(imageUrl, date, title, description, publisherLogo,
        publisherName, newsUrl) {
        return new News(imageUrl, date, title, description, publisherLogo,
            publisherName, newsUrl)
    }

    static createStocks(id, stockName, stockCode, dividend, volume, createdAt, about, logo, npwp,
        address, ipoFundRaised, ipoListingDate, ipoOfferingShares,
        ipoPercentage, securitiesBureau) {
        return new Stocks(id, stockName, stockCode, dividend, volume, createdAt, about, logo, npwp,
            address, ipoFundRaised, ipoListingDate, ipoOfferingShares,
            ipoPercentage, securitiesBureau)
    }

    static createStockHistories(id, date, high, low, open, close, volume, StockId) {
        return new StockHistories(id, date, high, low, open, close, volume, StockId)
    }

    static createMarketOrders(id, type, qty, price, expiration, StockId, stockCode, UserId, status) {
        return new MarketOrders(id, type, qty, price, expiration, StockId, stockCode, UserId, status)
    }

    static createPortfolios(id, quantity, StockId, stockCode, stockName, dividend, currentPrice) {
        return new Portfolio(id, quantity, StockId, stockCode, stockName, dividend, currentPrice)
    }
}

module.exports = Factory