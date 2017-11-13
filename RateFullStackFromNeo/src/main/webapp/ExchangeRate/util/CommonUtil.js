var slCallResult;

sap.ui.define([
		"addon/Component"
	],
	function(Component) {
		var CONFIG_APITOKEN = "apiToken";
		var CONFIG_SERVICEURL = "serviceUrl";
		var CONFIG_COMPANYDB = "CompanyDB";

		//Connection via SAP Business One API Gateway
		var LOGIN_URL_SUFFIX = "/api_poc/api/b1s/v1/Login";
		var SL_URL_SUFFIX = "/api_poc/api/b1s/v1/Orders";

		return {
			busy: function(toShow) {
				var DELAY = 0;

				if (true === toShow) {
					sap.ui.core.BusyIndicator.show(DELAY);
				} else {
					sap.ui.core.BusyIndicator.hide();
				}
			},

			getAppConfig: function(configName) {
				var metaData = Component.getMetadata();
				var manifest = metaData.getManifest();

				return manifest["sap.app"][configName];
			},

			getCompanyDB: function() {
				return this.getAppConfig(CONFIG_COMPANYDB);
			},

			getApiToken: function() {
				return this.getAppConfig(CONFIG_APITOKEN);
			},

			getServerUrl: function() {
				return this.getAppConfig(CONFIG_SERVICEURL);
			},

			getLoginUrl: function() {
				return this.getServerUrl() + LOGIN_URL_SUFFIX;
			},

			getSLCallUrl: function() {
				return this.getServerUrl() + SL_URL_SUFFIX;
			},

			getSLCallResult: function() {
				return slCallResult;
			},

			setSLCallResult: function(result) {
				slCallResult = result;
			}
		};
	});