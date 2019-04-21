const path = require('path');


module.exports = {
	devtool: 'source-map',
	entry: './src/app.js',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'script.js',
		publicPath: '/dist/'
	},
	devServer: {
		stats: 'errors-only'
	},
	module: {
		rules: [
			{
				test: /\.js/,
				use:[{
					loader: 'babel-loader', 
					options: { presets: "env"  }
				}]
			}
		]
	}
}