//Global variable for Service Layer Call result
var gSLCallResult;

sap.ui.define([
		"addon/Component",
		"sap/ui/model/json/JSONModel",
		'sap/m/MessageBox',
		"addon/util/CommonUtil",
		"addon/util/AjaxHelper"
	],
	function(Component, JSONModel, MessageBox, CommonUtil, AjaxHelper) {
		//Connection via SAP Business One API Gateway
		var LOGIN_URL_SUFFIX = "/api_poc/api/b1s/v1/Login";
		var SL_URL_SUFFIX = "/api_poc/api/b1s/v1/Orders";

		//Fields of Sales Order to be return in the Service Layer call.
		//Performance tip: Limit the only required fields in the OData
		var lFields = [];

		return {
			getLoginUrl: function() {
				return CommonUtil.getServerUrl() + LOGIN_URL_SUFFIX;
			},

			initSelectedFields: function() {
				lFields.push("DocEntry");

				lFields.push("CardName");

			},

			//Build up the $select=... string of the OData query option for S.L. call
			selectFileds: function(fields) {
				if (typeof(fields) === 'undefined' || Array.isArray(fields) === false || fields.length === 0) {
					return '';
				}

				var selectStr = '?$select=';
				var len = fields.length;
				for (var i = 0; i < len; i++) {
					if (i === 0) {
						selectStr += fields[i];
					} else {
						selectStr += ',' + fields[i];
					}
				}
				return selectStr;
			},

			getSLCallUrl: function() {
				this.initSelectedFields();
				return CommonUtil.getServerUrl() + SL_URL_SUFFIX + this.selectFileds(lFields);
			},

			getSLCallResult: function() {
				return gSLCallResult;
			},

			setSLCallResult: function(result) {
				gSLCallResult = result;
			},

			login: function(companyDB, userName, password) {
				CommonUtil.busy(true);
				var loginUrl = this.getLoginUrl();

				var connInfo = {};
				connInfo.CompanyDB = companyDB;
				connInfo.UserName = userName;
				connInfo.Password = password;

				var success = false;
				return new Promise(function(resolve, reject) {
					AjaxHelper.post(loginUrl, connInfo).then(function() {
						success = true;
						console.log('Login successfully');
						resolve(success);
					}).fail(function(xhr, status, error) {
						MessageBox.information("Log in failed.Please try again.\nError: " + error);
						reject(success);
					}).always(function() {
						CommonUtil.busy(false);
					});
				});
			},

			callSL: function(slCallUrl) {
			//	CommonUtil.busy(true);
				return new Promise(function(resolve, reject) {
				//	if (typeof gSLCallResult === 'undefined') {
						AjaxHelper.get(slCallUrl, {}).then(function(data) {
								var dataModel = {
									value: data.value
								};

								gSLCallResult = dataModel;
								resolve(dataModel);
							})
							.fail(function(xhr, status, error) {
								MessageBox.information("Service call failure.\n" + error);
								reject(false);
							})
							.always(function() {
								CommonUtil.busy(false);
							});
				//	} else {
				//		resolve(gSLCallResult);
				//	}
				});
			},
			
			callSLbyPost: function(slCallUrl,para) {
			//	CommonUtil.busy(true);
				//var para = {"Currency": "EUR","Date": "20171107"};
				
				return new Promise(function(resolve, reject) {
				//	if (typeof gSLCallResult === 'undefined') {
						AjaxHelper.post(slCallUrl, para).then(function(data) {
								var dataModel = {
									value: data
								};

								gSLCallResult = dataModel;
								resolve(dataModel);
							})
							.fail(function(xhr, status, error) {
								MessageBox.information("Service call failure.\n" + error);
								reject(false);
							})
							.always(function() {
								CommonUtil.busy(false);
							});
				//	} else {
				//		resolve(gSLCallResult);
				//	}
				});
			},

			callSL_bindView: function(oView) {
				this.callSL(this.getSLCallUrl()).then(function(slResult) {
					if (slResult !== false) {
						var model = new JSONModel(slResult);
						oView.setModel(model, "data");
					}
				});
			}
		};
	});