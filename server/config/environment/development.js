'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/nwm-dev'
  },
  sequelize: {
    uri: 'sqlite://',
    options: {
      logging: false,
      storage: 'dev.sqlite',
      define: {
        timestamps: false
      }
    }
  },

  seedDB: true,
  PARSE_APPID: "WEe1kGJydUpoiLzaWE0MAx4q2DAUXqDSZDOFqgHm",
  PARSE_JSKEY: "CkEhBsgLQdlWHMQBijVUcSYKqsNABCMuygTqP8vt"
};
