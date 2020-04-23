'use strict';
const express = require('express');
const path = require('path');
/**
 * v2.x
 * Nodejs >= 10.0
 */
class Router {
  constructor (options = {}) {
    let { 
      prefix = '',
      middlewares = [],
      params = {},
      _params = []
    } = options;
    this.prefix = prefix;
    this.middlewares = middlewares;
    this.params = params;
    this._params = _params;
    this.groups = [];
    this.methods = {
      get: [],
      post: [],
      put: [],
      patch: [],
      delete: [],
      head: [],
      all: []
    };
  }

  get (...params) {
    this.methods.get.push(params);

    return this;
  }

  post (...params) {
    this.methods.post.push(params);

    return this;
  }

  put (...params) {
    this.methods.put.push(params);

    return this;
  }

  patch (...params) {
    this.methods.patch.push(params);

    return this;
  }

  delete (...params) {
    this.methods.delete.push(params);

    return this;
  }

  head (...params) {
    this.methods.head.push(params);

    return this;
  }

  all (...params) {
    this.methods.all.push(params);

    return this;
  }

  param (name, fn) {
    if (typeof name === 'function') {
      this._params.push(name);
    }
    if (typeof name === 'string' && name[0] === ':') {
      name = nam.substr(1);
    }
    let ret;
    let len = this._params.length;
    for (var i = 0; i < len; ++i) {
      if (ret = this._params[i](name, fn)) {
        fn = ret;
      }
    }
    if ('function' !== typeof fn) {
      throw new Error('invalid param() call for ' + name + ', got ' + fn);
    }
    (this.params[name] = this.params[name] || []).push(fn);

    return this;
  }

  group (...params) {
    let _prefix;
    let _middlewares = []
    let _callback;
    // handle params
    if (arguments.length === 3) {
      [_prefix, _middlewares, _callback] = params;
      if (typeof middlewares === 'function') {
        _middlewares = [_middlewares];
      }
    } else if (arguments.length === 2) {
      if (typeof params[0] === 'string') {
        _prefix = params[0];
      } else if(typeof params[0] === 'function') {
        _middlewares = [_middlewares];
      } else if (Array.isArray(params[0])) {
        _middlewares = params[0];
      }
      _callback = params[1];
    } else if (arguments.length === 1 && typeof params[0] === 'function') {
      _callback = params[0]
    }

    let router = new Router();
    router.middlewares = this.middlewares.concat(_middlewares);
    if (this.params && Object.keys(this.params).length) {
      router.params = this.params;
    }
    if (Array.isArray(this._params) && this._params.length) {
      router._params = this._params;
    }

    if (_prefix && _prefix !== '' && _prefix !== '/') {
      if (this.prefix && this.prefix !== '/' && this.prefix !== '') {
        router.prefix = this.prefix + _prefix;
      } else {
        router.prefix = _prefix;
      }
    } else { // not found prefix from 
      if (this.prefix && this.prefix !== '' && this.prefix !== '/') {
        router.prefix = this.prefix;
      } else {
        router.prefix = '';
      }
    }
    _callback(router);

    this.groups.push(router);

    return this;
  }

  init (app = null) {
    let routes = [];
    for (let method in this.methods) {
      for (let routeParams of this.methods[method]) {
        let route = express.Router();
        route.params = this.params;
        route._params = this._params;
        if (routeParams.length >= 2) {
          let [uri, ...handler] = routeParams;
          uri = path.posix.join(this.prefix, uri);
          if (this.middlewares.length) {
            route[method](uri, ...this.middlewares, ...handler);
          } else {
            route[method](uri, ...handler);
          }
          routes.push(route);
        }
      }
    }
    for (let group of this.groups) {
      let groupRoutes = group.init();
      if (groupRoutes.length) {
        routes = routes.concat(groupRoutes);
      }
    }
    if (app && typeof app.use === 'function') {
      app.use(routes);
    }

    return routes;
  }
}
module.exports = Router;
// v1.0.x
// module.exports = (app) => {
//     express.Router.group = function(...params) {
//         let prefix;
//         let middlewares = []
//         let configure;
//         if(arguments.length === 3) {
//             if(typeof arguments[0] === 'string') {
//                 prefix = arguments[0];
//             } else if(typeof arguments[0] === 'function') {
//                 middlewares = [arguments[0]]
//             } else if(Array.isArray(arguments[0])) {
//                 middlewares = arguments[0]
//             }
//             if(typeof arguments[1] === 'function') {
//                 middlewares = [arguments[1]]
//             } else if(typeof arguments[1] === 'string') {
//                 prefix = arguments[1]
//             }
//             if(typeof arguments[2] === 'function') {
//                 configure = arguments[2]
//             }
//         } else if(arguments.length === 2) {
//             if(typeof arguments[0] === 'object') {
//                 prefix = arguments[0].prefix || '';
//                 middlewares = arguments[0].middlewares || [];
//                 if (typeof middlewares === 'function') {
//                     middlewares = [middlewares]
//                 }
//             } else if(typeof arguments[0] === 'string') {
//                 prefix = arguments[0];
//             } else if(typeof arguments[0] === 'function') {
//                 middlewares = [arguments[0]];
//             } else if(Array.isArray(arguments[0])) {
//                 middlewares = arguments[0];
//             }
//             configure = arguments[1];
//         } else if(arguments.length === 1 && typeof arguments[0] === 'function') {
//             prefix = '';
//             middlewares = [];
//             configure = arguments[0]
//         }
//         let router = express.Router();

//         if(Array.isArray(middlewares) && middlewares.length > 0) {
//             router.use(...middlewares);
//         }
//         if(prefix && prefix !== '' && prefix !== '/') {
//             if(this._prefix && this._prefix !== '/' && this._prefix !== '') {
//                 app.use(this._prefix + prefix, router);
//                 router._prefix = this._prefix + prefix;
//             } else {
//                 router._prefix = prefix;
//                 app.use(prefix, router);
//             }
//         } else {
//             if(this._prefix && this._prefix !== '' && this._prefix !== '/') {
//                 app.use(this._prefix, router);
//                 router._prefix = this._prefix;
//             } else {
//                 app.use(router);
//                 router._prefix = '';
//             }
//         }
//         // Add all URL params from parent router to child router, when using function router.param().
//         if(typeof this.params === 'object' && Object.keys(this.params).length) {
//             router.params = this.params;
//         }
//         if(Array.isArray(this._params) && this._params.legnth) {
//             router._params = this._params;
//         }

//         if(configure && typeof configure === 'function') {
//             configure(router);
//         }
//         return router;
//     }
// }