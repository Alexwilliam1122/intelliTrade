'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Portfolio extends Model {

    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'UserId'
      })
      this.belongsTo(models.Stock, {
        foreignKey: 'StockId'
      })
    }

    static async readPortfolio(filterQuery) {
      try {
        const portfolioList = await Portfolio.findAll({
          attributes: [
            'id',
            'quantity',
            'StockId',
            'UserId',
            [sequelize.literal(`(
            SELECT
              "close"
            FROM
              "StockHistories"
            JOIN
              "Portfolios"
            ON
              "StockHistories"."StockId" = "Portfolios"."StockId"
            WHERE
              "StockHistories"."StockId" = "Portfolios"."StockId"
            ORDER BY
              "date" DESC
            LIMIT
              1)`), 'currentPrice'],
          ],
          include: [
            {
              model: sequelize.models.Stock,
              attributes: [
                'stockCode',
                'stockName',
                'dividend'
              ],
              include: [
                {
                  model: sequelize.models.StockHistory,
                  attributes: ['close'],
                  order: [['date', 'DESC']],
                  limit: 1
                }
              ]
            }
          ],
          where: filterQuery,
          raw: true //BUG: StockId returned undefined if not using true
        });
        return portfolioList

      } catch (error) {
        throw error;
      }
    }

  }
  Portfolio.init({
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Error processing portfolio'
        },
        notEmpty: {
          msg: 'Error processing portfolio'
        }
      }
    },
    StockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Error processing portfolio. Please contact administrator.'
        },
        notEmpty: {
          msg: 'Error processing portfolio. Please contact administrator.'
        }
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Error processing portfolio. Please contact administrator.'
        },
        notEmpty: {
          msg: 'Error processing portfolio. Please contact administrator.'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Portfolio',
  });
  return Portfolio;
};