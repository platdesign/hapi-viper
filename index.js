'use strict';

// Deps
var Boom = require('boom');
var Viper = require('./lib/Viper');
var ViperHandler = require('./lib/handler');


/**
 * Plugin module: viper
 *
 */
module.exports = function register(server, options, next) {

	var viper = new Viper();

	server.root.viper = viper;

	viper.$injector.provide('$server', server.root);


	server.handler('viper', ViperHandler(server, viper));

	// finish plugin configuration
	next();

};


// Set plugin attributes
module.exports.attributes = {
	name: 'viper'
};








// function Viper(server) {



// 	var di = DI();

// 	this._di = di;

// 	this.invoke = function(method, locals, scope) {
// 		return di.serviceInjector.invoke(method, locals, scope);
// 	};

// 	this.factory = function(name, factory) {
// 		di.factory(name, factory);
// 		return this;
// 	};

// 	this.provider = function(name, handler) {
// 		di.provider(name, handler);
// 		return this;
// 	};

// 	this.value = function(name, val) {
// 		di.value(name, val);
// 		return this;
// 	};



// 	var requestFactories = {};

// 	this.createRequestInjector = function(request) {
// 		var injector = di.serviceInjector.resolveInjector();

// 		injector.provide('$req', request);


// 		Object.keys(requestFactories).forEach(function(name) {
// 			injector.factory(name, requestFactories[name]);
// 		});
// 		return injector;
// 	};

// 	this.requestFactory = function(name, factory) {
// 		requestFactories[name] = factory;
// 	};


// 	this.plugin = function(module, options) {

// 		if(!is.fn(module)) {
// 			throw new Error('Plugin has to be a function');
// 		}

// 		module.call(this, options);

// 	};



// 	// Expose viper on server root object
// 	server.root.viper = this;

// 	// Provide server as $server
// 	this.value('$server', server.root);

// }


















