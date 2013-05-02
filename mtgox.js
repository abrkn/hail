var MtGox = module.exports = require('mtgox')


MtGox.prototype.markets = function(cb) {
    cb(null, [
        {
            "id": "BTCUSD"
        }
    ])
}
