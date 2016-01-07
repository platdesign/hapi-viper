'use strict';



var ProviderProvider = require('./ProviderProvider');
var ServiceProvider = require('./ServiceProvider');



module.exports = Viper;


function Viper() {

	var providerProvider = new ProviderProvider();

	this.provider = function(name, constructor) {
		providerProvider.$register(name, constructor);
		return this;
	};

	this.factory = function(name, factory) {
		return this.provider(name, function() {
			this.$get = factory;
		});
	};

	this.invoke = function(fn, locals, scope) {
		return providerProvider.$injector.invoke(fn, locals, scope);
	};

	this.instantiate = function(fn, locals) {
		return providerProvider.$injector.instantiate(fn, locals);
	};

	this.get = function(name) {
		return providerProvider.$injector.get(name);
	};

	this.plugin = function(plugin, options) {
		plugin.call(this, options);
	};

	this.value = function(name, value) {
		return this.factory(name, function() {
			return value;
		});
	};


	this._createRequestInstance = function() {

		var instance = {};

		var serviceProvider = new ServiceProvider( providerProvider );

		instance.invoke = function(fn, locals, scope) {
			return serviceProvider.$injector.invoke(fn, locals, scope);
		};

		instance.instantiate = function(fn, locals) {
			return serviceProvider.$injector.instantiate(fn, locals);
		};

		instance.get = function(name) {
			return serviceProvider.$injector.get(name);
		};

		instance.factory = function(name, factory) {
			serviceProvider.$register(name, factory);
			return this;
		};

		instance.value = function(name, value) {
			return instance.factory(name, function() {
				return value;
			});
		};

		return instance;

	};




}

