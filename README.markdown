Hail
===

Common interface to virtual currency exchanges.

[![Build Status](https://travis-ci.org/abrkn/hail.png)](https://travis-ci.org/abrkn/hail)

Installation
---

```
npm install hail
```

Usage
---

```javascript
    var hail = require('hail');

    var gox = new hail.MtGox({
        key: 'my api key'
    });

    var snow = new hail.Snow({
        key: 'herp',
        url: 'derp'
    });

    // Only a single issuer is supported
    var ripple = new hail.Ripple({
        account: 'rAAAAAAAAAAAAAAA',
        secret: 'ssd123123123123',
        issuer: 'r123123123'
    });

    var all = [gox, snow, ripple];

    all.forEach(function(exchange) {
        exchange.depth('BTCUSD', function(err, depth) {
            console.log(depth);
        });

        exchange.order({
            market: 'BTCUSD',
            side: 'bid',
            volume: '1'
            price: '500'
        }, function(err, id) {
            console.log('Order #%s placed', id);
        });
    });

```

Tests
---

```
npm test
```

To test the private features (enumerate orders, create orders, cancel orders), you need to create a file named `config.json` in the root of the module (same directory as this file)

```
{
    "mtgox_key": "",
    "mtgox_secret": "",
    "ripple_account": "",
    "ripple_secret": "",
    "ripple_issuer": ""
}
```

License
---

```
Copyright (c) Andreas Brekken (“Author”) and Contributors

All rights reserved.

The “Free as in Hugs” License

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

Users of this software are permitted to offer to hug the Author or Contributors, free of charge or obligation.

THIS SOFTWARE AND ANY HUGS ARE PROVIDED BY THE AUTHOR AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL ANYONE BE HELD LIABLE FOR ACTUAL HUGS. IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; LONELINESS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. DON’T BE CREEPY.
```
