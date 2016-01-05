'use strict';

// Deps
var DI = require('./lib/DI');
var Boom = require('boom');

var ViperHandler = require('./lib/handler');


var noop = function() {};

/**
 * Plugin module: viper
 *
 */
module.exports = function register(server, options, next) {

	var viper = new Viper(server);

	server.handler('viper', ViperHandler(server, viper));

	// finish plugin configuration
	next();

};


// Set plugin attributes
module.exports.attributes = {
	name: 'viper'
};





function Viper(server) {



	var di = DI();

	this._di = di;

	this.invoke = function(method, locals, scope) {
		return di.serviceInjector.invoke(method, locals, scope);
	};

	this.factory = function(name, factory) {
		di.factory(name, factory);
		return this;
	};

	this.provider = function(name, handler) {
		di.provider(name, handler);
		return this;
	};

	this.value = function(name, val) {
		di.value(name, val);
		return this;
	};



	var requestFactories = {};

	this.createRequestInjector = function(request) {
		var injector = di.serviceInjector.resolveInjector();

		injector.provide('$req', request);
		injector.provide('$payload', request.payload);
		injector.provide('$query', request.query);
		injector.provide('$params', request.params);

		Object.keys(requestFactories).forEach(function(name) {
			injector.factory(name, requestFactories[name]);
		});
		return injector;
	};

	this.requestFactory = function(name, factory) {
		requestFactories[name] = factory;
	};


	// Expose viper on server root object
	server.root.viper = this;

	// Provide server as $server
	this.value('$server', server.root);

}


















