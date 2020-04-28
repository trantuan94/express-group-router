'use strict';
const express = require('express');
const Urljoin = require('url-join');
/**
 * v2.x
 * Nodejs >= 10.0
 */
class Route {
  constructor (initparams = {}) {
    let { 
      prefix = '',
      middlewares = [],
      params = {},
      _params = []
    } = initparams;
    this.$prefix = prefix;
    this.$middlewares = middlewares;
    this.params = params;
    this._params = _params;
    this.$groups = [];
    this.$methods = {
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
    this.$methods.get.push(params);

    return this;
  }

  post (...params) {
    this.$methods.post.push(params);

    return this;
  }

  put (...params) {
    this.$methods.put.push(params);

    return this;
  }

  patch (...params) {
    this.$methods.patch.push(params);

    return this;
  }

  delete (...params) {
    this.$methods.delete.push(params);

    return this;
  }

  head (...params) {
    this.$methods.head.push(params);

    return this;
  }

  all (...params) {
    this.$methods.all.push(params);

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
      } else if (!Array.isArray(params[0]) && typeof params[0] === 'object') {
        _prefix = params[0].prefix || '';
        _middlewares = params[0].middlewares || [];
      }
      _callback = params[1];
    } else if (arguments.length === 1 && typeof params[0] === 'function') {
      _callback = params[0];
    }

    _middlewares = _middlewares.concat(this.$middlewares);
    if (_prefix && _prefix !== '' && _prefix !== '/') {
      _prefix = (this.$prefix && this.$prefix !== '/' && this.$prefix !== '')
        ? Urljoin(this.$prefix, _prefix) : _prefix;
    } else { // not found prefix from 
      _prefix = (this.$prefix && this.$prefix !== '' && this.$prefix !== '/') ? this.$prefix : '';
    }
    let router = new Router({
      prefix: _prefix,
      middlewares: _middlewares,
      params: this.params && Object.keys(this.params).length ? this.params : {},
      _params: Array.isArray(this._params) && this._params.length ? this._params : [],
    })
    if ('function' === (typeof _callback)) {
      _callback(router);
    } else {
      throw new Error("The router's group function must has the callback function.")
    }
    this.$groups.push(router);


    return this;
  }

  init (app = null) {
    let routes = [];
    for (let method in this.$methods) {
      for (let routeParams of this.$methods[method]) {
        let route = express.Router();
        route.params = this.params;
        route._params = this._params;
        if (routeParams.length >= 2) {
          let [uri, ...handler] = routeParams;
          uri = Urljoin(this.$prefix, uri);
          if (!uri.startsWith('/')) {
            uri = '/' + uri;
          }
          if (this.$middlewares.length) {
            route[method](uri, ...this.$middlewares, ...handler);
          } else {
            route[method](uri, ...handler);
          }
          routes.push(route);
        }
      }
    }
<<<<<<< Updated upstream

    for (let group of this.groups) {
=======
    for (let group of this.$groups) {
>>>>>>> Stashed changes
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

  prefix (prefix) {
    this.$prefix = _prefix;

    return this;
  }

  use (middlewares) {
    if ('function' === (typeof middlewares)) {
      this.$middlewares.push(middlewares);
    } else if (Array.isArray(middlewares)) {
      for (let middleware of middlewares) {
        this.use(middleware);
      }
    } else {
      throw new Error('Please use a middlewares function or Array of middlewares functions in Expressjs.');
    }

    return this;
  }

  middleware (middlewares) {
    this.use(middlewares);

    return this;
  }
}
module.exports = Route;
