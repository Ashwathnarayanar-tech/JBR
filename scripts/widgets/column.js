require([
    "modules/jquery-mozu", "underscore", 
    "hyprlive", "modules/backbone-mozu"
    ],function ($,_,Hypr, Backbone) {
    
        $(document).ready(function () {

            $('.jb-column-mobile').click(function (e) {
                // if($(this).find('a').attr('href') == undefined){
                $('.jb-column-mainlist').slideUp(function () {
                    $(this).parent().find('.jb-column-heading-mobile').removeClass('jb-column-heading-current');
                });
                // }
                if (e.currentTarget.nextElementSibling.style.display === "none" || e.currentTarget.nextElementSibling.style.display === "") {
                    e.preventDefault();
                    $(e.currentTarget.nextElementSibling).slideDown(function () {
                        // $('.jb-column-heading-mobile ').css({'background':none});
                        $(this).parent().find('.jb-column-heading-mobile').addClass('jb-column-heading-current');
                    });
                }

            });

        });
        
});




