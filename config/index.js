const config = {
  db: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root123',
    database: 'sghen_db',
    connectionLimit: 10,
    timezone: 'Asia%2FShanghai',
    dateStrings: true
  },
  server: {
    port: 8087
  }
}

module.exports = config
