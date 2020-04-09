# Express Group Router

## Features:
This package support extend function of Router in ExpressJS to grouping routes.
* It can set prefix for an routes group.
* It can set middlewares for an routes group.

## Installation:
```
npm i --save express-group-router
```

## Usage:
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



