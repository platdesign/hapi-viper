'use strict';


var is = require('is');


module.exports = function(server, viper) {


	server.ext('onPreHandler', function(request, reply) {

		var $requestInjector = viper.createRequestInjector(request);

		$requestInjector.provide('$req', request);

		request.viper = $requestInjector;

		reply.continue();

	});





	return function(route, config) {

			if(is.fn(config)) {

				// config is only a controller function

				return function(req, reply) {

					return req.viper.invoke(config, {}, this)
					.then(reply, function(err) {

						if(err) {
							plugin.log(['error', 'viper-handler'], err);

							if(err.data && err.data.stack) {
								console.log('\n', err.data.message, err.data.stack);
							}

							if(err.stack && err.message) {
								console.log('\n', err.message, err.stack);
							}

							return Promise.reject(err);

						} else {
							plugin.log(['error', 'viper-handler', 'unknown']);
							return Promise.reject( Boom.badImplementation('Unkown error occured') );
						}


					})
					.catch(reply);

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
							console.error(err);
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

			};

	};

}
