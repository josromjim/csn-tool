

module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('birdlife', 'coordinates_compressed', {
    type: Sequelize.DataTypes.GEOMETRY
  }),

  down: async (queryInterface) => queryInterface.removeColumn('birdlife', 'coordinates_compressed')
};
