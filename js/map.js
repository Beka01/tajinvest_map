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

  /* с firebase получаем все данные и создаем два массива. Массив с категориями и массив с проектами*/
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

  /*перебор массива с проектами и создание card с отметками на карте*/
  function setProjects(){
    projects.forEach((project, projectId) => {
      projectCard = `
        <div id="project${projectId}" class="card project">
          <div class="card-body">
            <h5 class="card-title title">${project.title[currentLang]}</h5>
            <p class="card-text descr">${project.descr[currentLang]}</p>
            <h6><span id="baggee" class="badge badge-primary project-sector">${sectors[project.sectorId][currentLang]}</span></h6>
            <h6><span data-ru="${project.realization} млн" data-tj="${project.realization} млн" data-en="${project.realization} mln" id="baggee" class="badge badge badge-secondary">${project.cost} млн $</span> </h6>
            <h6><span data-ru="${project.realization} г." data-tj="${project.realization} сол" data-en="${project.realization} years" id="baggee" class="badge badge badge-success">${project.realization} г.</span> </h6>
          </div>
        </div>`
      $(".projects").append(projectCard) // добавим карту на страницу
      addMarkerToClusterer(project)
    })

    setMarkerClusterer()
  }

  /* первоначальная установка ввыпадающего списка секторов */
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
  translateStaticText()
  getData()

  $("#select").on("change", () => {
    /*обновление перевода секторов и проектов при изменении языка*/
    getLang()
    translateStaticText()
    updateSectors()
    updateProjects()
  })

  function translateStaticText(){
    $("[data-ru]").each((index, el) => {
      $(el).text($(el).data(currentLang))
    })
  }

  /* обновление текста секторов по ойди */
  function updateSectors(){
    sectors.forEach((sector, sectorId) => {
      $("#sector"+sectorId).text(sector[currentLang])
    })
  }

  /* по айдишнику обновляем текст у проектов с учетом фильтра */
  function updateProjects(){
    if (markerClusterer) { /* удаляем отметки если на карте есть какие-то*/
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
    if (isSectorIncorrect(project.sectorId)) {
      return false
    }

    if (isPriceInorrect(project.cost)) {
      return false
    }
    
    return true
  }

  function isSectorIncorrect(sectorId){
    const selectedSectors = $(".sectors option:selected").val()
    return (selectedSectors != 'all' && sectorId != selectedSectors)
  }

  function isPriceInorrect(cost){
    const selectedPrice = $(".prices option:selected")
    return (selectedPrice.val() != 'all' && (selectedPrice.data('min') > cost || selectedPrice.data('max') <= cost))
  }

  $('.filter').on('change', () => {
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
      content: `<h6>${project.title[currentLang]} <span class="badge badge-primary project-sector">${sectors[project.sectorId][currentLang]}</span></h6><p>${project.descr[currentLang]}</p>`,
    })

    let marker = new google.maps.Marker({
      position: latLng,
      icon:'./images/sector'+project.sectorId+'.png',
    })
    marker.addListener("click", () => infowindow.open(map, marker))
    markers.push(marker)
  }

  function initMap() {
    const mapProp = {
      center: new google.maps.LatLng(38.802352, 70.994508),
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl:false,
    }
    map = new google.maps.Map(document.getElementById("googleMap"), mapProp)
  }

  initMap()
})