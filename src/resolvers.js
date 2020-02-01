const crawler = require('./crawler')
module.exports = {
  Query: {
    planos: () => crawler.find(),
    plano: (_, titulo) => crawler.search(titulo)
  }
}