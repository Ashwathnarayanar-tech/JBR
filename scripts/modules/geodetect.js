define([
  "modules/jquery-mozu", "modules/api", "underscore",
  "hyprlive", 'hyprlivecontext',
  'shim!vendor/jquery-colorbox/jquery.colorbox[jquery=jQuery]',
], function($, api, _, Hypr, HyprLiveContext) {

  $(document).ready(function() {
    var user = require.mozuData('user');
    var detected_country = 'US';
    if (HyprLiveContext.locals.pageContext.title === "International Landing") {
      console.log("Not performing geolocation - on International Landing page");
      // do nothing, show the intl landing page
    } else if (!Hypr.getThemeSetting('isGeolocationActive')) {
      console.log("Not performing geolocation - deactivated");
      // do nothing, geolocation is inactivated
    } else if ($.cookie('decline_redirect') != 'true') {
      console.log("Performing geolocation");
      
      // var getIp = function() {
      //   api.request('GET', 'https://websvc.jellybelly.com/geoip/check').then(function(res) {
      //     var detected_country = res.country_code;
      //     if (detected_country != 'US') {
      //       var country = [{
      //           name: "United States",
      //           id: "US",
      //           url: "http://www.jellybelly.com",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/us-50-star-flag.jpg"
      //         },
      //         {
      //           name: "Australia",
      //           id: "AU",
      //           url: "http://www.jellybelly.com.au",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/australia-flag.jpg"
      //         },
      //         {
      //           name: "Belgium",
      //           id: "BE",
      //           url: "http://www.jellybelly.be",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/belgium-flag.jpg"
      //         },
      //         {
      //           name: "Bulgaria",
      //           id: "BG",
      //           url: "http://www.jellybelly.com.bg",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/belgium-flag.jpg"
      //         },
      //         {
      //           name: "Canada",
      //           id: "CA",
      //           url: "http://www.jellybelly.ca",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/canada-flag.jpg"
      //         },
      //         {
      //           name: "China",
      //           id: "CN",
      //           url: "http://www.jellybelly.cn",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/china-flag.jpg"
      //         },
      //         {
      //           name: "Denmark",
      //           id: "DK",
      //           url: "http://www.jellybelly.dk",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/denmark-flag.jpg"
      //         },
      //         {
      //           name: "Estonia",
      //           id: "EE",
      //           url: "http://www.jellybelly.ee",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/estonia-flag.jpg"
      //         },
      //         {
      //           name: "France",
      //           id: "FR",
      //           url: "http://www.jellybelly.fr",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/france-flag.jpg"
      //         },
      //         {
      //           name: "Hungary",
      //           id: "GR",
      //           url: "http://www.jellybelly.gr",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/hungary-flag.jpg"
      //         },
      //         {
      //           name: "Iceland",
      //           id: "IS",
      //           url: "http://www.jellybelly.is",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/iceland-flag.jpg"
      //         },
      //         {
      //           name: "Israel",
      //           id: "IL",
      //           url: "http://www.jellybelly.co.il",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/israel-flag.jpg"
      //         },
      //         {
      //           name: "Italy",
      //           id: "IT",
      //           url: "http://www.jellybelly.com.it",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/italy-flag.jpg"
      //         },
      //         {
      //           name: "Japan",
      //           id: "JP",
      //           url: "http://www.jellybelly.jp",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/japan-flag.jpg"
      //         },
      //         {
      //           name: "Lativa",
      //           id: "LV",
      //           url: "http://www.jellybelly.lv",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/lativa-flag.jpg"
      //         },
      //         {
      //           name: "Lebanon",
      //           id: "LB",
      //           url: "http://www.jellybelly.com.lb",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/lebanon-flag.jpg"
      //         },
      //         {
      //           name: "Lithuania",
      //           id: "LT",
      //           url: "http://www.jellybelly.com.lb",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/lithuania-flag.jpg"
      //         },
      //         {
      //           name: "Mexico",
      //           id: "MX",
      //           url: "http://www.jellybelly.com.mx",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/mexico-flag.jpg"
      //         },
      //         {
      //           name: "Netherlands",
      //           id: "NL",
      //           url: "http://www.jellybelly.nl",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/netherlands-flag.jpg"
      //         },
      //         {
      //           name: "New Zealand",
      //           id: "NZ",
      //           url: "http://www.jellybelly.co.nz",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/newzealand-flag.jpg"
      //         },
      //         {
      //           name: "Norway",
      //           id: "NO",
      //           url: "http://www.jellybelly.com.no",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/norway-flag.jpg"
      //         },
      //         {
      //           name: "Oman",
      //           id: "OM",
      //           url: "http://www.jellybelly.co.om",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/oman-flag.jpg"
      //         },
      //         {
      //           name: "Philippines",
      //           id: "Ph",
      //           url: "https://www.jellybelly.ph",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/philippines-flag.jpg"
      //         },
      //         {
      //           name: "Poland",
      //           id: "PL",
      //           url: "http://www.jellybelly.pl",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/poland-flag.jpg"
      //         },
      //         {
      //           name: "Romania",
      //           id: "RO",
      //           url: "http://www.jellybelly.com.sa",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/romania-flag.jpg"
      //         },
      //         {
      //           name: "Russia",
      //           id: "RU",
      //           url: "http://www.jellybelly.ru",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/russia-flag.jpg"
      //         },
      //         {
      //           name: "Saudi Arabia",
      //           id: "PL",
      //           url: "http://www.jellybelly.com.sa",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/saudia-arabia-flag.jpg"
      //         },
      //         {
      //           name: "Singapore",
      //           id: "SG",
      //           url: "http://www.jellybelly.sg",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/singapore-flag.jpg"
      //         },
      //         {
      //           name: "Slovakia/Czech Republic",
      //           id: "SI",
      //           url: "http://www.jellybelly.si",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/czech-republic-flag.jpg"
      //         },
      //         {
      //           name: "South Africa",
      //           id: "ZA",
      //           url: "http://www.jellybelly.co.za",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/south-africa-flag.jpg"
      //         },
      //         {
      //           name: "South Korea",
      //           id: "KR",
      //           url: "http://www.jellybelly.kr",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/korea-south.jpg"
      //         },
      //         {
      //           name: "Spain",
      //           id: "ES",
      //           url: "http://www.jellybelly.es",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/spain-flag.jpg"
      //         },
      //         {
      //           name: "Sweden",
      //           id: "SE",
      //           url: "http://www.jellybelly.se",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/sweden-flag.jpg"
      //         },
      //         {
      //           name: "Switzerland",
      //           id: "CH",
      //           url: "http://www.jellybelly.ch",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/switzerland-flag.jpg"
      //         },
      //         {
      //           name: "Taiwan",
      //           id: "TW",
      //           url: "http://www.jellybelly.tw",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/taiwan-flag.jpg"
      //         },
      //         {
      //           name: "UAE",
      //           id: "AE",
      //           url: "http://www.jellybelly.ae",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/united-arab-emirates-flag.jpg"
      //         },
      //         {
      //           name: "United Kingdom",
      //           id: "UK",
      //           url: "https://www.jellybelly.co.uk",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/united-kingdom-flag.jpg"
      //         },
      //         {
      //           name: "Vietnam",
      //           id: "VN",
      //           url: "http://www.jellybelly.vn",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/vietnam-flag.jpg"
      //         }
      //       ];
      //       var foundCountry = _.find(country, function(countryObj) {
      //         return detected_country == countryObj.id;
      //       });
      //       if (foundCountry === undefined) {
      //         foundCountry = {
      //           name: "United Kingdom",
      //           id: "UK",
      //           url: "https://www.jellybelly.co.uk",
      //           image: "//cdn-tp1.mozu.com/9046-m1/cms/files/united-kingdom-flag.jpg"
      //         };
      //       }
      //       var outputIntl = "";
      //       outputIntl = "<div class= 'intl-site' style=\'width: 100%; height: 600px; text-align: center; margin-right: 10px; padding: 5px;\'><h3>";
      //       outputIntl += "<img src='//www.jellybelly.com/resources/images/JB_logo2.png' width='100px'>";
      //       outputIntl += "<p style='font-size:13px;'>You appear to be visiting from outside the United States.<br>Would you like to visit one of our international sites?</p>";
      //       outputIntl += "<p style='font-size:13px;'>Click <a class='declineRedirect' href='#'>here</a> to continue to JellyBelly.com</p>";
      //       outputIntl += "<p style='font-size:13px;'><a href='" + foundCountry.url + "'>" + foundCountry.name + "<br><img src='" + foundCountry.image + "' width='100px'></a></p><br>";
      //       outputIntl += "<table style='width:100%; font-size:12.5px';><tr><th><a href='http://www.jellybelly.com.au'>Australia</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.be'>Belgium</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.bg'>Bulgaria</a></th></tr>";
      //       outputIntl += "<tr><th><a href='http://www.jellybelly.ca'>Canada</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.cn'>China</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.dk'>Denmark</a></th></tr>";
      //       outputIntl += "<tr><th><a href='http://www.jellybelly.ee'>Estonia</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.fr'>France</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.de'>Germany</a></th></tr>";
      //       outputIntl += "<tr><th><a href='http://www.jellybelly.de'>Greece</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.hu'>Hungary</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.is'>Iceland</a></th></tr>";
      //       outputIntl += "<tr><th><a href='http://www.jellybelly.co.il'>Israel</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.jp'>Japan</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.lv'>Lativa</a></th></tr>";
      //       outputIntl += "<tr><th><a href='http://www.jellybelly.com.lb'>Lebanon</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.lt'>Lithuania</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.com.mx'>Mexico</a></th></tr>";
      //       outputIntl += "<tr><th><a href='http://www.jellybelly.nl'>Netherlands</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.co.nz'>New Zealand</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.no'>Norway</a></th></tr>";
      //       outputIntl += "<tr><th><a href='http://www.jellybelly.co.om'>Oman</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.ph'>Philippines</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.pl'>Poland</a></th></tr>";
      //       outputIntl += "<tr><th><a href='http://www.jellybelly.com.ro'>Romania</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.ru'>Russia</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.com.sa'>Saudia Arabia</a></th></tr>";
      //       outputIntl += "<tr><th><a href='http://www.jellybelly.sg'>Singapore</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.si'>Slovakia</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.co.za'>South Africa</a></th></tr>";
      //       outputIntl += "<tr><th><a href='http://www.jellybelly.kr'>South Korea</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.es'>Spain</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.se'>Sweden</a></th></tr>";
      //       outputIntl += "<tr><th><a href='http://www.jellybelly.ch'>Switzerland</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.tw'>Taiwan</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.ae'>UAE</a></th></tr>";
      //       outputIntl += "<tr><th><a href='https://www.jellybelly.co.uk'>UK</a></th>";
      //       outputIntl += "<th><a href='http://www.jellybelly.vt'>Vietnam</a></th></tr></table>";
      //       outputIntl += "</h3></div>";
      //       $.colorbox({
      //         open: true,
      //         maxWidth: "95%",
      //         maxHeight: "100%",
      //         scrolling: false,
      //         fadeOut: 500,
      //         html: outputIntl, //"/resources/intl/geolocate.html",
      //         overlayClose: true,
      //         onComplete: function() {
      //           $('#cboxClose').addClass("declineRedirect");
      //$('#cboxClose').css({'background-image': 'url("../../resources/images/icons/close_popup.png")'});
      //           $('#cboxClose').show();
      //           $('#cboxLoadedContent').css({
      //             'background': '#fff'
      //           });
      //           $('.declineRedirect').click(function(e) {
      //             e.preventDefault();
      //             $.cookie('decline_redirect', 'true', {
      //               expires: 365,
      //               path: '/'
      //             });
      //             $.cookie('detected_country', detected_country, {
      //               expires: 365,
      //               path: '/'
      //             });
      //             $(window).colorbox.close();
      //           });
      //         }
      //       });
      //     }
      //   });
      // };
      // getIp();
    }
  });
});