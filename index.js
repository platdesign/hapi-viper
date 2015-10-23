'use strict';

// Deps
var DI = require('./lib/DI');

/**
 * Plugin module: viper
 *
 */
module.exports = function register(plugin, options, next) {

	var viper = new Viper();

	viper.value('$server', plugin);


	plugin.handler('viper', function(route, config) {


		// TODO: check if config is object or function
		var controller = config;

		return function(req, reply) {

			return viper.invoke(controller, { $req: req }, this)
			.then(reply, function(err) {
				console.log(err);
				reply('Error');
			});

		};

	});



	plugin.plugins.viper = viper;

	// finish plugin configuration
	next();

};


// Set plugin attributes
module.exports.attributes = {
	name: 'viper'
};









function Viper() {

	var di = DI();

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
	}

}


















