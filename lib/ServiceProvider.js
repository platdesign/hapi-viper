'use strict';

var DI = require('./DIUtils');
var Q = require('q');

module.exports = ServiceProvider;



function ServiceProvider(providerProvider, factoryAttr) {

	factoryAttr = factoryAttr || '$get';

	const providerSuffix = providerProvider.SUFFIX;

	var that = this;

	// Service constructors
	var factories = {};

	// Service instances
	var services = {};


	this.$injector = DI.createInjector(services, function(key, caller) {
		return getServiceInstance(key, caller);
	});


	this.$register = function(name, factory) {
		factories[name] = factory;
	};


	function getServiceInstance(name, caller) {

		return Q.fcall(function() {
			if( services.hasOwnProperty(name) ) {
				return services[name];
			} else if( factories.hasOwnProperty(name) ) {

				return services[name] = that.$injector.invoke(factories[name])
				.then(function(service) {
					return services[name] = service;
				});

			} else {
				return providerProvider.$injector.get(name + providerSuffix, caller)

				.then(function(provider) {

					if(!provider.hasOwnProperty( factoryAttr )) {
						return Promise.reject( new Error('Provider '+name +' needs a '+factoryAttr+' attribute!') );
					} else {
						return services[name] = that.$injector.invoke(provider[factoryAttr], {}, null, function(name) {
							return getServiceInstance(name);
						})
						.then(function(instance) {
							return services[name] = instance;
						});
					}

				});
			}
		});

	}

}
