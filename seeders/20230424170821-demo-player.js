'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('player_categories', [
    {
      player_id: 1,
      type: 'bowler'
    },{
      player_id: 2,
      type: 'wicket_keeper'
    },{
      player_id: 3,
      type: 'batsman'
    },{
      player_id: 4,
      type: 'all_rounder'
    },{
      player_id: 5,
      type: 'wicket_keeper'
    },{
      player_id: 6,
      type: 'all_rounder'
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('players', null, {});
  }
};
