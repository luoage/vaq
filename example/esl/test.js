define(function(require) {
	require('../../suggest');

	var observe = require('../../observe');

	observe.subscribe('set-suggest-input-value', function(name, element) {
		var data = $(element).data();

		document.getElementById('desc').innerHTML = JSON.stringify(data);
	});

});
