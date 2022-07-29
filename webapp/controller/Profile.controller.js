sap.ui.define([
	'./BaseController',
	'../module/Firebase',
	'sap/m/MessageToast',
	'sap/ui/core/BusyIndicator',
	"sap/m/MessageBox",
], function (BaseController, Firebase, MessageToast, BusyIndicator, MessageBox) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.Profile", {

		onInit: function () {
			var oModel = this.getModel("Table");
			oModel.setProperty("/indicator", false);
			this.oRouter = this.getOwnerComponent().getRouter();
			Firebase.getGeneralUser.call(this);
			Firebase.getAllUsers.call(this);
			Firebase.getAllClasterFB.call(this);
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
		},

		newClaster: async function () {
			this.showBusyIndicator()
			var newClaster = this.getView().byId("newClasterid"),
				sClaster = newClaster.getValue();
			if (sClaster != "") {
				await Firebase.newClasterFB(sClaster)
				await Firebase.getAllClasterFB.call(this);

			} else {
				this.hideBusyIndicator()
				MessageToast.show("Нельзя оставлять поле пустым");
			}
			this.hideBusyIndicator()
		},

		deleteClaster: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("Table").sPath.substr(-1);
			var oModel = this.getModel("Table");
			var oClaster = oModel.getProperty("/mainClasters")[oContext].name;
			MessageBox.warning("Внимание! Вы пытаетесь удалить кластер. Вы уверены?", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: async function (sAction) {
					if (sAction === "OK") {
						Firebase.deleteClasterFB(oClaster)
					}
				}.bind(this)
			})
		}
	});
});