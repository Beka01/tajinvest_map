
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
   const category = document.getElementsByClassName('card-text');


   const database = firebase.database();
   const rootRef = database.ref('map');

   function getData() {
      rootRef.once("value").then(function (snapshot) {
         snapshot.forEach(function (childSnapshot) {
            el = `
            <div class="card" data-category="${childSnapshot.val().category}">
               <div class="card-body">
                  <h5 class="card-title">${childSnapshot.val().title}</h5>
                  <p class="card-text">${childSnapshot.val().description}</p>
                  <span class = "badge badge-primary">${childSnapshot.val().category}</span> 
               </div>
            </div>`
            $('.data').append(el)
         });
      });
   }

   getData();

   const data = [
      {
         id: 7,
         title: "Construction of a waste disposal plant in the Dushanbe city",
         content: "The project will ensure the achievement of efficient waste treatment and improvement of the environmental situation in the city and suburbs of Dushanbe, obtaining compost, electricity and process steam (warm water) from alternative sources by burning waste.",
         lat: 38.55440271784567,
         lng: 68.96281965000003,
      }, {
         id: 8,
         title: "Carrying out of drinking water line from the Dangara canal to the Free economic zone of Dangara",
         content: "Carrying out of 14 km drinking water line from the Dangara canal to the Free economic zone of \u201cDangara\u201d and construction of two reservoirs with the volume of 4000 cubic meters.",
         lat: 38.21571448056834,
         lng: 69.23410293940424,
      }, {
         id: 9,
         title: "Extraction of quartz sand in Dzhabor Rasulov district Sughd region",
         content: "Quartz sand of the enterprise is used for the production of glass, glass products, cans, bottles, automotive glass and so on. Quartz sand is supplied in large volumes to the Republic of Uzbekistan and Kyrgyzstan.",
         lat: 39.5155326,
         lng: 69.09702300000004,
      },
   ]
   function initMap() {
      const mapProp = {
         center: new google.maps.LatLng(38.554822, 68.776858),
         zoom: 7,
         mapTypeId: google.maps.MapTypeId.ROADMAP,
      }
      const map = new google.maps.Map(document.getElementById("googleMap"), mapProp)

      const markers = []
      data.forEach((el) => {
         let latLng = new google.maps.LatLng(
            el.lat,
            el.lng
         )
         let marker = new google.maps.Marker({
            position: latLng
         })
         markers.push(marker)
      })
      const markerCluster = new MarkerClusterer(map, markers)
   }
   initMap();

});