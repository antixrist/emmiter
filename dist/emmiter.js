(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Emmiter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],2:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],3:[function(require,module,exports){
// if (typeof require !== 'undefined') {}

var isFunction = function (functionToCheck) {
	var getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};

if (typeof module !== 'undefined' && module.exports) {
	module.exports = isFunction;
}
},{}],4:[function(require,module,exports){
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isArray = require('isarray');

module.exports = function isObject(o) {
  return o != null && typeof o === 'object' && !isArray(o);
};

},{"isarray":5}],5:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],6:[function(require,module,exports){

/**
 * An Array.prototype.slice.call(arguments) alternative
 *
 * @param {Object} args something with a length
 * @param {Number} slice
 * @param {Number} sliceEnd
 * @api public
 */

module.exports = function (args, slice, sliceEnd) {
  var ret = [];
  var len = args.length;

  if (0 === len) return ret;

  var start = slice < 0
    ? Math.max(0, slice + len)
    : slice || 0;

  if (sliceEnd !== undefined) {
    len = sliceEnd < 0
      ? sliceEnd + len
      : sliceEnd
  }

  while (len-- > start) {
    ret[len - start] = args[len];
  }

  return ret;
}


},{}],"emmiter":[function(require,module,exports){
'use strict';

var slice         = require('sliced'),
    extend        = require('extend'),
    isPlainObject = require('isobject'),
    isArray       = require('isarray'),
    isFunction    = require('isfunction'),
    isUndefined   = function (input) {
      return typeof input == 'undefined';
    };

if (!Array.prototype.some) {
  Array.prototype.some = function(fun/*, thisArg*/) {
    'use strict';

    if (this == null) {
      throw new TypeError('Array.prototype.some called on null or undefined');
    }

    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;

    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t && fun.call(thisArg, t[i], i, t)) {
        return true;
      }
    }

    return false;
  };
}

/**
 * @typedef {{}} Event
 * @property {string} name
 * @property {string} [ns=]
 */

/**
 * @typedef {{}} Listener
 * @property {string} name
 * @property {string} ns
 * @property {function|null} fn
 */

/**
 * @param {Event|string|*} event
 * @param {*} [callback]
 */
var checkArgs = function (event, callback) {
  if (typeof event !== 'string' || !event) {
    throw Error('event should be string!');
  }

  if (arguments.length === 2 && typeof callback !== 'function') {
    throw Error('callback should be function!');
  }
};

var EVENT_ALL = '*';

/**
 * @constructor
 */
var Emmiter = function Emmiter () {
  if (!(this instanceof Emmiter)) {
    return new Emmiter;
  }

  return this;
};

Emmiter.prototype.NS_SEPARATOR = (function (separator) {
  return function (_) {
    if (typeof _ != 'undefined') {
      separator = _;
    }

    return separator;
  }
})('.');

/**
 * @param {Listener} listener
 * @returns {boolean}
 * @private
 */
Emmiter.prototype._isListener = function _isListener (listener) {
  return !isUndefined(listener['event']) && !isUndefined(listener['ns']) && !isUndefined(listener['fn']);
};

/**
 * @param {string|Event} event
 * @returns {Event}
 */
Emmiter.prototype._parseEventName = function (event) {
  var result = null, tmp;

  if (
    isPlainObject(event) &&
    typeof event.name != 'undefined' &&
    typeof event.ns   != 'undefined'
  ) {
    result = event;
  } else {
    tmp    = event.split(this.NS_SEPARATOR());
    result = {
      name: tmp[0] || '',
      ns:   tmp[1] || ''
    };
  }

  return result;
};

/**
 * @param {string|Event} event
 * @returns {string}
 */
Emmiter.prototype._buildEventName = function (event) {
  event = this._parseEventName(event);

  return (event.ns) ? [event.name, event.ns].join(this.NS_SEPARATOR()) : event.name;
};


/**
 * @param {Event|string|string[]} [events]
 * @param {Function} [callback]
 * @param {boolean} [exclude=false]
 * @returns {Array}
 */
Emmiter.prototype.getListeners = function getListeners (events, callback, exclude) {
  var args; for (var i = arguments.length, a = args = new Array(i); i--; a[i] = arguments[i]) {}

  this.listeners = this.listeners || [];

  if (args.length < 2) {
    callback = null;
    exclude  = false;
  } else
  if (args.length == 2) {
    if (isFunction(args[1])) {
      callback = args[1];
      exclude  = false;
    } else {
      callback = null;
      exclude  = !!exclude;
    }
  } else
  if (args.length == 3) {
    callback = (isFunction(callback)) ? callback : null;
    exclude  = !!exclude;
  }

  var listenersCriteria = [],
      _listeners        = [],
      listeners         = this.listeners;

  if (!!events || callback) {
    listenersCriteria = this._parseListeners(events, callback);
    _listeners = listeners.filter(function (listener) {
      var found = listenersCriteria.some(function (listenerCriteria) {
        return (
          (!listenerCriteria.event  || listenerCriteria.event == listener.event) &&
          (!listenerCriteria.ns     || listenerCriteria.ns    == listener.ns) &&
          (!isFunction(callback)    || callback            == listener.fn)
        );
      });

      if (exclude) {
        return !found;
      }

      return found;
    });

    listeners = _listeners;
  }

  return listeners;
};

