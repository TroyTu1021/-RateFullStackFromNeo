sap.ui.define([
		"sap/ui/demo/exchangerate/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"sap/ui/demo/exchangerate/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator) {
		"use strict";

		return BaseController.extend("sap.ui.demo.exchangerate.controller.ExchangeRate", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the exchangerate controller is instantiated.
			 * @public
			 */
			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oToday = this.byId("today"),
					oTable = this.byId("table");

				// Put down exchangerate table's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the table is
				// taken care of by the table itself.
				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				// keeps the search state
				this._aTableSearchState = [];

				// Model used to manipulate control states
				oViewModel = new JSONModel({
					exchangerateTableTitle : this.getResourceBundle().getText("exchangerateTableTitle"),
					saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("exchangerateViewTitle")),
					shareOnJamTitle: this.getResourceBundle().getText("exchangerateTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailExchangeRateSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailExchangeRateMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "exchangerateView");

				// Make sure, busy indication is showing immediately so there is no
				// break after the busy indication for loading the view's meta data is
				// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
				/*oTable.attachEventOnce("updateFinished", function(){
					// Restore original busy indicator delay for exchangerate's table
				    oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				    oViewModel.setProperty("/tableBusyDelay", false);
				});*/
				var now=new Date(); 
				var y=now.getFullYear(); 
				var m=now.getMonth()+1; 
				var d=now.getDate(); 
				m=m <10?"0"+m:m; 
				d=d <10?"0"+d:d; 
				var td=y+"-"+m+"-"+d;
				oToday.setText(td);

				this.preloadModel();

				 $.ajax({
				    type: 'GET'
				    , url: "/addon-exchange-rate/exchangeRates?systemExchangeRates=USD,GBP,ILS,CAD"
				    , success: function (result){
				   //  	alert(result);
				     	var x=new JSONModel(JSON.parse(result))
						oTable.setModel(x);
				    }
				    , error: function(msg){
				    	alert(msg);
				    }
				})
				
			},

			
			
			preloadModel : function (){
				var oTable = this.byId("table");
				var x = new JSONModel([{"CurrencyCode":"USD", "Name":"US dollar", "Rate":""},{"CurrencyCode":"GBP", "Name":"Pound Sterling", "Rate":""},
				 						{"CurrencyCode":"ILS", "Name":"Israeli shekel", "Rate":""},{"CurrencyCode":"CAD", "Name":"Canadian dollar", "Rate":""}]);
				oTable.setModel(x);

			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Triggered by the table's 'updateFinished' event: after new table
			 * data is available, this handler method updates the table counter.
			 * This should only happen if the update was successful, which is
			 * why this handler is attached to 'updateFinished' and not to the
			 * table's list binding's 'dataReceived' method.
			 * @param {sap.ui.base.Event} oEvent the update finished event
			 * @public
			 */
			onUpdateFinished : function (oEvent) {
				// update the exchangerate's object counter after the table update
				var sTitle,
					oTable = oEvent.getSource(),
					iTotalItems = oEvent.getParameter("total");
				// only update the counter if the length is final and
				// the table is not empty
				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("exchangerateTableTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getResourceBundle().getText("exchangerateTableTitle");
				}
				this.getModel("exchangerateView").setProperty("/exchangerateTableTitle", sTitle);
			},

			/**
			 * Event handler when a table item gets pressed
			 * @param {sap.ui.base.Event} oEvent the table selectionChange event
			 * @public
			 */
			onPress : function (oEvent) {
				// The source is the list item that got pressed
				this._showObject(oEvent.getSource());
			},



			/**
			 * Event handler when the share in JAM button has been clicked
			 * @public
			 */
			onShareInJamPress : function () {
				var oViewModel = this.getModel("exchangerateView"),
					oShareDialog = sap.ui.getCore().createComponent({
						name: "sap.collaboration.components.fiori.sharing.dialog",
						settings: {
							object:{
								id: location.href,
								share: oViewModel.getProperty("/shareOnJamTitle")
							}
						}
					});
				oShareDialog.open();
			},

			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
				} else {
					var aTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter("Name", FilterOperator.Contains, sQuery)];
					}
					this._applySearch(aTableSearchState);
				}

			},

			/**
			 * Event handler for refresh event. Keeps filter, sort
			 * and group settings and refreshes the list binding.
			 * @public
			 */
			onRefresh : function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Shows the selected item on the object page
			 * On phones a additional history entry is created
			 * @param {sap.m.ObjectListItem} oItem selected Item
			 * @private
			 */
			_showObject : function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("ObjectID")
				});
			},

			/**
			 * Internal helper method to apply both filter and search state together on the list binding
			 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
			 * @private
			 */
			_applySearch: function(aTableSearchState) {
				var oTable = this.byId("table"),
					oViewModel = this.getModel("exchangerateView");
				oTable.getBinding("items").filter(aTableSearchState, "Application");
				// changes the noDataText of the list in case there are no filter results
				/*if (aTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("exchangerateNoDataWithSearchText"));
				}*/
			},

			onCheckBoxChange : function () {
				var oCheckBox = this.byId("cCode");
				//alert(1)
				// for (var a in oCheckBox){
				// 	//alert (a)
				// }
			},

			onPressUpdate: function(oEvent){
				this.preloadModel();
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table"),
					arrow = this.byId("Arrow"),
					latestRateColumn = this.byId("LatestRateColumn");

				// Put down exchangerate table's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the table is
				// taken care of by the table itself.
				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				// keeps the search state
				this._aTableSearchState = [];

				// Model used to manipulate control states
				oViewModel = new JSONModel({
					exchangerateTableTitle : this.getResourceBundle().getText("exchangerateTableTitle"),
					saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("exchangerateViewTitle")),
					shareOnJamTitle: this.getResourceBundle().getText("exchangerateTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailExchangeRateSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailExchangeRateMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "exchangerateView");

				// Make sure, busy indication is showing immediately so there is no
				// break after the busy indication for loading the view's meta data is
				// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
				oTable.attachEventOnce("updateFinished", function(){
					// Restore original busy indicator delay for exchangerate's table
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});
				arrow.setVisible(false);
				latestRateColumn.setVisible(false);
				 $.ajax({
				    type: 'POST'
				    , url: "/addon-exchange-rate/exchangeRates"
				    , success: function (){
				    	$.ajax({
						    type: 'GET'
						    , url: "/addon-exchange-rate/exchangeRates?systemExchangeRates=USD,GBP,ILS,CAD"
						    , success: function (result){ 
						   //  	alert(result);
						     	var x=new JSONModel(JSON.parse(result))
								oTable.setModel(x);
								sap.m.MessageToast.show("Exchange rate had been updated.");
						    }
						    , error: function(msg){
						    	alert(msg);
						    }
						})
				    }
				    , error: function(msg){
				    	alert(msg);
				    }
				})
				
			},


			onPressCheck: function(){
				this.preloadModel();
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table"),
					arrow = this.byId("Arrow"),
					latestRateColumn = this.byId("LatestRateColumn");

				// Put down exchangerate table's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the table is
				// taken care of by the table itself.
				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				// keeps the search state
				this._aTableSearchState = [];

				// Model used to manipulate control states
				oViewModel = new JSONModel({
					exchangerateTableTitle : this.getResourceBundle().getText("exchangerateTableTitle"),
					saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("exchangerateViewTitle")),
					shareOnJamTitle: this.getResourceBundle().getText("exchangerateTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailExchangeRateSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailExchangeRateMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "exchangerateView");

				// Make sure, busy indication is showing immediately so there is no
				// break after the busy indication for loading the view's meta data is
				// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
				/*oTable.attachEventOnce("updateFinished", function(){
					// Restore original busy indicator delay for exchangerate's table
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});*/
				arrow.setVisible(true);
				latestRateColumn.setVisible(true);
				$.ajax({
				    type: 'GET'
				    , url: "/addon-exchange-rate/exchangeRates?lastestExchangeRates=USD,GBP,ILS,CAD"
				    , success: function (result){
				     	var x=new JSONModel(JSON.parse(result))
						oTable.setModel(x);
				    }
				    , error: function(msg){
				    	alert(msg);
				    }
				})
				
			}
		});
	}
);