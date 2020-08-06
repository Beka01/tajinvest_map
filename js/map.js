
'use sctrict';
$(document).ready(function () {

   // Your web app's Firebase configuration
   var firebaseConfig = {
      apiKey: "AIzaSyBMLcSR6ZjtTIgI_-5b8QqDY_TgaBiJ9DQ",
      authDomain: "tajinvest-a77b7.firebaseapp.com",
      databaseURL: "https://tajinvest-a77b7.firebaseio.com",
      projectId: "tajinvest-a77b7",
      storageBucket: "tajinvest-a77b7.appspot.com",
      messagingSenderId: "257184881910",
      appId: "1:257184881910:web:ce9dccac5a8af6e25a20d7",
      measurementId: "G-7EETR5324V"
   };
   // Initialize Firebase
   firebase.initializeApp(firebaseConfig);


   const title = document.getElementsByClassName('card-title');
   const description = document.getElementsByClassName('card-text');


   const database = firebase.database();
   const rootRef = database.ref('map');

   function getData() {
      rootRef.once("value").then(function (snapshot) {
         snapshot.forEach(function (childSnapshot) {
            title = childSnapshot.title;
         });
      });
   }

   getData();

});