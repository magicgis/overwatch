var Sequelize = require('sequelize')
var sequelize = require('../db/database')

var Type = sequelize.define('type', {
    name: Sequelize.STRING,  
    key: Sequelize.STRING,
}, {
    freezeTableName: true,
})

module.exports = Type