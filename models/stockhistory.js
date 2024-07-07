'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StockHistory extends Model {

    static associate(models) {
      this.belongsTo(models.Stock)
    }

    static async readHistorical(id) {
      try {
        const historicals = await this.findAll({
          where: {
            StockId: id
          },
          order: [['date', 'ASC']],
          raw: true
        });
        return historicals;

      } catch (error) {
        throw error;
      }
    }

    static async getVolumeGrowth() {
      try {
        const volumeArr = (await sequelize.query(`
          SELECT
            "latestDates".*
          FROM (
            SELECT
              *,
              ROW_NUMBER() OVER (PARTITION BY "StockId" ORDER BY date DESC) AS row_num
            FROM "StockHistories"
          ) AS "latestDates"
          WHERE
            "latestDates".row_num <= 2;`))[0]

        const stockVolumes = {}
        volumeArr.forEach(el => {
          const stockId = el.StockId;
          const date = el.date;
          const volume = el.volume;

          if (!stockVolumes[stockId]) {
            stockVolumes[stockId] = {
              dates: [],
              volumes: []
            };
          }

          stockVolumes[stockId].dates.push(date)
          stockVolumes[stockId].volumes.push(volume)
        });
        return stockVolumes

      } catch (error) {
        throw error;
      }
    }
  }

  StockHistory.init({
    StockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    high: DataTypes.INTEGER,
    low: DataTypes.INTEGER,
    open: DataTypes.INTEGER,
    close: DataTypes.INTEGER,
    volume: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'StockHistory',
  });

  StockHistory.beforeBulkCreate((stockHistory) => {
    const today = new Date()
    stockHistory.createdAt = today
    stockHistory.updatedAt = today
  })

  return StockHistory;
};