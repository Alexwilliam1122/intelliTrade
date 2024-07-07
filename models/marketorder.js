'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MarketOrder extends Model {

    static associate(models) {
      this.belongsTo(models.User)
      this.belongsTo(models.Stock)
    }

    static async readOrders(filterQuery) {
      try {
        const orders = await MarketOrder.findAll({
          where: filterQuery,
          attributes: [
            'id',
            'quantity',
            'price',
            'expiration',
            'orderType',
            'StockId',
            'orderStatus'
          ],
          include: [
            {
              model: sequelize.models.Stock,
              attributes: ['stockCode']
            },
            {
              model: sequelize.models.User,
              attributes: ['id', 'username']
            }
          ],
          raw: true
        });
        return orders;

      } catch (error) {
        throw error;
      }
    }

    static async createOrder(UserId, StockId, quantity, price, expiration, orderType) {
      try {
        const usrId = Number(UserId)
        const stckId = Number(StockId)
        const expDate = new Date(expiration)
        await this.create({
          UserId: usrId,
          StockId: stckId,
          quantity,
          price,
          expiration: expDate,
          orderType,
        })
        return

      } catch (error) {
        throw error
      }
    }

    static async updateOrder(docId) {
      try {

        const order = await this.findOne({ //BUG: fingByPk returns null
          where: {
            id: docId
          }
        });

        if (!order) {
          throw new Error('Order not found');
        }

        let newStatus = '';
        switch (order.orderStatus) {
          case 'Open':
            newStatus = 'Processed';
            break;
          case 'Processed':
            newStatus = 'Completed';
            break;
          default:
            throw new Error('Invalid order status');
        }

        await order.update({ orderStatus: newStatus });
        return order.orderStatus;

      } catch (error) {
        throw error;
      }
    }

    static async deleteOrder(id) {
      try {
        const deletedOrder = await this.findOne({ where: { id: id } })
        await this.destroy({
          where: {
            id: id
          }
        })
        return deletedOrder.orderStatus

      } catch (error) {
        throw error
      }
    }
  }

  MarketOrder.init({
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Error processing order. Please contact administrator.'
        },
        notEmpty: {
          msg: 'Error processing order. Please contact administrator.'
        }
      }
    },
    StockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please choose a stock to buy.'
        },
        notEmpty: {
          msg: 'Please choose a stock to buy.'
        }
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Quantity is required.'
        },
        notEmpty: {
          msg: 'Quantity is required.'
        },
        isInt: {
          msg: 'Invalid quantity'
        },
        isValid(qty) {
          if (qty < 1) throw new Error('Invalid quantity.')
        }
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Price is required.'
        },
        notEmpty: {
          msg: 'Price is required.'
        },
        isValid(price) {
          if (price < 1) throw new Error('Invalid price.')
        }
      }
    },
    expiration: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Expiration date is required.'
        },
        notEmpty: {
          msg: 'Expiration date is required.'
        },
        isValid(date) {
          let today = new Date()
          let yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          if (date <= yesterday) throw new Error(`Earliest expiration is today`)
        }
      }
    },
    orderType: {
      type: DataTypes.ENUM('Buy_Order', 'Sell_Order'),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please elect order type.'
        },
        notEmpty: {
          msg: 'Please elect order type.'
        }
      }
    },
    orderStatus: {
      type: DataTypes.ENUM('Open', 'Processed', 'Completed'),
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'MarketOrder',
  });

  MarketOrder.beforeUpdate((marketOrder) => {
    const now = new Date()
    marketOrder.updatedAt = now
  })

  MarketOrder.beforeCreate((marketOrder) => {
    const now = new Date()
    marketOrder.createdAt = now
    marketOrder.updatedAt = now
    marketOrder.quantity *= 100
    marketOrder.orderStatus = 'Open'
  })

  return MarketOrder;
};