'use strict';


var DI = require('./DIUtils');
var Q = require('q');

module.exports = ProviderProvider;


function ProviderProvider() {

	var that = this;

	var providerConstructors = {};
	var providerInstances = {};

	this.SUFFIX = 'Provider';

	this.$injector = DI.createInjector(providerInstances, function(key, caller) {
		return getProviderInstance(key, caller);
	});

	this.$register = function(name, providerConstructor) {
		providerConstructors[name + this.SUFFIX] = providerConstructor;
	};

	function getProviderInstance(name, caller) {
		return Q.fcall(function() {

			// Get provider instance from cache
			if( providerInstances.hasOwnProperty(name) ) {
				return providerInstances[name];

			// Get provider instance after instantiating it from constructor cache
			} else if( providerConstructors.hasOwnProperty(name) ) {

				return providerInstances[name] = that.$injector.instantiate( providerConstructors[name], {})
				.then(function(providerInstance) {
					return providerInstances[name] = providerInstance;
				});

			} else {
				return Promise.reject(
					new Error(('Provider \''+name+'\' not found!\n\n')+
						(caller	?
							('   ---> Called from:\n\t'+caller.toString().replace(/\t{1,}/g, '\t')+'\n\n') :
							''
						)
					)
				);
			}
		});
	}

}
