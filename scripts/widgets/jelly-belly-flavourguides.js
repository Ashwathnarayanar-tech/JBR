/* jshint ignore:start */
require([
    "modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu", 
    "modules/api"], function ($, Hypr, Backbone, api) {
     

    $(document).ready(function(){
           $('.flavour-guide-widget-title').click(function(e){
               if($(e.currentTarget.parentElement).find('.flavour-guide-widget-container')[0].style.display === "none"){
                    $(e.currentTarget.parentElement).find('.flavour-guide-widget-container').slideDown();
               }else{
                   $(e.currentTarget.parentElement).find('.flavour-guide-widget-container').slideUp();
               }
           });
    });

});



/* jshint ignore:end */




