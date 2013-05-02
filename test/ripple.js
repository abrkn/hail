var expect = require('expect.js')
, Ripple = require('../ripple')
, config = require('konfu')
, ripple = new Ripple({
    account: config.ripple_account,
    secret: config.ripple_secret,
    issuer: config.ripple_issuer
})

describe('Ripple', function() {
    this.timeout(60e3)

    describe('depth', function() {
        it('returns depth for BTCXRP', function(done) {
            ripple.depth('BTCXRP', function(err, depth) {
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
            ripple.cancel(id, done)
        })

        it('can create and cancel an order', function(done) {
            if (!config.ripple_secret) {
                console.log('Skipping test (API secret needed)')
                return done()
            }

            ripple.order({
                side: 'bid',
                price: '5',
                volume: '2',
                market: 'BTCXRP'
            }, function(err, i) {
                id = i
                if (err) return done(err)
                expect(id).to.be.a('string')

                ripple.orders(function(err, orders) {
                    if (err) return done(err)

                    var order = orders.filter(function(o) {
                        return o.id === id
                    })[0]

                    expect(order.price).to.be('5')
                    expect(order.volume).to.be('2')
                    expect(order.side).to.be('bid')
                    expect(order.market).to.be('BTCXRP')

                    done()
                })
            })
        })
    })
})
