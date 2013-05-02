var expect = require('expect.js')
, Snow = require('../snow')
, snow = new Snow()

describe('Snow', function() {
    describe('markets', function() {
        it('returns at least BTCXRP', function(done) {
            snow.markets(function(err, markets) {
                if (err) return done(err)

                var btcxrp = markets.filter(function(m) {
                    return m.id == 'BTCXRP'
                })[0]

                expect(btcxrp).to.be.ok()
                expect(btcxrp.volume).to.be.a('string')

                done()
            })
        })
    })

    describe('market', function() {
        it('returns stats for BTCXRP', function(done) {
            snow.market('BTCXRP', function(err, market) {
                if (err) return done(err)
                expect(market.last === null || typeof market.high == 'string')
                expect(market.bid === null || typeof market.high == 'string')
                expect(market.ask === null || typeof market.high == 'string')
                expect(market.high === null || typeof market.high == 'string')
                expect(market.low === null || typeof market.high == 'string')
                expect(market.volume).to.be.a('string')
                done()
            })
        })
    })

    describe('depth', function() {
        it('returns depth for BTCXRP', function(done) {
            snow.depth('BTCXRP', function(err, depth) {
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
})
