require(["modules/jquery-mozu", "underscore"], function($, _) {
  //start lazy loading at mixed emotions banner on home page 
  //lazy load 4 bottom buttons as well 
  
  var loadBanners = _.once(banners);
  var evrgreenFooter = document.getElementById("ll-footer");
  
  var belowFoldOnce = _.once(function() {
    lazyLoad(belowFoldImages);
  });
  
  var belowFoldImages = document.getElementsByClassName("lazy-load");
  
  try {
    if (window.pageYOffset > 2 || evrgreenFooter.getBoundingClientRect().top <= window.innerHeight) {
      loadBanners();
      belowFoldOnce();
    }
    } catch(e) {
    console.log(e);
  }
  
  window.addEventListener("scroll", belowFoldOnce);
  window.addEventListener("scroll", loadBanners);


  function lazyLoad(llClassName) {
    for (var i = 0; i < llClassName.length; i++) {
      if (llClassName[i].getAttribute('data-src')) {
        llClassName[i].setAttribute('src', llClassName[i].getAttribute('data-src'));
      }
    }
  }
  
  function banners() {
    $('.lazy-banners').each(function() {
      $(this).attr('style', "background-image:" + $(this).attr('data-src'));
    });
  }


});