define(['modules/jquery-mozu', 'hyprlive', 'underscore', 'modules/api',
        'shim!vendor/bootstrap/js/affix[jquery=jQuery]', 'shim!vendor/bootstrap/js/scrollspy[jquery=jQuery]'], 
        function ($, Hypr, _, api) {
    // if (!Modernizr.mq('(max-width: 800px)')) {
        var gutterWidth = parseInt(Hypr.getThemeSetting('gutterWidth'),10);
        $(document).ready(function () {
            
            /** navigation functionality for each nav item **/
            $(document).on('click','a.mz-scrollnav-link',function(e){
                // e.preventDefault();
                e.stopPropagation();
                $('a.mz-scrollnav-link').removeClass('active');
                $(e.target).addClass('active');
                if(e.target.attributes.getNamedItem('forid').value === "gotoTop"){
                    $("html, body").animate({scrollTop:  $(".mz-myaccount").offset().top }, 250);
                }else{
                    var nav = e.target.attributes.getNamedItem('forid').value;
                    $('#account-panels .mz-l-stack-section').hide();
                    $('#x-'+nav).show();
                }
                hideAllErrorMessages();
                // $("html, body").animate({scrollTop:  $(".mz-columnfull").offset().top+30 }, 200);
            });
            //SHow pop up on  mobile
            $(document).on('click','a.selected-menu-mobile',function(e){
                $('div.mobile-popupmenu-myaccount').slideDown();
            });
            //Click handler to change menu in mobile
            $(document).on('click','a.mz-scrollnav-link-mobile',function(e){
                var text = $('a.mz-scrollnav-link[forID="'+e.target.getAttribute('forid')+'"]').text();
                $('a.selected-menu-mobile').text(text);
                $('a.mz-scrollnav-link-mobile').removeClass('active');
                $(e.target).addClass('active');
                var nav = e.target.attributes.getNamedItem('forid').value;
                $('#account-panels .mz-l-stack-section').hide();
                $('#x-'+nav).show();
                $('div.mobile-popupmenu-myaccount').slideUp();
                hideAllErrorMessages();
            });
            
            if(window.location.hash.length > 0 && $('#x-'+window.location.hash.substring(1,window.location.hash.length)).length>0  ){
                $('#x-'+window.location.hash.substring(1,window.location.hash.length)).show();
                $('[forID="'+window.location.hash.substring(1,window.location.hash.length)+'"]').addClass('active');
                // mobile
                var text = $('a.mz-scrollnav-link[forID="'+window.location.hash.substring(1,window.location.hash.length)+'"]').text();
                $('a.selected-menu-mobile').text(text);
            }else{
                $('#x-account-settings').show();
                $('[forID="account-settings"]').addClass('active');
                //mobile
                $('a.selected-menu-mobile').text('ACCOUNT INFO');
                
            }
            
            function hideAllErrorMessages(){
                $('#account-messages').css('display','none');
            }
        });
    // }
});

