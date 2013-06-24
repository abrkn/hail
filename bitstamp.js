var debug = require('debug')('hail:bitstamp')
, request = require('request')
, _ = require('lodash')
, Bitstamp = module.exports = function(options) {
    this.options = _.defaults(options || {}, {
        url: 'https://www.bitstamp.net/api/'
    })
}

Bitstamp.prototype.markets = function(cb) {
    this.market('BTCUSD', function(err, market) {
        if (err) return cb(err)
        if (body.error) return cb(new Error(JSON.stringify(body.error)))
        cb(null)
    })
}

Bitstamp.prototype.market = function(market, cb) {
    request(this.options.url + 'ticker/', {
        json: true
    }, function(err, res, body) {
        if (err) return cb(err)
        if (res.statusCode != 200) return cb(new Error(res.statusCode + ' ' + body))
        if (body.error) return cb(new Error(JSON.stringify(body.error)))
        cb(null, body)
    })
}

Bitstamp.prototype.depth = function(market, cb) {
    request(this.options.url + 'order_book/?group=1', {
        json: true
    }, function(err, res, body) {
        if (err) return cb(err)
        if (res.statusCode != 200) return cb(new Error(res.statusCode + ' ' + body))
        if (body.error) return cb(new Error(JSON.stringify(body.error)))
        cb(null, {
            bids: body.bids.map(function(bid) {
                return {
                    price: bid[0].toString(),
                    volume: bid[1].toString()
                }
            }),
            asks: body.asks.map(function(ask) {
                return {
                    price: ask[0].toString(),
                    volume: ask[1].toString()
                }
            })
        })
    })
}

Bitstamp.prototype.order = function(order, cb) {
    var f = {
            user: this.options.customer_id,
            password: this.options.password,
            amount: order.volume,
            price: order.price
        }
    console.log(f)
    request(this.options.url + (order.side == 'bid' ? 'buy' : 'sell') + '/', {
        method: 'POST',
        json: true,
        form: f
    }, function(err, res, body) {
        if (err) return cb(err)
        if (res.statusCode != 200) return cb(new Error(res.statusCode + ' ' + body))
        if (body.error) return cb(new Error(JSON.stringify(body.error)))
        console.log(body)
        cb(null, body.id)
    })
}

Bitstamp.prototype.orders = function(cb) {
    request(this.options.url + 'open_orders/', {
        json: true,
        form: {
            user: this.options.customer_id,
            password: this.options.password
        }
    }, function(err, res, body) {
        if (err) return cb(err)
        if (res.statusCode != 200) return cb(new Error(res.statusCode + ' ' + body))
        if (body.error) return cb(new Error(JSON.stringify(body.error)))
        cb(null, body.map(function(order) {
            return {
                id: order.id,
                timestamp: body.datetime,
                side: body.type ? 'ask' : 'bid',
                price: body.price,
                volume: body.amoufnt
            }
        }))
    })
}

Bitstamp.prototype.cancel = function(id, cb) {
    request(this.options.url + 'cancel_order/', {
        json: true,
        form: {
            user: this.options.customer_id,
            password: this.options.password,
            id: id
        }
    }, function(err, res, body) {
        if (err) return cb(err)
        if (res.statusCode != 200) return cb(new Error(res.statusCode + ' ' + body))
        if (body.error) return cb(new Error(JSON.stringify(body.error)))
        if (body !== true) return cb(new Error('failed to cancel'))
        cb()
    })
}
