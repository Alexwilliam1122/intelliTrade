'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Stock extends Model {

    static associate(models) {
      this.belongsToMany(models.User, { through: models.Portfolio })
      this.belongsToMany(models.User, { through: models.MarketOrder })
      this.hasOne(models.CompanyProfile)
      this.hasMany(models.StockHistory)
    }

    get dividendPercentage() { //redundancy due to requirement instance method/getter
      const dividend = this.getDataValue('dividend')
      return `${dividend} %`
    }

    static async readStockDetails(filterQuery) {
      try {
        if (!filterQuery) filterQuery = {}
        const stocks = await Stock.findAll({
          attributes: [
            'id',
            'stockName',
            'stockCode',
            'dividend',
            'createdAt',
            [sequelize.literal('(SELECT "volume" FROM "StockHistories" WHERE "StockHistories"."StockId" = "Stock"."id" ORDER BY "date" DESC LIMIT 1)'), 'volume'],
            [sequelize.literal('"CompanyProfile"."about"'), 'about'],
            [sequelize.literal('"CompanyProfile"."logo"'), 'logo'],
            [sequelize.literal('"CompanyProfile"."npwp"'), 'npwp'],
            [sequelize.literal('"CompanyProfile"."address"'), 'address'],
            [sequelize.literal('"CompanyProfile"."ipoFundRaised"'), 'ipoFundRaised'],
            [sequelize.literal('"CompanyProfile"."ipoListingDate"'), 'ipoListingDate'],
            [sequelize.literal('"CompanyProfile"."ipoOfferingShares"'), 'ipoOfferingShares'],
            [sequelize.literal('"CompanyProfile"."ipoPercentage"'), 'ipoPercentage'],
            [sequelize.literal('"CompanyProfile"."securitiesBureau"'), 'securitiesBureau']
          ],
          include: [
            {
              model: sequelize.models.CompanyProfile,
              attributes: []
            }
          ],
          where: filterQuery,
          raw: true
        });
        return stocks;

      } catch (error) {
        throw error
      }
    }

    static async findStock(id) {
      try {
        const stockFound = await this.findOne({
          where: {
            id: id
          },
          include: [
            {
              model: sequelize.models.CompanyProfile,
            }
          ],
          raw: true
        });
        return stockFound

      } catch (error) {
        throw error;
      }
    }

    static async updateStock(id, dividend) {
      try {
        await this.update({
          dividend: dividend
        }, {
          where: {
            id: id
          }
        })

      } catch (error) {
        throw error
      }
    }
  }

  Stock.init({
    stockName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Company name already exists'
      },
      validate: {
        notNull: {
          msg: 'Invalid company name.'
        },
        notEmpty: {
          msg: 'Invalid company name.'
        }
      }
    },
    stockCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Company with this ticker already exists.'
      },
      validate: {
        notNull: {
          msg: 'Invalid ticker'
        },
        notEmpty: {
          msg: 'Invalid ticker'
        },
        len: {
          args: [4],
          msg: 'Ticker max length is 4'
        }
      }
    },
    dividend: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Invalid dividend yield.'
        },
        notEmpty: {
          msg: 'Invalid dividend yield.'
        },
        isValid(value) {
          if (value > 100) throw new Error('Invalid dividend yield.')
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Stock',
  });

  Stock.beforeUpdate((stock) => {
    const today = new Date()
    stock.updatedAt = today
  })

  return Stock;
};