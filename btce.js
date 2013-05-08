var request = require('request')
, util = require('util')
, qs = require('querystring')
, crypto = require('crypto')
, Btce = module.exports = function(options) {
    this.options = options || {}
    this.options.url || (this.options.url = 'https://btc-e.com/')
    this.nonce = require('nonce')(9)
}

Btce.prototype.markets = function(cb) {
    var pairs = [
        'BTCUSD',
        'BTCRUR',
        'BTCEUR',
        'LTCBTC',
        'LTCUSD',
        'LTCRUR',
        'NMCBTC',
        'USDRUR',
        'EURUSD',
        'NVCBTC',
        'TRCBTC',
        'PPCBTC'
    ]

    cb(null, pairs.map(function(id) {
        return { id: id }
    }))
}

// BTCUSD -> btc_usd
var formatPair = Btce.prototype.formatPair = function(pair) {
    return pair.substr(0, 3).toLowerCase() + '_' + pair.substr(3).toLowerCase()
}

// btc_usd <- BTCUSD
var parsePair = Btce.prototype.parsePair = function(pair) {
    return pair.substr(0, 3).toUpperCase() + pair.substr(4).toUpperCase()
}

Btce.prototype.privateRequest = function(path, payload) {
    payload.nonce = this.nonce()

    var post = qs.stringify(payload)

    var hmac = crypto.createHmac('sha512', new Buffer(this.options.secret))
    hmac.update(post)

    return {
        url: this.options.url + path,
        method: 'POST',
        json: true,
        form: payload,
        headers: {
            'Key': this.options.key,
            'Sign': hmac.digest('hex'),
            'User-Agent': 'Mozilla/4.0 (compatible; Btc-E node.js client)',
        }
    }
}

Btce.prototype.market = function(id, cb) {
    request({
        url: util.format('%sapi/2/%s/ticker', this.options.url, formatPair(id)),
        json: true
    }, function(err, res, body) {
        if (err) return cb(err)
        if (body.error) return cb(new Error(body.error))
        cb(null, {
            high: body.ticker.high.toString(),
            low: body.ticker.low.toString(),
            average: body.ticker.avg.toString(),
            volume: body.ticker.vol_cur.toString(),
            timestamp: body.ticker.server_time,
            bid: body.ticker.buy.toString(),
            ask: body.ticker.sell.toString(),
            last: body.ticker.last.toString()
        })
    })
}

Btce.prototype.depth = function(id, cb) {
    request({
        url: util.format('%sapi/2/%s/depth', this.options.url, formatPair(id)),
        json: true
    }, function(err, res, body) {
        if (err) return cb(err)
        if (body.error) return cb(new Error(body.error))
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

Btce.prototype.orders = function(cb) {
    request(this.privateRequest('tapi', {
        method: 'OrderList'
    }), function(err, res, body) {
        if (err) return cb(err)
        if (body.error) return cb(new Error(body.error))
        var hash = body['return']
        cb(null, Object.keys(hash).map(function(id) {
            var order = hash[id]
            return {
                id: id,
                market: parsePair(order.pair),
                type: parseType(order.type),
                amount: order.amount.toString(),
                price: order.rate.toString(),
                created: order.timestamp_created,
                status: order.status
            }
        }))
    })
}

var formatType = function(x) {
    return {
        bid: 'buy',
        ask: 'sell'
    }[x]
}

var parseType = function(x) {
    return {
        buy: 'bid',
        sell: 'ask'
    }[x]
}

Btce.prototype.order = function(order, cb) {
    request(this.privateRequest('tapi', {
        method: 'Trade',
        pair: this.formatPair(order.market),
        type: formatType(order.type),
        rate: order.price,
        amount: order.amount
    }), function(err, res, body) {
        if (body.error) return cb(new Error(body.error))
        if (err) return cb(err)
        cb(null, body['return'].order_id.toString())
    })
}

Btce.prototype.cancel = function(id, cb) {
    request(this.privateRequest('tapi', {
        method: 'CancelOrder',
        order_id: +id,
    }), function(err, res, body) {
        if (body.error) return cb(new Error(body.error))
        if (err) return cb(err)
        cb()
    })
}
