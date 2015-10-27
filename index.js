'use strict';

// Deps
var DI = require('./lib/DI');
var is = require('is');

var noop = function() {};

/**
 * Plugin module: viper
 *
 */
module.exports = function register(plugin, options, next) {

	var viper = new Viper();

	viper.value('$server', plugin);


	plugin.handler('viper', function(route, config) {


		if(is.fn(config)) {

			// config is only a controller function

			return function(req, reply) {

				return viper.invoke(config, { $req: req }, this)
				.then(reply, function(err) {
					console.log(err);
					reply('Error');
				});

			};

		} else if( is.object(config) ) {

			// config is an object

			return function(req, reply) {

				var promise = Promise.resolve({});

				if(config.controller) {
					promise = promise.then(function(){
						return viper.invoke(config.controller, { $req: req }, this);
					}.bind(this));
				}

				if(config.template) {

					promise = promise.then(function($scope) {
						return reply.view(config.template, $scope);
					}, function(err) {
						return reply.view(config.errorTemplate || config.template, { $error:err });
					});

				} else {
					promise = promise.then(reply, reply);
				}

				promise.catch(function(err) {
					plugin.log(['error'], err.toString()+'\n'+err.stack);
					reply(err);
				});
			};

		}


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


















