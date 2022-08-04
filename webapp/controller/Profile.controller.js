sap.ui.define([
	'./BaseController',
	'../module/Firebase',
	'sap/m/MessageToast',
	'sap/ui/core/BusyIndicator',
	"sap/m/MessageBox",
	'sap/ui/core/Fragment',
], function (BaseController, Firebase, MessageToast, BusyIndicator, MessageBox, Fragment) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.Profile", {

		onInit: function () {
			var oModel = this.getModel("Table");
			oModel.setProperty("/indicator", false);
			oModel.setProperty("/newclaster", []);
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

		deleteClaster: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("Table").sPath.substr(-1);
			var oModel = this.getModel("Table");
			var oClaster = oModel.getProperty("/mainClasters")[oContext].name;
			MessageBox.warning("Внимание! Вы пытаетесь удалить кластер. Вы уверены?", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: async function (sAction) {
					if (sAction === "OK") {
						Firebase.deleteClasterFB(oClaster);
					}
				}.bind(this)
			})
		},

		openFragment: function () {
			if (!this.pDialog) {
				this.pDialog = Fragment.load({
					name: "sap.ui.demo.basicTemplate.view.AddNewClaster",
					controller: this
				}).then(function (oDialog) {
					this.getView().addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			this.pDialog.then(function (oDialog) {
				oDialog.open();
			});
		},

		addClaster: async function() {
			var oModel = this.getModel("Table");
			var oClaster = oModel.getProperty("/newclaster");
			var nameClaster = oClaster.nameClaster
			var dateClaster = oClaster.DP
			if (nameClaster != "" && nameClaster != undefined && dateClaster != undefined) {
				await Firebase.newClasterFB(nameClaster, dateClaster);
				await Firebase.getAllClasterFB.call(this);
				this.pDialog.then(function (oDialog) {
					oDialog.close();
					oDialog.destroy();
					this.pDialog = null;
				}.bind(this));
				oModel.setProperty('/newclaster', [])
			} else {
				this.hideBusyIndicator();
				MessageToast.show("Нельзя оставлять поля пустыми");
			}
		},

		pressClaster: function(oEvent) {
			var oContext = oEvent.getSource().getBindingContext("Table").sPath.substr(-1);
			var oModel = this.getModel("Table");
			var sClaster = oModel.getProperty("/mainClasters")[oContext].name;
			oModel.setProperty("/etitClaster", sClaster);
			Firebase.editClaster.call(this);
			if (!this.pDialog) {
				this.pDialog = Fragment.load({
					name: "sap.ui.demo.basicTemplate.view.UserListClaster",
					controller: this
				}).then(function (oDialog) {
					this.getView().addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			this.pDialog.then(function (oDialog) {
				oDialog.open();
			});
		},

		onCloseDialogClaster: function () {
			var oModel = this.getModel("Table");
			oModel.setProperty("/etitClaster", []);
			this.pDialog.then(function (oDialog) {
				oDialog.close();
				oDialog.destroy();
				this.pDialog = null;
			}.bind(this));
		},

		openAddUserClaster: function () {
			if (!this.userDialog) {
				this.userDialog = Fragment.load({
					name: "sap.ui.demo.basicTemplate.view.AddUserClaster",
					controller: this
				}).then(function (useroDialog) {
					this.getView().addDependent(useroDialog);
					return useroDialog;
				}.bind(this));
			}
			this.userDialog.then(function (useroDialog) {
				useroDialog.open();
			});
		},

		newAddUserClaster: function () {
			Firebase.newUserClasterFB.call(this);
			this.userDialog.then(function (useroDialog) {
				useroDialog.close();
				useroDialog.destroy();
				this.userDialog = null;
			}.bind(this));
		},

		deleteUserClaster: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("Table").sPath.substr(-1);
			var oModel = this.getModel("Table");
			var userEmail = oModel.getProperty("/userListClaster")[oContext].email;
			MessageBox.warning("Внимание! Вы пытаетесь удалить пользователя из группы. Вы уверены?", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: async function (sAction) {
					if (sAction === "OK") {
						Firebase.deleteUserClasterFB.call(this, userEmail)
					}
				}.bind(this)
			})
		},

		onCloseDialogUserClaster: function() {
			this.userDialog.then(function (useroDialog) {
				useroDialog.close();
				useroDialog.destroy();
				this.userDialog = null;
			}.bind(this));
		}
	});
});