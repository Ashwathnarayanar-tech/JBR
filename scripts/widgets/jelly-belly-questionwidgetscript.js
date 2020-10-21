require([
    "modules/jquery-mozu", "underscore", 
    "hyprlive", "modules/backbone-mozu"
    ],function ($,_,Hypr, Backbone) {
    
        $(document).ready(function () {
            /* $('.jb-questiononly').click(function(e){
            $('.jb-answeronly').slideUp( function(){
                    
             });
             
             if(e.currentTarget.nextElementSibling.style.display === "none")
             {        
                 $(e.currentTarget.nextElementSibling).slideToggle();
             }
         })*/
            $('.jb-questiononly').click(function (e) {
                $(e.currentTarget.nextElementSibling).slideToggle();
            });
        });
        
});
