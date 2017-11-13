jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Orders in the list

sap.ui.require([
	"sap/ui/test/Opa5",
	"addon/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"addon/test/integration/pages/App",
	"addon/test/integration/pages/Browser",
	"addon/test/integration/pages/Master",
	"addon/test/integration/pages/Detail",
	"addon/test/integration/pages/NotFound"
], function(Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "addon.view."
	});

	sap.ui.require([
		"addon/test/integration/MasterJourney",
		"addon/test/integration/NavigationJourney",
		"addon/test/integration/NotFoundJourney",
		"addon/test/integration/BusyJourney",
		"addon/test/integration/FLPIntegrationJourney"
	], function() {
		QUnit.start();
	});
});