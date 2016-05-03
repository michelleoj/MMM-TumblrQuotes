/* global Module */

Module.register("tumblrqotd", {

	defaults: {
		text: "Hello Tumblr!",
		endpoint: "/v2/user/dashboard",
		reloadInterval: 5 * 1000,
		updateInterval: 5000,
		fadeSpeed: 1000,
		type: "quote",
		quotes: {
			quotes: "Welcome to Flavortown!",
			source: "- Guy Fieri"
		}
	},

	start: function() {
		Log.info("Starting module: "  + this.name);
		this.getQuotes();
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "FETCHED_QUOTES") {
			this.config.quotes = payload.quotes;
			this.updateDom(this.config.fadeSpeed);
		}
	},

	getQuotes: function() {
		this.sendSocketNotification("GET_QUOTES", {
			url: "api.tumblr.com",
			reloadInterval: this.config.reloadInterval,
			ckey: this.config.consumerKey,
			csecret: this.config.consumerSecret,
			token: this.config.token,
			tsecret: this.config.tokenSecret
		});
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		var quote = document.createElement("div");
		quote.className = "bright medium light";
		var source = document.createElement("div");
		source.className = "small light";
		quote.innerHTML = this.config.quotes.quotes;
		wrapper.appendChild(quote);
		source.innerHTML = "- " + this.config.quotes.source;
		wrapper.appendChild(source);
		return wrapper;
	}

});
