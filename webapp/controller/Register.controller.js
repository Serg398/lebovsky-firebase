sap.ui.define([
	'./BaseController',
	'sap/m/MessageToast',
	"../module/Firebase"
], function (BaseController, MessageToast, Firebase) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.Register", {

		onInit: function () {
			var oModel = this.getModel("Table");
			oModel.setProperty("/register", {})
			this.oRouter = this.getOwnerComponent().getRouter();
		},

		addUser: function () {
			var oModel = this.getModel("Table");
			var oFormRegister = oModel.getProperty("/register")
			Firebase.register(oFormRegister.email, oFormRegister.pass).then((userCredential) => {
				var email = userCredential.user.email
				if (email != ""){
					Firebase.addNewUser(email, oFormRegister)
					this.oRouter.navTo("auth");
				}
			}).catch((error) => {
				MessageToast.show(error.message)
				});
		}
	});
});