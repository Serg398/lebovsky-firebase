sap.ui.define([
	'./BaseController',
	'../module/Firebase',
	'sap/m/MessageToast',
	'sap/ui/core/BusyIndicator'
], function (BaseController, Firebase, MessageToast, BusyIndicator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.Profile", {

		onInit: function () {
			var oModel = this.getModel("Table");
			oModel.setProperty("/indicator", false);
			this.oRouter = this.getOwnerComponent().getRouter();
			Firebase.getGeneralUser.call(this);
			Firebase.getAllUsers.call(this);
		},

		cancelSetting: function () {
			this.oRouter.navTo("home");
		},

		saveSetting: function () {
			Firebase.getGeneralUser.call(this)
			this.oRouter.navTo("home");
		},

		uploadAvatar: async function () {
			var file = this.getView().getDomRef("-avatar");
			if (file.files[0] === undefined) {
				MessageToast.show("Вы не выбрали файл");
			} else {
					await Firebase.uploadAvatarFB.call(this, file);
					await Firebase.getGeneralUser.call(this);
			}
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
		}
	});
});