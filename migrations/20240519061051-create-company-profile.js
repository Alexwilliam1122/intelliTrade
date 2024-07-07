'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CompanyProfiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      StockId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Stocks',
          key: 'id'
        }
      },
      about: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      logo: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      npwp: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ipoFundRaised: {
        type: Sequelize.NUMERIC,
        allowNull: false
      },
      ipoListingDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      ipoOfferingShares: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ipoPercentage: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      securitiesBureau: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CompanyProfiles');
  }
};