'use sctrict';

let map;
let markerClusterer = null;
let markers = [];
let sectors = [];
let projects = [];
let projectCard = [];
let limitPerPage = 5;
let numberofItems = 0;
let totalOfPages = 0;


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
  };
  firebase.initializeApp(firebaseConfig);

  let currentLang;

  const database = firebase.database();
  const rootRef = database.ref('map/sectors');
  const rootProjects = database.ref('map/projects');

  /* с firebase получаем все данные и создаем два массива. Массив с категориями и массив с проектами*/
  function getData() {
    rootRef.once("value").then(function (sectorsData) { // получили все данные с базы
      sectorsData.forEach(function (sector) { // проходим по каждому сектору
        sectors[sector.key] = sector.val();

      });
    });

    rootProjects.once("value").then(function (projectsData) { // получили все данные с базы
      projectsData.forEach(function (project) { // проходим по каждому сектору

        projects.push(project.val()); // запишем данные в массив для последующих манипуляций

      });
    }).then(() => {
      createPage();

    });
  }

  /* первоначальное создание страницы */
  function createPage(){
    setSectors();
    setProjects();
  }

  /*перебор массива с проектами и создание card с отметками на карте*/
  function setProjects(){
    projects.forEach((project, projectId) => {
      projectCard = `
        <div id="project${projectId}" class="card project filtered">
          <div class="card-body">
            <h5 class="card-title title">${project.title[currentLang]}</h5>
            <p class="card-text descr">${project.descr[currentLang]}</p>
            <h6><span class="badge badge-primary project-sector">${sectors[project.sector][currentLang]}</span></h6>
            <h6><span data-ru="${project.cost} млн" data-tj="${project.cost} млн" data-en="${project.cost} mln"
            class="badge badge badge-secondary">${project.cost} млн $</span> </h6>
            <h6><span data-ru="${project.realization} г." data-tj="${project.realization}сол" data-en="${project.realization} years" class="badge badge badge-success">${project.realization} г.</span> </h6>
          </div>
        </div>`;
      $(".projects").append(projectCard); // добавим карту на страницу
      addMarkerToClusterer(project);
      numberofItems++;
    });
    setMarkerClusterer();
    pagination();
  }

  $(".pagination").on("click", 'li.page-item', function(){
    if($(this).hasClass("active")){
      return false;
    } else {
      let currentPage = $(this).index();
      $(".pagination li").removeClass("active");
      $(this).addClass("active");
      $(".filtered").hide();

      let grandTotal = limitPerPage * currentPage;
      for(let s = grandTotal - limitPerPage; s < grandTotal; s++){
        $(".filtered:eq("+ s +")").show();
      }
    }
  });

  $(".pagination").on("click", "#next-page", function(){
    let currentPage = $(".pagination li.active").index();
      if(currentPage === totalOfPages){
          return false;
      } else {
        currentPage++;
        $(".pagination li").removeClass("active");
        $(".filtered").hide();
        let grandTotal = limitPerPage * currentPage;
        for(let s = grandTotal - limitPerPage; s < grandTotal; s++){
          $(".filtered:eq("+ s +")").show();
      }
      $(".pagination li.page-item:eq(" + (currentPage-1) + ")").addClass("active");
    }
  });

  $(".pagination").on("click", "#previous-page", function(){
    let currentPage = $(".pagination li.active").index();
      if(currentPage === 1){
          return false;
      } else {
        currentPage--;
        $(".pagination li").removeClass("active");
        $(".filtered").hide();
        let grandTotal = limitPerPage * currentPage;
         for(let s = grandTotal - limitPerPage; s < grandTotal; s++){
          $(".filtered:eq("+ s +")").show();
      }
      $(".pagination li.page-item:eq(" + (currentPage-1) + ")").addClass("active");
    }
  });

  function pagination() {
    $('.pagination').empty()
    $(".filtered:gt("+ (limitPerPage-1) +")").hide();
    totalOfPages = Math.round(numberofItems / limitPerPage);
    $(".pagination").append("<li id='previous-page' class='page-previous'><a class='page-link' href='javascript:void(0)' aria-label='Previous'><span aria-hidden='true'>&laquo;</span></a></li>");
    $(".pagination").append("<li class='page-item active' class='page-item'><a class='page-link' href='javascript:void(0)'>" + 1 + "</a></li>");
    for(let i=2; i<=totalOfPages; i++){
      $(".pagination").append("<li  class='page-item'><a class='page-link' href='javascript:void(0)'>" + i + "</a></li>");
    }
    $(".pagination").append("<li id='next-page' class='page-next'><a class='page-link' href='javascript:void(0)' aria-label='Next'><span aria-hidden='true'>&raquo;</span></a></li>");
  }

  /* первоначальная установка ввыпадающего списка секторов */
  function setSectors(){
    sectors.forEach((sector, sectorId) => {
      const sectorOption = `<option id="sector${sectorId}" value="${sectorId}">${sector[currentLang]}</option>`;
      $(".sectors").append(sectorOption);
    });
  }

  function getLang(){
    currentLang = $("#select option:selected").val();
  }

  getLang();
  translateStaticText();
  getData();

  $("#select").on("change", () => {
    /*обновление перевода секторов и проектов при изменении языка*/
    getLang();
    translateStaticText();
    updateSectors();
    updateProjects();
  });

  function translateStaticText(){
    $("[data-ru]").each((index, el) => {
      $(el).text($(el).data(currentLang));
    });
  }

  /* обновление текста секторов по ойди */
  function updateSectors(){
    sectors.forEach((sector, sectorId) => {
      $("#sector"+sectorId).text(sector[currentLang]);
    });
  }

  /* по айдишнику обновляем текст у проектов с учетом фильтра */
  function updateProjects(){
    if (markerClusterer) { /* удаляем отметки если на карте есть какие-то*/
      markerClusterer.clearMarkers();
      markers = [];
    }

    let currentProject;
    numberofItems = 0
    $(".project").removeClass("filtered")
    projects.forEach((project, projectId) => {
      if (filterCompleted(project)) {
        currentProject = $("#project"+projectId);
        currentProject.show().addClass("filtered");
        currentProject.find('.title').text(project.title[currentLang]);
        currentProject.find('.descr').text(project.descr[currentLang]);
        currentProject.find('.project-sector').text(sectors[project.sector][currentLang]);
        addMarkerToClusterer(project);
        numberofItems++
      } else {
        $("#project"+projectId).hide();
      }
    });
    pagination()

    setMarkerClusterer();

  }

  function filterCompleted(project){
    if (isSectorIncorrect(project.sector)) {
      return false;
    }

    if (isPriceInorrect(project.cost)) {
      return false;
    }

    return true;

  }

  function isSectorIncorrect(sectorId){
    const selectedSectors = $(".sectors option:selected").val();
    return (selectedSectors != 'all' && sectorId != selectedSectors);
  }

  function isPriceInorrect(cost){
    const selectedPrice = $(".prices option:selected");
    return (selectedPrice.val() != 'all' && (selectedPrice.data('min') > cost || selectedPrice.data('max') <= cost));
  }

  $('.filter').on('change', () => {
    updateProjects();
  });

  function setMarkerClusterer()
  {
    markerClusterer = new MarkerClusterer(map, markers, {imagePath: './images/m'});
  }

  function addMarkerToClusterer(project){
    let latLng = new google.maps.LatLng(
      project.lat,
      project.lon

    );


    let infowindow = new google.maps.InfoWindow({
      content: `
      <div class="card-body">
          <h5 id="popup-title" class="card-title title">${project.title[currentLang]}</h5>
           <p id="popup-descr"class="card-text descr">${project.descr[currentLang]}</p>
          <div class="badge-wrapper">
            <div class="badge-popup">
              <h6><span class="badge badge-primary project-sector">${sectors[project.sector][currentLang]}</span></h6>
          </div>
          <div class="badge-popup">
              <h6><span data-ru="${project.cost} млн" data-tj="${project.cost} млн" data-en="${project.cost} mln" class="badge badge badge-secondary">${project.cost} млн $</span> </h6>
          </div>
          <div class="badge-popup">
              <h6><span data-ru="${project.realization} г." data-tj="${project.realization}сол" data-en="${project.realization} years" class="badge badge badge-success">${project.realization} г.</span> </h6>
          </div>
          <div class="badge-buttons">
          <button type="button" class="btn btn-danger btn-sm"><i class="fas fa-download"></i></button>
          </div>

      </div>`,
    });
    map.addListener('click', function() {
      if (infowindow)
       infowindow.close();
    });


    let marker = new google.maps.Marker({
      position: latLng,
      icon:'./images/sector'+project.sector+'.png',

    });
    marker.addListener("click", () => infowindow.open(map, marker));
    markers.push(marker);
  }

  function initMap() {
    const mapProp = {
      center: new google.maps.LatLng(38.802352, 70.994508),
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl:false,
    };
    map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
  }

  initMap();
});
