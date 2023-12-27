<span align="center">
    <h1>Express Group Router</h1>
</span>

# Features:
This package support extend function of Router in ExpressJS to grouping routes.
* It can set prefix for an routes group.
* It can set middlewares for an routes group.

# Installation:
```
npm i --save express-group-router
```

# Usage:
## Version 2.x
```js
const express = require('express');
const app = express();
const Router = require('express-group-router');
let router = new Router();
const fooMiddleware = (req, res, next) => {
    console.log('foo');
    next();
}

const barMiddleware = (req, res, next) => {
    console.log('bar');
    next();
}
router.get('/hello', (req, res) => {
    res.send('Hello world');
})

router.group('/foo', [fooMiddleware], (router) => {
    router.get('/a', (req, res) => {
        res.send('Foo');
    });

    router.group('/bar', [barMiddleware], (router) => {
        router.get('/test', (req, res) => {
            res.send('Test Bar');
        })
    })
});
let listRoutes = router.init();
app.use(listRoutes);

```
You also use prefix(), middleware() as below to set prefix, set middlewares and options
for router of ExpressJS;
```js
// Set prefix
router.group((router) => {
    router.get('testprefix', (req, res) => {
        res.send('Test function set prefix');
    })
}).prefix('api').middleware(fooMiddleware);
// Result: /api/testprefix - method GET with middleware fooMiddleware.
```
In ExpressJS Router (The original Router of Express, it provide options argument when call constructor)
You can refer from <a href="https://expressjs.com/en/api.html">https://expressjs.com/en/api.html</a>
And this package also provide options
```js
const Route = require('express-group-router');
let router = new Route({ options: { caseSensitive: true, mergeParams: false, strict: true }});
// Or 
router.setOptions({
    caseSensitive: false
});

// or
router.param('id', (req, res, next) => {
    // do something...
    req.object = 'object value';
})
router.group((router) => {
    router.get('/value/:id', (req, res) => {
        res.send(req.object);
    });
}).prefix('test').setOptions({ mergeParams: true });
// route: /test/value/:id return 'object value' on browser.
// To convinient, the mergeParams default value is true;
// If the parent and the child have conflicting param names, the child’s value take precedence.

// if mergeParams = false => route /test/value/:id will return undefined;
router.group({ prefix: 'test2', options: { mergeParams: false }}, (router) => {
    router.get('/:id', (router) => {
        res.send(req.object); // return undefined;
    })
});
```
## Version 1.x
```js
const express = require('express');
const app = express();
require('express-group-router')(app);
const fooMiddleware = (req, res, next) => {
    console.log('foo');
    next();
}

const barMiddleware = (req, res, next) => {
    console.log('bar');
    next();
}
let router = express.Router();
router.group({ prefix: '/api', middlewares: [fooMiddleware]}, (router) => {
    // route: /api/hello-world, middlewares: fooMiddleware
    router.get('/hello-world', (req, res) => { 
        res.send('Hello world');
    })

    router.group({prefix: '/test', middleware: barMiddleware }, (router) => {
        // route: /api/test/group; Middlewares: fooMiddleware, barMiddleware;
        router.get('/group', (req, res) => { 
            res.send('Test group');
        })
    })

    router.group([barMiddleware], (router) => { // not add sub prefix
        // route: /api/not-prefix
        router.get('/not-prefix', (req, res) => { 
            res.send('Not prefix');
        });
    })

    router.group('/prefix' ,[barMiddleware], (router) => { // not add sub prefix
        // route: /api/prefix/alert
        router.get('/alert', (req, res) => { 
            res.send('Not prefix');
        });
    })

    router.group('/foo', (router) => { // not add middleware more..
        // route: /api/foo/bar
        router.get('/bar', (req, res) => { 
            // Middlewares: fooMiddleware
            res.send('Foo bar')
        })
    })
})
```

## Buy me a coffee
If you like this library, buy me a coffee, thanks!

Vietnam Bank transfer
<p align="left">
    <img src="./donate-account.png" width="160" alt="Donate account">
</p>

