'use strict'
// const { DataTypes } = require("sequelize")
// const { sequelize } = require(".")
// const { toDefaultValue } = require("sequelize/lib/utils")


module.exports = (sequelize, DataTypes) => {
    var Lead = sequelize.define('Lead', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,

            // autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    return Lead;
}