var expect = require('expect.js')
, MtGox = require('../mtgox')
, config = require('konfu')
, mtgox = new MtGox({
    key: config.mtgox_key,
    secret: config.mtgox_secret
})

describe('MtGox', function() {
    this.timeout(10e3)

    describe('markets', function() {
        it('returns only BTCUSD', function(done) {
            mtgox.markets(function(err, markets) {
                if (err) return done(err)
                expect(markets.length).to.be(1)
                expect(markets[0].id).to.be('BTCUSD')
                done()
            })
        })
    })

    describe('market', function() {
        it('returns stats for BTCUSD', function(done) {
            mtgox.market('BTCUSD', function(err, market) {
                if (err) return done(err)
                expect(market.last).to.be.a('string')
                expect(market.bid).to.be.a('string')
                expect(market.ask).to.be.a('string')
                expect(market.high).to.be.a('string')
                expect(market.low).to.be.a('string')
                expect(market.volume).to.be.a('string')
                expect(market.average).to.be.a('string')
                expect(market.timestamp).to.be.a('number')
                done()
            })
        })
    })

    describe('depth', function() {
        it('returns depth for BTCUSD', function(done) {
            mtgox.depth('BTCUSD', function(err, depth) {
                if (err) return done(err)

                var bid = depth.bids[0]
                expect(bid.price).to.be.a('string')
                expect(bid.volume).to.be.a('string')

                var ask = depth.asks[0]
                expect(ask.price).to.be.a('string')
                expect(ask.volume).to.be.a('string')

                done()
            })
        })
    })

    describe('order/orders/cancel', function() {
        var id

        after(function(done) {
            if (!id) return done()
            mtgox.cancel(id, done)
        })

        it('can create and cancel an order', function(done) {
            if (!config.mtgox_secret) {
                console.log('Skipping test (API secret needed)')
                return done()
            }

            mtgox.order({
                side: 'ask',
                price: '10000',
                volume: '0.01',
                market: 'BTCUSD'
            }, function(err, i) {
                id = i
                if (err) return done(err)
                expect(id).to.be.a('string')

                mtgox.orders(function(err, orders) {
                    if (err) return done(err)

                    var order = orders.filter(function(o) {
                        return o.id === id
                    })[0]

                    expect(order.price).to.be('10000')
                    expect(order.volume).to.be('0.01')
                    expect(order.side).to.be('ask')
                    expect(order.market).to.be('BTCUSD')

                    done()
                })
            })
        })
    })
})
