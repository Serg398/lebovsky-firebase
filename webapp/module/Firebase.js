sap.ui.define([
      '../controller/BaseController',
      "sap/ui/model/json/JSONModel",
], function (BaseController, JSONModel) {
      "use strict";

      const firebaseConfig = {
            apiKey: "AIzaSyBkZ3DJ6QZ86uPlQ1gM7zoIdsBKQQtF73k",
            authDomain: "lebovsky-f6643.firebaseapp.com",
            projectId: "lebovsky-f6643",
            storageBucket: "lebovsky-f6643.appspot.com",
            messagingSenderId: "567922316060",
            appId: "1:567922316060:web:2c8eafd0587bccf2bae0d9"
      };

      firebase.initializeApp(firebaseConfig);
      var db = firebase.firestore();


      return {

            //Documents
            getDocument: function (oCollection, oDocument) {
                  return db.collection(oCollection).doc(oDocument).get()
            },

            getAllUsers: function () {
                  var oModel = this.getModel("Table");
                  db.collection("users").get().then((querySnapshot) => {
                        var oUsers = querySnapshot.docs.map((doc) => {
                              return doc.data()
                        });
                        oModel.setProperty("/users", oUsers)
                  });
            },

            //Auth and Register
            register: function (email, password) {
                  return firebase.auth().createUserWithEmailAndPassword(email, password);
            },

            login: function (email, password) {
                  return firebase.auth().signInWithEmailAndPassword(email, password);
            },

            logOut: function () {
                  return firebase.auth().signOut()
            },

            addNewUser: function (email, oFormRegister) {
                  var userForm = {
                        "type": "user",
                        "name": oFormRegister.name,
                        "firstname": oFormRegister.firstname,
                        "email": email,
                        "money": 0
                  }
                  db.collection("users").doc(email).set(userForm);
            },

            getGeneralUser: function () {
                  var oModel = this.getModel("Table");
                  firebase.auth().onAuthStateChanged((user) => {
                        if (user) {
                              db.collection("users").doc(user.email).onSnapshot((doc) => {
                                    oModel.setProperty("/generaluser", doc.data())
                              });
                        } else {
                              this.oRouter.navTo("auth");
                        }
                  });
            },


            //Events
            getID: function () {
                  let oID = db.collection("ID").doc("ID").get().then((doc) => {
                        return doc.data().id
                  })
                  return oID
            },

            addNewEvent: async function (dataDocument) {
                  let oID = await this.getID().then()
                  let oMoney = dataDocument.money
                  let sEmail1 = dataDocument.email1
                  let sEmail2 = dataDocument.email2
                  let oUser1 = await db.collection("users").doc(sEmail1).get().then((doc) => {
                        return doc.data()
                  })
                  let oUser2 = await db.collection("users").doc(sEmail2).get().then((doc) => {
                        return doc.data()
                  })
                  let oNewEvent = {
                        "type": "event",
                        "DP": dataDocument.DP,
                        "id": oID + 1,
                        "money": dataDocument.money,
                        "comment": "",
                        "name1": oUser1.name,
                        "firstname1": oUser1.firstname,
                        "email1": sEmail1,
                        "name2": oUser2.name,
                        "firstname2": oUser2.firstname,
                        "email2": sEmail2
                  }
                  await this.editMoney(sEmail1, sEmail2, oMoney, "new")
                  await db.collection("events").doc().set(oNewEvent);
                  await db.collection("ID").doc("ID").update({
                        id: oID + 1
                  })
            },

            editEvent: async function (dataDocument) {
                  let oID = dataDocument.id
                  let oMoney = dataDocument.money
                  let oOldMoney = dataDocument.oldmoney
                  let sEmail1 = dataDocument.email1
                  let sEmail2 = dataDocument.email2
                  await this.editMoney(sEmail1, sEmail2, oOldMoney, "del")
                  await this.editMoney(sEmail1, sEmail2, oMoney, "new")
                  let oEvents = await db.collection("events").where("id", "==", oID).get().then()
                  let sID = await oEvents.docs[0].id
                  dataDocument.money = oMoney
                  await db.collection("events").doc(sID).update(dataDocument)
                  console.log(dataDocument)
            },

            deleteEvent: async function (oID) {
                  let oEvents = await db.collection("events").where("id", "==", oID).get().then()
                  let sID = await oEvents.docs[0].id
                  let oMoney = oEvents.docs[0].data().money
                  let sEmail1 = oEvents.docs[0].data().email1
                  let sEmail2 = oEvents.docs[0].data().email2
                  await this.editMoney(sEmail1, sEmail2, oMoney, "del")
                  let oDelete = await db.collection("events").doc(sID).delete();
                  return oDelete
            },

            getEvents: async function () {
                  var oModel = this.getModel("Table");
                  db.collection("events").where("type", "==", "event")
                        .onSnapshot((querySnapshot) => {
                              var cities = [];
                              querySnapshot.forEach((doc) => {
                                    cities.push(doc.data());
                              });
                              var sortEvents = cities.sort(function (a, b) {
                                    return b.id - a.id
                              })
                              oModel.setProperty("/events", sortEvents)
                        });
            },

            editMoney: async function (email1, email2, money, status) {
                  var oMoney1 = await db.collection("users").doc(email1).get().then((doc) => {
                        return doc.data().money
                  })
                  var oMoney2 = await db.collection("users").doc(email2).get().then((doc) => {
                        return doc.data().money
                  })
                  if (status === "new") {
                        await db.collection("users").doc(email1).update({
                              money: oMoney1 + money
                        })
                        await db.collection("users").doc(email2).update({
                              money: oMoney2 - money
                        })
                  }
                  if (status === "del") {
                        await db.collection("users").doc(email1).update({
                              money: oMoney1 - money
                        })
                        await db.collection("users").doc(email2).update({
                              money: oMoney2 + money
                        })
                  }
            },

            uploadAvatarFB: async function (file) {
                  var oModel = this.getView().getModel("Table");
                  oModel.setProperty("/indicator", true)
                  var oProgressIndicator = this.getView().byId("Progress")
                  var oFile = file.files[0];
                  var progress = 0
                  await firebase.auth().onAuthStateChanged((user) => {
                        if (user) {
                              var storageRef = firebase.storage().ref();
                              var uploadTask = storageRef.child('avatars/' + user.email).put(oFile);
                              uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                                    (snapshot) => {
                                          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                          oProgressIndicator.setDisplayValue(progress + '%');
                                          oProgressIndicator.setPercentValue(+progress);
                                          if (progress === 100) {
                                                storageRef.child('avatars/' + user.email).getDownloadURL().then(async (url) => {
                                                      await db.collection("users").doc(user.email).update({
                                                            AvatarUrl: url
                                                      })
                                                      await db.collection("users").doc(user.email).get().then((doc) => {
                                                            var sGeneralUser = doc.data()
                                                            oModel.setProperty("/generaluser", sGeneralUser)
                                                            oModel.setProperty("/indicator", false)

                                                      })
                                                })
                                          }

                                    })
                        } else {
                              this.oRouter.navTo("auth");
                        }
                  });
            }
      };
});
