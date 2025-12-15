'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // First, update existing records with 'resolved' status to keep them
    await queryInterface.changeColumn('Queries', 'status', {
      type: Sequelize.ENUM('open', 'in-progress', 'resolved'),
      defaultValue: 'open'
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert back to original enum
    await queryInterface.changeColumn('Queries', 'status', {
      type: Sequelize.ENUM('open', 'resolved'),
      defaultValue: 'open'
    });
  }
};
