# MMM-TumblrQuotes
A magic mirror module that displays quote posts pulled from a tumblr blog https://github.com/MichMich/MagicMirror/tree/v2-beta

# Using this Module

Put this in the `config/config.js` file

````javascript
modules: [
    {
		module: 'tumblrqotd',
		position: 'bottom',
		config: {
			reloadInterval: 5000, // In milliseconds
			consumerKey: YOUR_CONSUMER_KEY,
			consumerSecret: YOUR_CONSUMER_SECRET,
			token: YOUR_TOKEN,
			tokenSecret: YOUR_TOKEN_SECRET,
		}
	},
]
````

## Tumblr API

