var expect = require('expect.js')
, Bitstamp = require('../bitstamp')
, config = require('konfu')

describe('Bitstamp', function() {
    this.timeout(30e3)
    describe('market', function() {
        it('returns the BTCUSD market', function(done) {
            var bitstamp = new Bitstamp()
            bitstamp.market('BTCUSD', function(err, market) {
                expect(market.last).to.be.a('string')
                expect(market.high).to.be.a('string')
                expect(market.low).to.be.a('string')
                expect(market.volume).to.be.a('string')
                expect(market.ask).to.be.a('string')
                expect(market.bid).to.be.a('string')
                done()
            })
        })
    })

    describe('depth', function() {
        it('returns depth for BTCUSD', function(done) {
            var bitstamp = new Bitstamp()
            bitstamp.depth('BTCUSD', function(err, depth) {
                if (err) return done(err)
                expect(depth.bids.length).to.be.ok()
                expect(depth.bids[0].volume).to.be.a('string')
                expect(depth.asks[0].price).to.be.a('string')
                expect(depth.bids[1].volume).to.be.a('string')
                expect(depth.asks[1].price).to.be.a('string')
                done()
            })
        })
    })

    describe('order/orders/cancel', function() {
        var bitstamp = new Bitstamp({
            customer_id: config.bitstamp_customer_id,
            password: config.bitstamp_password
        })
        , id

        after(function(done) {
            if (!id) return done()
            bitstamp.cancel(id, done)
        })

        it('can create and cancel an order', function(done) {
            if (!config.bitstamp_password) {
                console.log('Skipping test (API secret needed)')
                return done()
            }

            bitstamp.order({
                side: 'ask',
                price: '10000',
                volume: '0.01',
                market: 'BTCUSD'
            }, function(err, i) {
                id = i
                if (err) return done(err)
                expect(id).to.be.a('string')

                bitstamp.orders(function(err, orders) {
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
