sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageBox',
	"addon/util/AjaxHelper",
	"addon/util/CommonUtil",
	"addon/util/ServiceLayer"
], function(
	Controller,
	JSONModel,
	MessageBox,
	AjaxHelper,
	CommonUtil,
	ServiceLayer
) {
	"use strict";

	return Controller.extend("addon.controller.Login", {

		onInit: function() {
			var dataModel = new JSONModel({});
			this.getView().setModel(dataModel, "data");
		},

		onLogin: function() {
			CommonUtil.busy(true);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			var model = this.getView().getModel("data");
			var modelData = model.getData();

			ServiceLayer.login(modelData.companyDB, modelData.userName, modelData.password)
				.then(function(success) {
					if (success) {
						oRouter.navTo("rate");
					}
				});

			CommonUtil.busy(false);
		}
	});
});