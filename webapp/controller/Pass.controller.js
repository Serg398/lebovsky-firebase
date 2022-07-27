sap.ui.define([
    './BaseController',
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageToast',
    "../module/Firebase"
], function (BaseController, Controller, MessageToast, Firebase) {
    "use strict";

    return BaseController.extend("sap.ui.demo.basicTemplate.controller.Pass", {

        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
        },

        sendRemovePass: function() {
            var oEmail = this.getView().byId("inputEmail"),
            sEmail = oEmail.getValue();
            if (sEmail != "") {
                Firebase.changePassFB(sEmail)
                this.oRouter.navTo("auth");
            }
            
        }


    });
});