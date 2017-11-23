sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"QuickStartExchangeRate/util/ServiceLayer"
], function(Controller,	ServiceLayer) {
	"use strict";

	return Controller.extend("QuickStartExchangeRate.controller.View1", {

	onPressCheck: function(){
		//alert("onPressCheck");
		var thispage = this;
		var url = "/exchangeRates?lastestExchangeRates=USD,GBP,ILS,CAD";
		//var url = "https://addonexchangeratei343470trial.hanatrial.ondemand.com/addon-exchange-rate/exchangeRates?lastestExchangeRates=USD,GBP,ILS,CAD";
				 $.ajax({
					 type: 'GET'
				    , url: url
				    , success: function (result){
						//alert (JSON.stringify(result));
						
						//var jsonobj = eval( "(" + result + ")" );//resultString to JsonObj
						//value = jsonobj.value;
						
						//var oModel = new sap.ui.model.json.JSONModel();
						//oModel.setData({ modelData: value });			
						//sap.ui.getCore().setModel(oModel);
						//oTable.setModel(oModel);
						
						var value = JSON.parse(result);
						//var value = json.value;						

						//alert (JSON.stringify(value));
						//var x=new JSONModel(value);
				
						
						
						//var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", value));
						//this.getView().setModel(oModel);
						
						var j = 1;
						var len = value.length;
						var input;
						var text;
						for(var i =0;i<len;i++)
						{
							//var xx = value[i];
							input = value[i].CurrencyCode;
							//alert(input);
							text = thispage.byId(j.toString());
							j++;
							text.setText(input);
							input = value[i].Name;
							text = thispage.byId(j.toString());
							j++;
							text.setText(input);
							input = value[i].latestExchangeRate;
							text = thispage.byId(j.toString());
							j++;
							text.setText(input);
						}
						
						 sap.m.MessageToast.show("BindOdata.");
			
						},
					"error": function(XMLHttpRequest, textStatus, errorThrown) {
					}
				});
	},
		GetSLDirect:function(){
			var thispage = this;
			var text;
			for(var index=1;index<=12;index++)
			{
				text = thispage.byId(index.toString());
				text.setText("");
			}
			
			//var url = "https://localhost:8443/OdataProxy/OdataServlet/SBOBobService_GetCurrencyRate";
			var url = "https://10.58.8.54:8888/OdataProxy/OdataServlet/SBOBobService_GetCurrencyRate";
			//var url = "https://slcdemo.cfapps.sap.hana.ondemand.com/api_poc/api/b1s/v1/SBOBobService_GetCurrencyRate";
			//var slurl = "https://slcdemo.cfapps.sap.hana.ondemand.com/api_poc/api/b1s/v1/Login";
			//var Currencys= "EUR";
    	//"Date": "20171107"
			var Currencys = new Array();
			Currencys[0] = "EUR";
			Currencys[1] = "CAN";
			//Currencys[0] = "USD";
			Currencys[2] = "GBP";
			Currencys[3] = "ILS";
			//Currencys[3] = "CAD";
			var date = "20171107";
			var j=1;
			var x;
		//	var para;
		
			for(x in Currencys)
			{	//alert(Currencys[x]);
				var para1 = {"Currency": Currencys[x],"Date": date};
				text = thispage.byId(j.toString());
				text.setText(Currencys[x]);
				j++;
				text = thispage.byId(j.toString());
				text.setText(Currencys[x]);
				j++;
				//text = thispage.byId(j.toString());
				//text.setText(getRate(url,para));
				//j++;
				//var slResult = ServiceLayer.callSLbyPost(url,para);
				//alert(slResult.value);
				ServiceLayer.callSLbyPost(url,para1).then((function(jIndex) {
						return function(slResult) {
							if (slResult !== false) {
								//alert( slResult.value);
								text = thispage.byId(jIndex.toString());
								text.setText(slResult.value);
							}
						};
					})(j));
					j++;
			}
	}
	});

});