sap.ui.define([
	"addon/util/CommonUtil"
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

		_request: function(url, data, method) {

			var that = this;
			var token = CommonUtil.getApiToken();
			var ajaxCall = $.ajax(url, {
				headers: {
					"X-Tenant-ID": "1",
					"SCP-Virtual-Host-Token": token
				},
				method: method,
				data: data,
				contentType: "application/json",
				xhrFields: {
					withCredentials: true
				},
				crossDomain: true
			}).fail(function(err) {
				that._errorHandler(err, this.url, true);
			});

			return ajaxCall;
		}
	};
});