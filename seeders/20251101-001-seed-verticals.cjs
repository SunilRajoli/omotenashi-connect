'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('verticals', [
      { name: '美容・サロン', createdAt: new Date(), updatedAt: new Date() },
      { name: 'レストラン', createdAt: new Date(), updatedAt: new Date() },
      { name: 'ホテル', createdAt: new Date(), updatedAt: new Date() },
      { name: '医療', createdAt: new Date(), updatedAt: new Date() },
      { name: '教育', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('verticals', null, {});
  },
};

