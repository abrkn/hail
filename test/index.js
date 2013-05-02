var expect = require('expect.js')
, hail = require('../index')

describe('hail', function() {
    it('defines Snow', function() {
        expect(hail.Snow).to.be.a('function')
    })

    it('defines MtGox', function() {
        expect(hail.MtGox).to.be.a('function')
    })

    it('defines Ripple', function() {
        expect(hail.Ripple).to.be.a('function')
    })
})
