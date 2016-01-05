'use strict';



var Hapi = require('hapi');
var HapiViper = require('../');



var server = new Hapi.Server();

server.connection({
	port: 4000
})





server.register(HapiViper, function(err) {

	server.viper.factory('$users', function() {
		console.log('created users');
		return [];

	});


	server.viper.requestFactory('$user', function($req, $users) {
		console.log('created')
		return {
			user: 'plati'
		};

	});

	server.route({
		method: 'GET',
		path: '/{userId}',
		handler: {
			viper: function($user, $query, $params) {
				return {
					user: $user,
					query: $query,
					params: $params
				};
			}
		}
	});


	server.start(function(err) {
		console.log(err);
	});
});
