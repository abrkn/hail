var expect = require('expect.js')
, Btce = require('../btce')
, config = require('konfu')
, btce = new Btce({
    key: config.btce_key,
    secret: config.btce_secret
})

describe('Btce', function() {
    this.timeout(10e3)

    describe('markets', function() {
        it('returns only names', function(done) {
            btce.markets(function(err, markets) {
                if (err) return done(err)
                expect(markets.length).to.be.ok()
                expect(markets[0].id).to.be.ok()
                done()
            })
        })
    })

    describe('market', function() {
        it('returns stats for BTCUSD', function(done) {
            btce.market('BTCUSD', function(err, market) {
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
            btce.depth('BTCUSD', function(err, depth) {
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
            btce.cancel(id, done)
        })

        it('can create and cancel an order', function(done) {
            if (!config.btce_secret) {
                console.log('Skipping test (API secret needed)')
                return done()
            }

            btce.order({
                side: 'ask',
                price: '399.999',
                volume: '0.01',
                market: 'BTCUSD'
            }, function(err, i) {
                id = i
                if (err) return done(err)
                expect(id).to.be.a('string')

                btce.orders(function(err, orders) {
                    if (err) return done(err)

                    var order = orders.filter(function(o) {
                        return o.id === id
                    })[0]

                    expect(order).to.be.ok()
                    expect(order.price).to.be('399.999')
                    expect(order.volume).to.be('0.01')
                    expect(order.side).to.be('ask')
                    expect(order.market).to.be('BTCUSD')

                    done()
                })
            })
        })
    })
})
