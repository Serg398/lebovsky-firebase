sap.ui.define([
	'./BaseController',
	"sap/ui/core/mvc/Controller",
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.Profile", {

		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			var oModel = this.getModel("Table");
			
		},

		cancelSetting: function () {
			this.oRouter.navTo("home")
		},

		// handleUploadPress: function () {
		// 	var oModel = this.getModel("Table");
		// 	var sHost = oModel.getProperty('/host');

		// 	var oFileUploader = this.byId("fileUploader");
		// 	var domRef = oFileUploader.getFocusDomRef();
		// 	var file = domRef.files[0];

		// 	var response = fetch(sHost + ':5000/api/upload', {
		// 		credentials: 'include',
		// 		method: 'POST',
		// 		body: file,
		// 		headers: {
		// 			'Access-Control-Allow-Origin': sHost,
		// 			'Content-Type': 'image/png'
		// 		}
		// 	});
		// 	if (response.ok) {
		// 		this.restUpdateList();
		// 		return response.status;
		// 	} else {
		// 		alert('error', response.status);
		// 	}
		// }
	});
});