'use sctrict'

let map
let markerClusterer = null
let markers = []
let sectors = []
let projects = []

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

  const database = firebase.database()
  const rootRef = database.ref('map/sectors')

  /* здесь мы с firebase получаем все данные и создаем два массива. Массив с категориями и массив с проектами*/
  function getData() {
    rootRef.once("value").then(function (sectorsData) { // получили все данные с базы
      sectorsData.forEach(function (sector) { // проходим по каждому сектору
        sectors.push(sector.val().name) // запишем данные в массив для последующих манипуляций
        sector.val().projects.forEach((projectData) => { // пройдем по всем проектам сектора
          projectData.sectorId = sector.key
          projects.push(projectData) // для связи проекта с сектором укажем его айди
        })
      })
    }).then(() => {
      createPage()      
    })
  }

  /* первоначальное создание страницы */
  function createPage(){
    setSectors()
    setProjects()
  }

  /* проходим массив с проектами и создаем card а так же наносим метки на карту */
  function setProjects(){
    projects.forEach((project, projectId) => {
      projectCard = `
        <div id="project${projectId}" class="card project">
          <div class="card-body">
            <h5 class="card-title title">${project.title[currentLang]}</h5>
            <p class="card-text descr">${project.descr[currentLang]}</p>
            <span class="badge badge-primary project-sector">${sectors[project.sectorId][currentLang]}</span>
            <span class="badge badge-primary">${project.cost}</span> 
          </div>
        </div>`
      $(".projects").append(projectCard) // добавим карту на страницу
      addMarkerToClusterer(project)
    })

    setMarkerClusterer()
  }

  /* первоначальная установка ввыпадающий список секторов */
  function setSectors(){
    sectors.forEach((sector, sectorId) => {
      sectorOption = `<option id="sector${sectorId}" value="${sectorId}">${sector[currentLang]}</option>`
      $(".sectors").append(sectorOption)
    })
  }
  
  function getLang(){
    currentLang = $("#select option:selected").val()
  }

  getLang()
  getData()

  $("#select").on("change", () => {
    /* при изменении языка сначала мы его устанавливаем, потом обновляем первод у секторов и у проектов */
    getLang()
    updateSectors()
    updateProjects()
  })

  /* по айдишнику мы одновляем текст у секторов */
  function updateSectors(){
    sectors.forEach((sector, sectorId) => {
      $("#sector"+sectorId).text(sector[currentLang])
    })
  }

  /* по айдишнику обновляем текст у проектов. Учитывать фильтры надо */
  function updateProjects(){
    if (markerClusterer) { /* если на карте есть какие-то отметки, удаляем их */
      markerClusterer.clearMarkers()
      markers = []
    }

    let currentProject
    projects.forEach((project, projectId) => {
      if (filterCompleted(project)) {
        currentProject = $("#project"+projectId)
        currentProject.show()
        currentProject.find('.title').text(project.title[currentLang])
        currentProject.find('.descr').text(project.descr[currentLang])
        currentProject.find('.title').text(sectors[project.sectorId][currentLang])
        addMarkerToClusterer(project)
      } else {
        $("#project"+projectId).hide()
      }
    })

    setMarkerClusterer()
  }

  function filterCompleted(project){
    const selectedSectors = $(".sectors option:selected").val()
    if (selectedSectors != 'all' && project.sectorId != selectedSectors) {
      return false
    }
    return true
  }

  $('.sectors').on('change', () => {
    updateProjects()
  })

  function setMarkerClusterer()
  {
    markerClusterer = new MarkerClusterer(map, markers, {imagePath: './images/m'})
  }

  function addMarkerToClusterer(project){
    let latLng = new google.maps.LatLng(
      project.lat,
      project.lon,
    )

    let infowindow = new google.maps.InfoWindow({
      content: `<h4>${project.title[currentLang]} <span class="badge badge-primary project-sector">${sectors[project.sectorId][currentLang]}</span></h4><p>${project.descr[currentLang]}</p>`,
    })

    let marker = new google.maps.Marker({
      position: latLng,
      icon:'https://map.investcom.tj/wp-content/plugins/wp-google-map-gold/assets/images/icons/factory.png',
    })
    marker.addListener("click", () => infowindow.open(map, marker))
    markers.push(marker)
  }

  function initMap() {
    const mapProp = {
      center: new google.maps.LatLng(38.554822, 68.776858),
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl:false,
    }
    map = new google.maps.Map(document.getElementById("googleMap"), mapProp)
  }

  initMap()
})
