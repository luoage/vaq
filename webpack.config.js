var path = require('path');

module.exports = {
	entry: './example/webpack/test.js',
	output: {
		filename: 'test.bundle.js',
		path: path.resolve(__dirname, './example/webpack/')
	}
};