/**
 * @param {Event|string|string[]} events
 * @param {Function} [callback]
 * @returns {Array}
 */
Emmiter.prototype._parseListeners = function _parseListeners (events, callback) {
  callback  = (isFunction(callback)) ? callback : null;

  var listeners = [],
      self      = this;

  if (isPlainObject(events)) {
    if (this._isListener(events)) {
      listeners.push(events);
    } else {
      for (var event in events) if (events.hasOwnProperty(event)) {
        callback = events[event];
        listeners = listeners.concat(this._parseListeners(event, callback));
      }
    }
  } else
  if (isArray(events)) {
    events.forEach(function (event) {
      listeners = listeners.concat(self._parseListeners(event, callback));
    });
  } else
  if (typeof events == 'string') {
    events = events.split(' ');
    if (events.length > 1) {
      listeners = listeners.concat(this._parseListeners(events, callback));
    } else {
      event = this._parseEventName(events[0]);
      //checkArgs(event.name, callback);
      listeners.push({
        event: event.name,
        ns:    event.ns,
        fn:    callback
      });
    }
  } else
  if (callback) {
    listeners.push({
      event: '',
      ns:    '',
      fn:    callback
    });
  }

  return listeners;
};

/**
 * @param {Event|string|string[]} events
 * @param {function} [callback]
 * @returns {Emmiter}
 */
Emmiter.prototype.addListener =
Emmiter.prototype.bind =
Emmiter.prototype.on = function on (events, callback) {
  callback = (isFunction(callback)) ? callback : null;

  this.listeners = this.getListeners().concat(this._parseListeners(events, callback));

  return this;
};

/**
 * @param {Event|string} event
 * @param {function} callback
 * @returns {Emmiter}
 */
Emmiter.prototype.once =
Emmiter.prototype.one = function one (event, callback) {
  checkArgs(event, callback);

  var self = this;

  self.on(event, function fn () {
    callback();
    self.off(event, fn);
  });

  return this;
};

/**
 * @param {Event|string} events
 * @param [callback]
 * @returns {Emmiter}
 */
Emmiter.prototype.removeListener =
Emmiter.prototype.unbind =
Emmiter.prototype.off = function off (events, callback) {
  callback = (isFunction(callback)) ? callback : null;

  this.listeners = this.getListeners(events, callback, true);

  return this;
};

/**
 * @param {Event|string|string[]} events
 * @param {...*} [args]
 * @returns {Emmiter|[]|*}
 */
Emmiter.prototype.trigger =
Emmiter.prototype.emit = function emit (events, args) {
  var self      = this,
      results   = [];

  var _args; for (var i = arguments.length, a = _args = new Array(i); i--; a[i] = arguments[i]) {}
  _args = slice(_args, 1);

  this.getListeners(events).forEach(function (listener) {
    //var eventName = self._buildEventName({name: listener.event, ns: listener.ns});
    //results.push(listener.fn.apply(self, args.concat([eventName])));

    results.push(listener.fn.apply(self, _args));
  });

  if (!!this._returnListenersResults) {
    return results;
    //return (results.length == 1) ? results[0] : results;
  }

  return this;
};

/**
 * @param {boolean} bool
 */
Emmiter.prototype.returnListenersResults = function returnListenersResults (bool) {
  this._returnListenersResults = !!bool;
};

/**
 * @static
 * @param {*} target
 * @returns {*}
 */
Emmiter.extend =
Emmiter.patch = function (target) {
  return extend(target, new Emmiter(), Emmiter.prototype);
};

/**
 * @static
 * @returns {Emmiter}
 */
Emmiter.create = function () {
  //return Object.create(Emmiter.prototype);
  return new Emmiter;
};

/**
 * @param ctx
 * @static
 */
Emmiter.destroy = function (ctx) {
  delete ctx.NS_SEPARATOR;
  delete ctx._isListener;
  delete ctx._parseEventName;
  delete ctx._buildEventName;
  delete ctx.getListeners;
  delete ctx._parseListeners;
  delete ctx.on;
  delete ctx.bind;
  delete ctx.addListener;
  delete ctx.one;
  delete ctx.once;
  delete ctx.off;
  delete ctx.unbind;
  delete ctx.removeListener;
  delete ctx.emit;
  delete ctx.trigger;
  delete ctx.returnListenersResults;
};

module.exports = Emmiter;

},{"extend":1,"isarray":2,"isfunction":3,"isobject":4,"sliced":6}]},{},["emmiter"])("emmiter")
});