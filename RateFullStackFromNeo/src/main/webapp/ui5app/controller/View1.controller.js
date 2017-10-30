sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("QuickStartExchangeRate.controller.View1", {

	onPressCheck: function(){
		//alert("onPressCheck");
		var thispage = this;
		var url = "/exchangeRates?lastestExchangeRates=USD,GBP,ILS,CAD";
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
	}
	});

});