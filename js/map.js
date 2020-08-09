
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
   let lngCat;

   const database = firebase.database();
   const rootRef = database.ref('map/sectors');

   function getData() {
      let sectorName = null
      $(".data").empty()
      $(".category").empty()
      rootRef.once("value").then(function (snapshot) {
         snapshot.forEach(function (childSnapshot, catId) {
            let sector = childSnapshot.val()
            sectorName = sector.name[lngCat]
            elfilcat = `
               <option value="${catId}">${sectorName}</option>`
            $(".category").append(elfilcat)

            sector.projects.forEach(el => {
               element = `
                      <div class="card">
                         <div class="card-body">
                            <h5 class="card-title">${el.title[lngCat]}</h5>
                            <p class="card-text">${el.descr[lngCat]}</p>
                            <span class = "badge badge-primary">${sectorName}</span> 
                            <span class = "badge badge-primary">${"$ " + el.cost + " mln"} </span> 
                         </div>
                      </div>`
               $(".data").append(element)

            })
         })
      })
   }

   getCategories();
   function getCategories() {
      lngCat = $("#select option:selected").val()
      console.log(lngCat)
   }

   $("#select").on("change", () => {
      $('.data').empty();
      getData()
      getCategories()
   })

   getData();

  
   //MAP 
   function initMap() {
      const mapProp = {
         center: new google.maps.LatLng(38.554822, 68.776858),
         zoom: 7,
         mapTypeId: google.maps.MapTypeId.ROADMAP,
         mapTypeControl: false,
         streetViewControl:false,
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