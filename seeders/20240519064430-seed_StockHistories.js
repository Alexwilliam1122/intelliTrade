'use strict';

const { readFile } = require('fs').promises
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    const data = JSON.parse(await readFile('./data/stockHistories.json', 'utf-8')).map((el) => {
      el.createdAt = el.updatedAt = new Date()
      return el
    })
    await queryInterface.bulkInsert('StockHistories', data, {})
  },

  async down (queryInterface, Sequelize) {
    
    await queryInterface.bulkDelete('StockHistories', null, {})
  }
};
