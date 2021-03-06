'use strict';

var Q = require('q');

var providerSuffix = 'Provider';

function isObject(obj) {
	return (!!obj) && (obj.constructor === Object);
}

function supportObject(delegate) {
	return function(key, value) {
		if (isObject(key)) {
			Object.keys(key).forEach(function(k) {
				delegate(k, key[k]);
			});
		} else {
			return delegate(key, value);
		}
	};
}

var COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var PARAMS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;

function fnToString (fn) {

	// remove whitespace
	var fnString = fn.toString().replace(/\s/mg, '');

	// Remove comments
	fnString = fnString.replace(COMMENTS, '');

	// Match params
	var args = fnString.match(PARAMS);

	// Sanitize signature
	if (args) {
		fnString = 'function(' + (args[1] || '').replace(/[\s\r\n]+/, ' ') + ')';
	} else {
		fnString = 'function()';
	}

	return fnString;
}

function getFnParams (fn) {

	var fnString = fnToString(fn);

	// return array of parameters
	return PARAMS.exec(fnString)[1].split(/\s*,\s*/).filter(function (param) {
		return param;
	});
}

function annotate(fn) {
	var args;

	if( Array.isArray(fn) ) {
		args = fn.slice(0, fn.length-1);
	} else {
		args = getFnParams(fn);
	}

	return args;
}


var diErr = function(msg) {
	return new Error(msg);
};

var __multiPromiseValues = function(results) {

	var args = [];
	results.forEach(function(result) {

		if(result.state === 'fulfilled') {
			args.push(result.value);
		} else {
			throw result.reason;
		}

	});

	return args;
};

function __fn2promisedArgs(fn, locals, getFactory) {



	var caller = fn;
	var params = annotate(fn);

	var args = [];

	params.forEach(function(key) {
		args.push( Q.when( /* locals && */ locals.hasOwnProperty(key) ? locals[key] : getFactory(key, caller) ) );
	});

	return args;
}

function _invoke(fn, locals, scope, getFactory) {

	var args = __fn2promisedArgs(fn, locals, getFactory);

	if( Array.isArray(fn) ) {
		fn = fn[fn.length-1];
	}

	return Q.allSettled(args)
	.then(__multiPromiseValues)
	.then(function(args) {
		return fn.apply(scope || fn, args);
	});

}


function _instantiate(fn, locals, getFactory) {

	var args = __fn2promisedArgs(fn, locals, getFactory);

	if( Array.isArray(fn) ) {
		fn = fn[fn.length-1];
	}

	return Q.allSettled(args)
	.then(__multiPromiseValues)
	.then(function(args) {

		var instance = new (fn.bind.apply(fn, [null].concat(args)))();
		return instance;

	});

}







function createInjector(store, getFactory) {
	store = store || {};

	getFactory = getFactory || function(key) {
		if( store.hasOwnProperty(key) ) {
			return store[key];
		} else {
			throw new Error('Dep not found: '+key);
		}
	};


	var instance = {
		_store: store,
		invoke: function(fn, locals, scope) {
			locals = locals || {};
			return _invoke(fn, locals, scope, getFactory);
		},
		instantiate: function(fn, locals) {
			locals = locals || {};
			return _instantiate(fn, locals, getFactory);
		},
		provide: function(name, handler) {
			store[name] = handler;
		},
		remove: function(name) {
			store[name] = null;
		},
		get: getFactory,
		resolveInjector: function($injector) {
			return createResolveInjector($injector || instance);
		},
		create: function(store, getFactory) {
			return createInjector(store, getFactory);
		}
	};

	store.$injector = instance;

	return instance;
}






function createResolveInjector($injector) {

	var constructors = {};
	var instances = {};

	var injector = createInjector(instances, function(key, caller) {

		if(instances[key]) {
			return instances[key];
		} else if(constructors[key]) {
			var instance = instances[key] = injector.invoke(constructors[key], instances);
			return instance;
		} else {
			return $injector.get(key, caller);
		}

	});

	injector.factory = function(key, factory) {
		constructors[key] = factory;
	};

	return injector;

}














module.exports = {
	createInjector: createInjector,
};



