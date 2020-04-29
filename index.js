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
      _params = [],
      options = {}
    } = initparams;
    this.$prefix = prefix;
    this.$middlewares = middlewares;
    this.params = params;
    this._params = _params;
    this.$groups = [];
    this.$urls = [];
    this.$options = {
      caseSensitive: false,
      mergeParams: true,
      strict: false,
    };
    this.setOptions(options);
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
    let _options;
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
        _options = params[0].options || this.$options;
      }
      _callback = params[1];
    } else if (arguments.length === 1 && typeof params[0] === 'function') {
      _callback = params[0];
    }

    let router = new Route({
      prefix: _prefix,
      middlewares: _middlewares,
      params: {},
      _params: [],
      options: _options
    })
    if ('function' === (typeof _callback)) {
      _callback(router);
    }
    this.$groups.push(router);

    return router;
  }

  init (obj = null) {
    let routes = [];
    if (obj && typeof obj === 'object' && !obj.use && typeof obj.use !== 'function') {
      let {
        parentPrefix = '',
        parentMiddlewares = [],
        parentParams = {},
        _parentParams = []
      } = obj;
      this.$middlewares = parentMiddlewares.concat(this.$middlewares);
      this.$prefix = Urljoin(parentPrefix, this.$prefix);
      if (this.$options && this.$options.mergeParams) {
        this.params = {...parentParams, ...this.params };
        this._params = [..._parentParams, ...this._params];
      }
    }
    for (let method in this.$methods) {
      for (let routeParams of this.$methods[method]) {
        let route = express.Router({
          caseSensitive: this.$options.caseSensitive,
          strict: this.$options.strict
        });
        route.params = this.params;
        route._params = this._params;
        if (routeParams.length >= 2) {
          let [uri, ...handler] = routeParams;
          uri = Urljoin(this.$prefix, uri);
          if (!uri.startsWith('/')) {
            uri = '/' + uri;
          }
          this.$urls.push({url: uri, method: method });
          if (this.$middlewares.length) {
            route[method](uri, ...this.$middlewares, ...handler);
          } else {
            route[method](uri, ...handler);
          }
          routes.push(route);
        }
      }
    }
    for (let group of this.$groups) {
      let groupRoutes = group.init({
        parentPrefix: this.$prefix,
        parentMiddlewares: this.$middlewares,
        parentParams: this.params,
        _parentParams: this._params
      });
      if (groupRoutes.length) {
        routes = routes.concat(groupRoutes);
        this.$urls = this.$urls.concat(group.$urls);
      }
    }
    if (obj && typeof obj.use === 'function') {
      obj.use(routes);
    }

    return routes;
  }

  prefix (prefix) {
    this.$prefix = prefix;

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

  setOptions (options = null) {
    if (options && typeof options === 'object') {
      let {
        caseSensitive = this.$options.caseSensitive || false,
        mergeParams = this.$options.mergeParams || true,
        strict = this.$options.strict || false
      } = options;
      this.$options = {
        caseSensitive: !!caseSensitive,
        mergeParams: !!mergeParams,
        strict: !!strict
      }
    }

    return this;
  }
}
module.exports = Route;
