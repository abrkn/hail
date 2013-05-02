var Snow = module.exports = require('snow-client')

Snow.prototype.market = function(id, cb) {
    this.markets(function(err, markets) {
        if (err) return cb(err)
        var market = markets.filter(function(m) {
            return m.id == id
        })[0]

        if (!market) return cb(new Error('Market ' + id + ' not found'))

        cb(null, market)
    })
}
