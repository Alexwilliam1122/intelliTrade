'use strict';

const { readFile } = require('fs').promises
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    const data = JSON.parse(await readFile('./data/stocks.json', 'utf-8')).map((el) => {
      delete el.id
      el.createdAt = el.updatedAt = new Date()
      return el
    })
    await queryInterface.bulkInsert('Stocks', data, {})
  },

  async down (queryInterface, Sequelize) {
    
    await queryInterface.bulkDelete('Stocks', null, {})
  }
};
