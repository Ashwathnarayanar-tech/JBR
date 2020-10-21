require([
    "modules/jquery-mozu", "underscore", "modules/api", "hyprlive", "modules/backbone-mozu"
    ], function($, _, api, Hypr, Backbone ) {
	$(document).ready(function(){
		if(!require.mozuData('user').isAuthenticated && !require.mozuData('pagecontext').isEditMode){
            var domainName = "jellybellyretailer.com"; 
            if(window.location.host.indexOf("mozu") !== -1){
                domainName = "sandbox.mozu.com";
                $.cookie("userData", '', {path: '/', expires: -1, domain: domainName });
                if(window.location.host.split(".")[0].split("-")[1] !== Hypr.getThemeSetting('themeLoginURL').split(".")[0].split("-")[1])
                    window.location = Hypr.getThemeSetting('selectstore')+"?clearSession=yes";
            }else{  
                $.cookie("userData", '', {path: '/', expires: -1, domain: domainName });
                if(window.location.host.indexOf('east') != -1 || window.location.host.indexOf('west') !==-1)
                    window.location = Hypr.getThemeSetting('selectstore')+"?clearSession=yes";
            } 
            $.cookie("userData", '', {path: '/', expires: -1, domain: domainName });
            if(window.location.host.split(".")[0].split("-")[1] !== Hypr.getThemeSetting('themeLoginURL').split(".")[0].split("-")[1])
                window.location = Hypr.getThemeSetting('selectstore')+"?clearSession=yes";         
        } 
	});
}); 