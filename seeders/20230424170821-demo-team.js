'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('teams', [{
      full_name: 'Chennai Super Kings',
      short_name: 'CSK'
    },
    {
      full_name: 'Delhi Capitals',
      short_name: 'DC'
    },{
      full_name: 'Gujarat Titans',
      short_name: 'GT'
    },{
      full_name: 'Kolkata Knight Riders',
      short_name: 'KKR'
    },{
      full_name: 'Mumbai Indians',
      short_name: 'MI'
    },{
      full_name: 'Lucknow Super Giants',
      short_name: 'LSG'
    },{
      full_name: 'Royal Challengers Bangalore',
      short_name: 'RCB'
    },{
      full_name: 'Sunrisers Hyderabad',
      short_name: 'SRS'
    },{
      full_name: 'Rajasthan Royals',
      short_name: 'RR'
    },{
      full_name: 'Punjab Kings',
      short_name: 'PBKS'
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('teams', null, {});
  }
};
