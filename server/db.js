const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");

firebase.initializeApp({
    apiKey: "AIzaSyBbhWAZE4J2XhDkCKVXpzvhS6j0R6uEDDY",
    authDomain: "recipiescrapper.firebaseapp.com",
    projectId: "recipiescrapper",
  });
  
// Initialize Cloud Firestore through Firebase
const db = firebase.firestore();

// Disable deprecated features
db.settings({
  timestampsInSnapshots: true
});

module.exports= db;