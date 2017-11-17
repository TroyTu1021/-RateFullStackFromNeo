sap.ui.define([
	"QuickStartExchangeRate/util/CommonUtil"
], function(CommonUtil) {
	return {
		_errorHandler: function(err, url) {
			console.log(err.statusCode().statusText + ":" + url);
		},

		get: function(url, urlParam) {
			return this._request(url, null, "GET");
		},

		post: function(url, data) {
			return this._request(url, data && JSON.stringify(data), "POST");
		},
		postsimple: function(url, data) {
			return this._request_simple(url, data && JSON.stringify(data), "POST");
		},

		_request: function(url, data, method) {

			var that = this;
			var token = CommonUtil.getApiToken();
			var ajaxCall = $.ajax(url, {
				headers: {
					"X-Tenant-ID": "1",
					//"Access-Control-Request-Method":"OPTIONS",
					"SCP-Virtual-Host-Token": token
					//"Content-Type": "text/plain; charset=utf-8"
				},
				method: method,
				data: data,
				//contentType: "application/json",
				xhrFields: {
					withCredentials: true
				},
				crossDomain: true
			}).fail(function(err) {
				that._errorHandler(err, this.url, true);
			});

			return ajaxCall;
		},
		
				_request_simple: function(url, data, method) {

			var that = this;
			var token = CommonUtil.getApiToken();
			var ajaxCall = $.ajax(url, {
				method: method,
				data: data.toString(),
				contentType: "text/plain",
				xhrFields: {
					withCredentials: false
				},
				crossDomain: true
			}).fail(function(err) {
				that._errorHandler(err, this.url, true);
			});

			return ajaxCall;
		}
	};
});