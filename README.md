# Express Group Router

## Features:
This package support extend function of Router in ExpressJS to grouping routes.
* It can set prefix for an routes group.
* It can set middlewares for an routes group.

## Installation:
```
npm install express-group-router
```

## Usage:
```js
const express = require('express');
const app = express();
require('express-group-router')(express, app);
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
    
    router.get('/hello-world', (req, res) => { // route: /api/hello-world, middlewares: fooMiddleware
        res.send('Hello world');
    })

    router.group({prefix: '/test', middleware: barMiddleware }, (router) => {
        router.get('/group', (req, res) => { // route: /api/test/group; Middlewares: fooMiddleware, barMiddleware;
            res.send('Test group');
        })
    })

    router.group([barMiddleware], (router) => { // not add sub prefix
        router.get('/not-prefix', (req, res) => { // route: /api/not-prefix
            res.send('Not prefix');
        });
    })

    router.group('/foo', (router) => { // not add middleware more...
        router.get('/bar', (req, res) => { // route: /api/foo/bar
            // Middlewares: fooMiddleware
            res.send('Foo bar')
        })
    })
})
```



