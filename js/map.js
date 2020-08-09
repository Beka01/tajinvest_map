'use sctrict'

$(function () {

  let firebaseConfig = {
    apiKey: "AIzaSyBMLcSR6ZjtTIgI_-5b8QqDY_TgaBiJ9DQ",
    authDomain: "tajinvest-a77b7.firebaseapp.com",
    databaseURL: "https://tajinvest-a77b7.firebaseio.com",
    projectId: "tajinvest-a77b7",
    storageBucket: "tajinvest-a77b7.appspot.com",
    messagingSenderId: "257184881910",
    appId: "1:257184881910:web:ce9dccac5a8af6e25a20d7",
    measurementId: "G-7EETR5324V"
  }
  firebase.initializeApp(firebaseConfig)

  let currentLang
  let sectors = []
  let projects = []

  const database = firebase.database()
  const rootRef = database.ref('map/sectors')

  function getData() {
    let sectorName = null
    $(".data").empty()
    $(".category").empty()
    rootRef.once("value").then(function (sectorsData) {
      sectorsData.forEach(function (sector, sectorId) {
        sectors.push(sector.val().name)

        sectorName = sector.val().name[currentLang]

        elfilcat = `<option value="${sectorId}">${sectorName}</option>`
        $(".form-control category").append(elfilcat)

        sector.val().projects.forEach((projectData, projectId) => {
          projectData.sector = sectorId
          projects.push(projectData)

          projectCard = `
            <div id="${projectId}" class="card project">
              <div class="card-body">
                <h5 class="card-title">${projectData.title[currentLang]}</h5>
                <p class="card-text">${projectData.descr[currentLang]}</p>
                <span class = "badge badge-primary">${sectorName}</span> 
                <span class = "badge badge-primary">${projectData.cost}</span> 
              </div>
            </div>`
          $(".data").append(projectCard)
        })
      })
    })
  }

  getLang()
  
  function getLang(){
    currentLang = $("#select option:selected").val()
  }

  $("#select").on("change", () => {
    $('.data').empty()
    getData()
    getLang()
  })

  getData()

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
    projects.forEach((el) => {
      let latLng = new google.maps.LatLng(
        el.lat,
        el.lng
      )
      let marker = new google.maps.Marker({
        position: latLng
      })
      markers.push(marker)
    })
    const markerCluster = new MarkerClusterer(map, markers, {imagePath: './images/m'})
  }
  initMap()
})
