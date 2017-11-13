jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"addon/test/integration/NavigationJourneyPhone",
		"addon/test/integration/NotFoundJourneyPhone",
		"addon/test/integration/BusyJourneyPhone"
	], function() {
		QUnit.start();
	});
});