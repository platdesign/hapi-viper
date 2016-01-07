'use strict';



var Hapi = require('hapi');
var HapiViper = require('../');



var server = new Hapi.Server();

server.connection({
	port: 4000
})





server.register(HapiViper, function(err) {



	server.viper.provider('Account', function() {

		console.log('instantiated AccountProvider')

		var provider = this;

		this.config = {
			time: Date.now()
		};

		this.$get = function() {

			console.log('instantiated AccountService')

			var service = {
				config: provider.config,
				time: Date.now()
			};

			return service;

		};

	});



	server.viper.factory('Profile', function(Account) {
		console.log('instantiated ProfileService')

		return {
			name: Date.now(),
			Account: Account
		};
	});



	server.viper.get('AccountProvider').then(function(AccountProvider) {

		AccountProvider.config.test = 123;

	});





	server.route({
		method: 'GET',
		path: '/',
		handler: {
			viper: function(Profile) {
				return Profile;
			}
		}
	});


	server.start(function(err) {

	});
});
