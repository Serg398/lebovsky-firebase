sap.ui.define([
	'./BaseController',
	'sap/ui/core/Fragment',
	'sap/m/MessageToast',
	'sap/ui/core/BusyIndicator',
	"sap/m/MessageBox",
	"../module/Firebase",
	"sap/ui/Device"
], function (BaseController, Fragment, MessageToast, BusyIndicator, MessageBox, Firebase, Device) {
	"use strict";


	return BaseController.extend("sap.ui.demo.basicTemplate.controller.Home", {

		onInit: function () {
			var oModel = this.getModel("Table");
			oModel.setProperty("/new", {});
			this.oRouter = this.getOwnerComponent().getRouter();
			Firebase.getGeneralUser.call(this)
			Firebase.getAllUsers.call(this)
			Firebase.getEvents.call(this)
		},

		addEvent: async function () {
			this.showBusyIndicator()
			var oModel = this.getModel("Table");
			var oNewItem = oModel.getProperty("/new");
			var oTempItem = oModel.getProperty("/tempitem");
			if (oNewItem.id == undefined) {
				if (oNewItem.DP === undefined ||
					oNewItem.money === undefined ||
					oNewItem.email1 === undefined ||
					oNewItem.email2 === undefined) {
					MessageToast.show("Заполните все поля");
				} else {
					await Firebase.addNewEvent(oNewItem)
					await Firebase.getEvents.call(this)
					await Firebase.getAllUsers.call(this)
					await Firebase.getGeneralUser.call(this)
					console.log(oNewItem)
					oModel.setProperty("/new", {});
					oModel.setProperty("/tempitem", {});
					this.pDialog.then(function (oDialog) {
						oDialog.close();
						oDialog.destroy();
						this.pDialog = null;
					}.bind(this))

				};
			} else {
				var oModel = this.getModel("Table");
				var oTempItem = oModel.getProperty("/tempitem");
				var oNewItem = oModel.getProperty("/new");
				if (oNewItem.name1 ===
					oTempItem.name1 &&
					oNewItem.name2 ===
					oTempItem.name2) {
					oNewItem.oldmoney = oTempItem.money
					await Firebase.editEvent(oNewItem)
					await Firebase.getEvents.call(this)
					await Firebase.getAllUsers.call(this)
					await Firebase.getGeneralUser.call(this)
					oModel.setProperty("/new", {});
					oModel.setProperty("/tempitem", {});
					this.pDialog.then(function (oDialog) {
						oDialog.close();
						oDialog.destroy();
						this.pDialog = null;
					}.bind(this));
				} else {
					MessageToast.show("Нельзя менять имена");
				}
			}
			this.hideBusyIndicator()
		},

		deleteEvent: async function (oEvent) {
			var oModel = this.getModel("Table");
			var oContext = oEvent.getSource().getBindingContext("Table").sPath;
			MessageBox.warning("Вы действительно хотите удалить транзакцию?", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: async function (sAction) {
					if (sAction === "OK") {
						this.showBusyIndicator()
						var oDelItem = oModel.getProperty(oContext);
						await Firebase.deleteEvent(oDelItem.id)
						await Firebase.getEvents.call(this)
						await Firebase.getAllUsers.call(this)
						this.hideBusyIndicator()
					}
				}.bind(this)
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

		openFragment: function () {
			if (!this.pDialog) {
				this.pDialog = Fragment.load({
					name: "sap.ui.demo.basicTemplate.view.AddEvent",
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

		comentPopoverPress: function (oEvent) {
			var oModel = this.getModel("Table");
			var oContext = oEvent.getSource().getBindingContext("Table").sPath;
			var oItem = oModel.getProperty(oContext);
			var pop = new sap.m.Popover({
				title: "Комментарий",
				placement: "Bottom",
				contentWidth: "200px",
				contentHeight: "150px",
				content: [new sap.m.Text({ text: oItem.comments })]
			})
			pop.addEventDelegate({
				onmouseout: function () {
					pop.close();
				}
			}, this);
			pop.openBy(oEvent.getSource());
		},

		onCloseDialogEvent: function () {
			var oModel = this.getModel("Table");
			oModel.setProperty("/new", {});
			this.pDialog.then(function (oDialog) {
				oDialog.close();
			})
		},

		pressEvent: function (oEvent) {
			var oModel = this.getModel("Table");
			var oContext = oEvent.getSource().getBindingContext("Table").sPath;
			var oItem = oModel.getProperty(oContext);
			var oClone = {};
			Object.assign(oClone, oItem);
			oModel.setProperty("/tempitem", oClone);
			oModel.setProperty("/new", oItem);
			this.openFragment();
		},

		logout: function () {
			Firebase.logOut()
		},

		handleNav: function (evt) {
			var navCon = this.byId("navCon");
			var target = evt.getSource().data("target");
			if (target) {
				navCon.to(this.byId(target), "fade");
			} else {
				navCon.back();
			}
		},
		pressSettings: function () {
			this.oRouter.navTo("profile");
		},

		onPressMenu: function () {
			var oView = this.getView(),
				oButton = oView.byId("button");
			if (!this._oMenuFragment) {
				this._oMenuFragment = Fragment.load({
					id: oView.getId(),
					name: "sap.ui.demo.basicTemplate.view.Menu",
					controller: this
				}).then(function (oMenu) {
					oMenu.openBy(oButton);
					this._oMenuFragment = oMenu;
					return this._oMenuFragment;
				}.bind(this));
			} else {
				this._oMenuFragment.openBy(oButton);
			}
		}
	});
});