sap.ui.define([
	'./BaseController',
	'../module/Firebase',
	'sap/m/MessageToast',
	'sap/ui/core/BusyIndicator'
], function (BaseController, Firebase, MessageToast, BusyIndicator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.Profile", {

		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.getGeneralUser();
		},

		cancelSetting: function () {
			this.oRouter.navTo("home");
		},

		saveSetting: function () {
			this.getGeneralUser();
			this.oRouter.navTo("home");
		},

		uploadAvatar: async function () {
			this.showBusyIndicator();
			var file = this.getView().getDomRef("-avatar");
			if (file.files[0] === undefined) {
				MessageToast.show("Вы не выбрали файл");
			} else {
					Firebase.uploadAvatarFB(file)
					this.getGeneralUser();
					this.hideBusyIndicator();
			}

		},

		getGeneralUser: async function () {
			var oModel = this.getModel("Table");
			Firebase.checkAutorisation().onAuthStateChanged((user) => {
				if (user) {
					Firebase.getDocument("users", user.email).then((doc) => {
						oModel.setProperty("/generaluser", doc.data())
					})
				} else {
					this.oRouter.navTo("auth");
				}
			});
		},

		hideBusyIndicator: function () {
			BusyIndicator.hide();
		},

		showBusyIndicator: function (iDuration, iDelay) {
			BusyIndicator.show(iDelay);

			if (iDuration && iDuration > 0) {
				if (this._sTimeoutId) {
					clearTimeout(this._sTimeoutId);
					this._sTimeoutId = null;
				}

				this._sTimeoutId = setTimeout(function () {
					this.hideBusyIndicator();
				}.bind(this), iDuration);
			}
		},
	});
});