/* Magic Mirror
 * Node Helper: Newsfeed
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var tumblr = require("tumblr.js");

var QuoteFetcher = function(url, reloadInterval, ckey, csecret, token, tsecret) {
	var self = this;

	if (reloadInterval < 1000) {
		reloadInterval = 1000;
	}

	var reloadTimer = null;
	var events = [];
	var offset = 0;

	var fetchFailedCallback = function() {};
	var eventsReceivedCallback = function() {};

	/* fetchQuotes()
	 * Initiates quote fetch.
	 */
	var fetchQuotes = function(ckey, csecret, token, tsecret) {

		clearTimeout(reloadTimer);
		reloadTimer = null;

		var client = tumblr.createClient({
			consumer_key: ckey,
			consumer_secret: csecret,
			token: token,
			token_secret: tsecret
		});

		var quotes;
		var newEvents = [];

		client.posts("overheardathq.tumblr.com", {type: "quote", limit: 1, offset: offset}, function(err, data) {
			if (err) {
				fetchFailedCallback(self, err);
				scheduleTimer();
				return;
			}

			if (data) {
				newEvents.push({
					quotes: data.posts[0].text,
					source: data.posts[0].source ? data.posts[0].source : data.posts[0].blog_name
				});
			}

			events = newEvents;
			offset++;
			self.broadcastEvents();
			scheduleTimer();
		});
	};

	/* scheduleTimer()
	 * Schedule the timer for the next update.
	 */
	var scheduleTimer = function() {
		clearTimeout(reloadTimer);
		reloadTimer = setTimeout(function() {
			fetchQuotes(ckey, csecret, token, tsecret);
		}, reloadInterval);
	};

	/* public methods */

	this.setReloadInterval = function(interval) {
		if (interval > 1000 && interval < reloadInterval) {
			reloadInterval = interval;
		}
	};

	/* startFetch()
	 * Initiate fetchCalendar();
	 */
	this.startFetch = function() {
		fetchQuotes(ckey, csecret, token, tsecret);
	};

	/* broadcastItems()
	 * Broadcast the exsisting events.
	 */
	this.broadcastEvents = function() {
		eventsReceivedCallback(self);
	};

	/* onReceive(callback)
	 * Sets the on success callback
	 *
	 * argument callback function - The on success callback.
	 */
	this.onReceive = function(callback) {
		eventsReceivedCallback = callback;
	};

	/* onError(callback)
	 * Sets the on error callback
	 *
	 * argument callback function - The on error callback.
	 */
	this.onError = function(callback) {
		fetchFailedCallback = callback;
	};

	/* url()
	 * Returns the url of this fetcher.
	 *
	 * return string - The url of this fetcher.
	 */
	this.url = function() {
		return url;
	};

	/* events()
	 * Returns current available events for this fetcher.
	 *
	 * return array - The current available events for this fetcher.
	 */
	this.events = function() {
		return events;
	};

};

module.exports = NodeHelper.create({
	// Subclass start method.
	start: function() {
		this.fetchers = [];
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "GET_QUOTES") {
			this.createFetcher(payload.url, payload.reloadInterval, payload.ckey, payload.csecret, payload.token, payload.tsecret);
		}
	},

	/* createFetcher(url, reloadInterval)
	 * Creates a fetcher for a new url if it doesn't exsist yet.
	 * Otherwise it reoses the exsisting one.
	 *
	 * attribute url string - URL of the news feed.
	 * attribute reloadInterval number - Reload interval in milliseconds.
	 */

	createFetcher: function(url, reloadInterval, ckey, csecret, token, tsecret) {
		var self = this;

		var fetcher;
		if (typeof self.fetchers[url] === "undefined") {
			fetcher = new QuoteFetcher(url, reloadInterval, ckey, csecret, token, tsecret);

			fetcher.onReceive(function(fetcher) {
				self.sendSocketNotification("FETCHED_QUOTES", {
					quotes: fetcher.events()[0]
				});
			});

			fetcher.onError(function(fetcher, err) {
				self.sendSocketNotification("FETCH_ERROR", {
					url: fetcher.url(),
					error: err
				});
			});

			self.fetchers[url] = fetcher;
		} else {
			fetcher = self.fetchers[url];
			fetcher.setReloadInterval(reloadInterval);
			fetcher.broadcastEvents();
		}

		fetcher.startFetch();
	}
});
