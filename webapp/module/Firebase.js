sap.ui.define([
      '../controller/BaseController',
      "sap/ui/model/json/JSONModel",
      'sap/m/MessageToast',
], function (BaseController, JSONModel, MessageToast) {
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
      var GoogleProvider = new firebase.auth.GoogleAuthProvider();

      return {
            google: function () {
                  firebase.auth().signInWithPopup(GoogleProvider).then((result) => {
                        var user = result.user;
                        var userForm = {
                              "type": "user",
                              "AvatarUrl": "",
                              "username": user.displayName,
                              "email": user.email,
                              "money": 0
                        }
                        db.collection("users").doc(user.email).get().then((doc) => {
                              if (doc.exists) {
                                    this.oRouter.navTo("home");
                              } else {
                                    db.collection("users").doc(user.email).set(userForm);
                                    this.oRouter.navTo("home");
                              }
                        })
                  })
            },

            getAllUsers: function () {
                  var oModel = this.getModel("Table");
                  db.collection("users").where("type", "==", "user").onSnapshot((querySnapshot) => {
                              var users = [];
                              querySnapshot.forEach((doc) => {
                                    users.push(doc.data());
                              });
                              oModel.setProperty("/users", users);
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
                  var oModel = this.getModel("Table");
                  firebase.auth().signOut().then(() => {
                        oModel.setProperty("/generaluser", []);
                        oModel.setProperty("/events", []);
                        oModel.setProperty("/users", []);
                        this.oRouter.navTo("auth");
                  }).catch((error) => {
                        // An error happened.
                  });
            },

            changePassFB: function (sEmail) {
                  firebase.auth().sendPasswordResetEmail(sEmail).then(() => {
                  })
            },

            addNewUser: function (email, oFormRegister) {
                  var userForm = {
                        "type": "user",
                        "AvatarUrl": "",
                        "username": oFormRegister.name + ' ' + oFormRegister.firstname,
                        "email": email,
                        "money": 0,
                        "organisation": [

                        ]
                  }
                  db.collection("users").doc(email).set(userForm);
            },

            getGeneralUser: function () {
                  var oModel = this.getModel("Table");
                  firebase.auth().onAuthStateChanged((user) => {
                        if (user) {
                              db.collection("users").where("email", "==", user.email).onSnapshot((querySnapshot) => {
                                          var generalusers = [];
                                          querySnapshot.forEach((doc) => {
                                                generalusers.push(doc.data());
                                          });
                                          oModel.setProperty("/generaluser", generalusers[0])
                                    });
                        } else {
                              this.oRouter.navTo("auth");
                        }
                  });
            },

            //Events
            getID: function () {
                  let oID = db.collection("ID").doc("ID").get().then((doc) => {
                        return doc.data().id;
                  })
                  return oID
            },

            addNewEvent: async function (dataDocument) {
                  let oID = await this.getID().then();
                  let sEmail1 = dataDocument.email1;
                  let sEmail2 = dataDocument.email2;
                  let oUser1 = await db.collection("users").doc(sEmail1).get().then((doc) => {
                        return doc.data()
                  })
                  let oUser2 = await db.collection("users").doc(sEmail2).get().then((doc) => {
                        return doc.data()
                  })
                  let oNewEvent = {
                        "type": "event",
                        "status": sEmail2,
                        "author": sEmail1,
                        "DP": dataDocument.DP,
                        "id": oID + 1,
                        "money": dataDocument.money,
                        "comment": "",
                        "username1": oUser1.username,
                        "email1": sEmail1,
                        "username2": oUser2.username,
                        "email2": sEmail2
                  }
                  await db.collection("events").doc().set(oNewEvent);
                  await db.collection("ID").doc("ID").update({
                        id: oID + 1
                  })
            },

            onEvent: async function (dataDocument) {
                  let oMoney = dataDocument.money;
                  let sEmail1 = dataDocument.email1;
                  let sEmail2 = dataDocument.email2;
                  let oID = dataDocument.id;
                  let oEvents = await db.collection("events").where("id", "==", oID).get().then();
                  let sID = await oEvents.docs[0].id;
                  await db.collection("events").doc(sID).update({
                        status: true
                  })
                  await this.editMoney(sEmail1, sEmail2, oMoney, "new");
            },

            editEvent: async function (dataDocument) {
                  let oID = dataDocument.id;
                  let oMoney = dataDocument.money;
                  let oOldMoney = dataDocument.oldmoney;
                  let sEmail1 = dataDocument.email1;
                  let sEmail2 = dataDocument.email2;
                  if (oMoney === oOldMoney) {
                        let oEvents = await db.collection("events").where("id", "==", oID).get().then();
                        let sID = await oEvents.docs[0].id;
                        dataDocument.money = oMoney;
                        await db.collection("events").doc(sID).update(dataDocument);
                  } else {
                        await this.editMoney(sEmail1, sEmail2, oOldMoney, "del");
                        await this.editMoney(sEmail1, sEmail2, oMoney, "new");
                        let oEvents = await db.collection("events").where("id", "==", oID).get().then();
                        let sID = await oEvents.docs[0].id;
                        dataDocument.money = oMoney;
                        await db.collection("events").doc(sID).update(dataDocument);
                  }
            },

            deleteEvent: async function (oID) {
                  let oEvents = await db.collection("events").where("id", "==", oID).get().then();
                  let sID = await oEvents.docs[0].id;
                  let oMoney = oEvents.docs[0].data().money;
                  let sEmail1 = oEvents.docs[0].data().email1;
                  let sEmail2 = oEvents.docs[0].data().email2;
                  let sStatus = oEvents.docs[0].data().status;
                  if (sStatus == true) {
                        await this.editMoney(sEmail1, sEmail2, oMoney, "del");
                        let oDelete = await db.collection("events").doc(sID).delete();
                        return oDelete
                  } else {
                        let oDelete = await db.collection("events").doc(sID).delete();
                        return oDelete
                  }

            },

            getEvents: async function () {
                  var oModel = this.getModel("Table");
                  db.collection("events").where("type", "==", "event").onSnapshot((querySnapshot) => {
                              var cities = [];
                              querySnapshot.forEach((doc) => {
                                    cities.push(doc.data());
                              });
                              var sortEvents = cities.sort(function (a, b) {
                                    return b.id - a.id
                              })
                              oModel.setProperty("/events", sortEvents);
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
                  oModel.setProperty("/indicator", true);
                  var oProgressIndicator = this.getView().byId("Progress");
                  var oFile = file.files[0];
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
                                                            var sGeneralUser = doc.data();
                                                            oModel.setProperty("/generaluser", sGeneralUser);
                                                            oModel.setProperty("/indicator", false);
                                                      })
                                                })
                                          }
                                    })
                        } else {
                              this.oRouter.navTo("auth");
                        }
                  });
            },

            newClasterFB: async function (nameClaster) {
                  await firebase.auth().onAuthStateChanged((user) => {
                        if (user) {
                              db.collection("project").doc(nameClaster).set({
                                    type: "claster",
                                    admin: user.email
                              }).then(() => {
                                    db.collection("users").doc(user.email).get().then((doc) => {
                                          if (doc.exists) {
                                                var userForm = {
                                                      "AvatarUrl": doc.data().AvatarUrl,
                                                      "order": "admin",
                                                      "email": doc.data().email,
                                                      "money": 0,
                                                      "type": doc.data().type,
                                                      "username": doc.data().username,
                                                }
                                                db.collection("project/" + nameClaster + "/users").doc(user.email).set(userForm)
                                                db.collection("users/" + user.email + "/organisation").doc(nameClaster).set({
                                                      author: user.email,
                                                      type: "claster",
                                                      name: nameClaster,
                                                      role: "admin"
                                                })
                                          } else {
                                                console.log("No such document!");
                                          }
                                    }).catch((error) => {
                                          console.log("Error getting document:", error);
                                    });
                              })
                        }
                  });
            },

            getAllClasterFB: async function () {
                  var oModel = this.getModel("Table");
                  firebase.auth().onAuthStateChanged((user) => {
                        db.collection("users/"+user.email+"/organisation").where("type", "==", "claster").onSnapshot((querySnapshot) => {
                              var mainClasters = []
                              querySnapshot.forEach((doc) => {
                                    mainClasters.push(doc.data());
                            });
                            oModel.setProperty("/mainClasters", mainClasters);
                        });
                  })
            },

            newUserClasterFB: function (userEmail, claster) {
                  db.collection("project/" + claster + "/users").doc(userEmail).set({
                        type: "user"
                  }).then(() => {
                        console.log("Document successfully written!");
                  }).catch((error) => {
                              console.error("Error writing document: ", error);
                        });
            },

            deleteClasterFB: function(nameClaster) {
                  firebase.auth().onAuthStateChanged((user) => {
                        db.collection("users/"+user.email+"/organisation").doc(nameClaster).delete()
                        db.collection("project").doc(nameClaster).delete()
                  })
            },

            getOrganisation: function () {
                  db.collection("project/lebovsky/events").where("type", "==", "event").get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                              // doc.data() is never undefined for query doc snapshots
                              console.log(doc.id, " => ", doc.data());
                        });
                  }).catch((error) => {
                        console.log("Error getting documents: ", error);
                  });
            }
      };
});
