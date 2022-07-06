sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"./model/models",
	"sap/ui/model/json/JSONModel"
], function(UIComponent, Device, models, JSONModel) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.basicTemplate.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// create the views based on the url/hash
			this.getRouter().initialize();
			
			var oData = [];
			var oModel = new JSONModel(oData);
			this.setModel(oModel, "Table");
			
			var sUrl = window.location.hostname === 'lebovsky.site' ? 'http://lebovsky.site' : 'http://127.0.0.1'
			oModel.setProperty("/host", sUrl)

			
		}
	});
});