module.exports = {
  "development": {
    "username": "postgres",
    "password": 'asad1205',
    "database": "express-mvp-db",
    "host": "127.0.0.1",
    "port": "5432",
    "dialect": "postgres",
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
