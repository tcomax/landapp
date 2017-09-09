const databaseName = 'baale';

module.exports = {
  development: {
    client: 'postgresql',
    connection: `postgres://developer@localhost:5432/${databaseName}`
  },
  test: {
    client: 'postgresql',
    connection: `postgres://developer@localhost:5432/${databaseName}_test`,
    migrations: {
      directory: __dirname + '/src/server/db/migrations'
    },
    seeds: {
      directory: __dirname + '/src/server/db/seeds'
    }
  }
};
