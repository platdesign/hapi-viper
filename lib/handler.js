'use strict';


var is = require('is');
var Boom = require('boom');


module.exports = function(server, viper) {


	server.ext('onPreAuth', function(request, reply) {

		request.viper = viper._createRequestInstance();
		request.viper.value('$req', request);

		reply.continue();

	});


	server.ext('onPreHandler', function(request, reply) {

		request.viper.value('$payload', request.payload);
		request.viper.value('$query', request.query);
		request.viper.value('$params', request.params);

		reply.continue();

	});


	return function(route, config) {

			if(is.fn(config)) {

				// config is only a controller function

				return function(req, reply) {

					return req.viper.invoke(config, {}, this)
					.then(reply, function(err) {

						if(err) {
							//server.log(['error', 'viper-handler'], err);

							if(err.isBoom) {
								return Promise.reject(err);
							}

							// if(err.data && err.data.stack) {
							// 	console.log('\n', err.data.message, err.data.stack);
							// }

							// if(err.stack && err.message) {
							// 	console.log('\n', err.message, err.stack);
							// }

							//return Promise.reject(err);

						}


						//server.log(['error', 'viper-handler', 'unknown']);
						return Promise.reject( Boom.badImplementation('Unkown error occured', err) );



					})
					.catch(reply);

				};

			} else if( is.object(config) ) {

				// config is an object

				return function(req, reply) {

					var promise = Promise.resolve({});

					if(config.controller) {
						promise = promise.then(function(){
							return req.viper.invoke(config.controller, { $req: req }, this);
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
						server.log(['error'], err.toString()+'\n'+err.stack);
						reply(err);
					});
				};

			};

	};

}
