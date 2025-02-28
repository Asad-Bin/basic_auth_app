'use restrict';

// const { QueryInterface } = require("sequelize");
// const { Sequelize } = require("../models");
// const { toDefaultValue } = require("sequelize/lib/utils");
// const { all } = require("../routes");

module.exports = {
    up: (QueryInterface, Sequelize) => {
        return QueryInterface.createTable('Leads', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                toDefaultValue: Sequelize.UUIDV4
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            email: {
                allowNull: false,
                type: Sequelize.STRING
            },
        });
    },
    down: (QueryInterface, Sequelize) => {
        return QueryInterface.dropTable('Leads');
    }
}