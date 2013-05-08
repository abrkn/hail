var RippleLib = require('ripple-lib')
, async = require('async')
, num = require('num')
, _ = require('lodash')
, debug = require('debug')('hail:ripple')

var Ripple = module.exports = function(options) {
    this.options = _.defaults(options, {
        trusted: false,
        websocket_ip: 's2.ripple.com',
        websocket_port: 51233,
        websocket_ssl: true,
        trace: false,
        local_signing: true
    })

    this.ripple = new RippleLib.Remote(options)

    this.ripple.account(this.options.account)
    this.ripple.set_secret(this.options.account, this.options.secret)
    debug('connecting to %s:%d (%sssl)',
        this.options.websocket_ip,
        this.options.websocket_port,
        this.options.websocket_ssl ? '' : 'no ')
    this.ripple.connect()
}

function amountToNum(a) {
    if (!a._currency._value) return num(a.to_text(), 6)
    var res = num(a.to_number())
    res.set_precision(6)
    return res
}

Ripple.prototype.depth = function(market, cb) {
    var that = this
    , base = market.substr(0, 3)
    , quote = market.substr(3)
    , baseIssuer
    , quoteIssuer

    if (base !== 'XRP') baseIssuer = this.options.issuer
    if (quote !== 'XRP') quoteIssuer = this.options.issuer

    function parseOffer(o) {
        var gets = new RippleLib.Amount.from_json(o.TakerGets)
        , pays =  new RippleLib.Amount.from_json(o.TakerPays)
        , price = amountToNum(pays).div(amountToNum(gets))

        return {
            price: price.toString(),
            amount: amountToNum(new RippleLib.Amount.from_json(o.taker_gets_funded)).toString()
        }
    }

    debug('acquiring depth for %s/%s %s/%s', base, baseIssuer, quote, quoteIssuer)

    async.parallel({

        bids: function(next) {
            var book = that.ripple.book(base, baseIssuer, quote, quoteIssuer)
            book.offers(next.bind(null, null))
        },
        asks: function(next) {
            var book = that.ripple.book(quote, quoteIssuer, base, baseIssuer)
            book.offers(next.bind(null, null))
        }
    }, function(err, results) {
        if (err) return cb(err)
        cb(null, {
            bids: results.bids.map(parseOffer),
            asks: results.bids.map(parseOffer)
        })
    })
}

Ripple.prototype.disconnect = function() {
    this.ripple.disconnect()
    this.ripple = null
}

Ripple.prototype.order = function(order, cb) {
    function toAmount(a, currency, issuer) {
        if (currency == 'XRP') return (+num(a).mul(1e6)).toString()

        return {
            currency: currency,
            value: a,
            issuer: issuer
        }
    }

    var tran = this.ripple.transaction()

    var takerPays = toAmount(
        num(order.amount).mul(order.price).toString(),
        order.type == 'ask' ? order.market.substr(3) : order.market.substr(0, 3),
        this.options.issuer)

    var takerGets = toAmount(
        order.amount,
        order.type != 'ask' ? order.market.substr(3) : order.market.substr(0, 3),
        this.options.issuer)

    tran.offer_create(this.options.account, takerPays, takerGets)

    /*
    tran.on('final', console.log.bind(console, 'final'))
    tran.on('proposed', console.log.bind(console, 'proposed'))
    tran.on('state', console.log.bind(console, 'state'))
    tran.on('error', console.log.bind(console, 'error'))
    tran.on('lost', console.log.bind(console, 'lost'))
    tran.on('success', console.log.bind(console, 'success'))
    tran.on('pending', console.log.bind(console, 'pending'))
    */

    tran.on('error', cb)
    tran.on('lost', cb)

    tran.on('final', function(res) {
        if (res.metadata.TransactionResult == 'tesSUCCESS') {
            return cb(null, res.tx_json.Sequence + '')
        }
        cb(new Error(JSON.stringify(res, null, 4)))
    })

    tran.submit()
}

Ripple.prototype.orders = function(cb) {
    var req = this.ripple.request_account_offers(this.options.account, null, true)

    /*
    req.on('final', console.log.bind(console, 'final'))
    req.on('proposed', console.log.bind(console, 'proposed'))
    req.on('state', console.log.bind(console, 'state'))
    req.on('error', console.log.bind(console, 'error'))
    req.on('lost', console.log.bind(console, 'lost'))
    req.on('success', console.log.bind(console, 'success'))
    req.on('pending', console.log.bind(console, 'pending'))
    */

    req.request()

    function parseOffer(o) {
        var gets = new RippleLib.Amount.from_json(o.taker_gets)
        , pays =  new RippleLib.Amount.from_json(o.taker_pays)
        , price = amountToNum(pays).div(amountToNum(gets))

        return {
            price: (+price).toString(),
            amount: (+amountToNum(new RippleLib.Amount.from_json(o.taker_gets))).toString()
        }
    }

    req.on('error', cb)
    req.on('success', function(res) {
        cb(null, res.offers.map(function(o) {
            var offer = parseOffer(o)
            offer.type = 'bid'
            offer.id = o.seq + ''
            offer.market =  (typeof o.taker_pays == 'string' ? 'XRP' : o.taker_pays.currency) +
                (typeof o.taker_gets == 'string' ? 'XRP' : o.taker_gets.currency)
            return offer
        }))
    })
}

Ripple.prototype.cancel = function(seq, cb) {
    var tran = this.ripple.transaction()
    tran.offer_cancel(this.options.account, seq)

    //tran.on('final', console.log.bind(console, 'final'))
    //tran.on('proposed', console.log.bind(console, 'proposed'))
    //tran.on('state', console.log.bind(console, 'state'))
    //tran.on('error', console.log.bind(console, 'error'))
    //tran.on('lost', console.log.bind(console, 'lost'))
    //tran.on('success', console.log.bind(console, 'success'))
    //tran.on('pending', console.log.bind(console, 'pending'))

    tran.on('error', cb)
    tran.on('lost', cb)

    tran.on('final', function(res) {
        if (res.metadata.TransactionResult == 'tesSUCCESS') {
            return cb(null, res.tx_json.Sequence + '')
        }
        cb(new Error(JSON.stringify(res, null, 4)))
    })

    tran.submit()
}
