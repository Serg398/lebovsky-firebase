sap.ui.define([
    './BaseController',
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageToast',
    "../module/Firebase"
], function (BaseController, Controller, MessageToast, Firebase) {
    "use strict";

    return BaseController.extend("sap.ui.demo.basicTemplate.controller.Auth", {

        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
        },

        pressRouteRegistrate: function () {
            this.oRouter.navTo("register");
        },

        pressLogin: function () {
            var oEmail = this.getView().byId("inputEmail"),
                sEmail = oEmail.getValue(),
                oPass = this.getView().byId("inputPass"),
                sPass = oPass.getValue();
            Firebase.login(sEmail, sPass).then((userCredential) => {
                Firebase.getGeneralUser.call(this);
                Firebase.getAllUsers.call(this);
                Firebase.getEvents.call(this);
                this.oRouter.navTo("home");
            })
                .catch(() => {
                    MessageToast.show("Не верный логин или пароль")
                });
        },

        googleLogin: function () {

            Firebase.google.call(this);
            Firebase.getGeneralUser.call(this);
            Firebase.getAllUsers.call(this);
            Firebase.getEvents.call(this);
        }
    });
});