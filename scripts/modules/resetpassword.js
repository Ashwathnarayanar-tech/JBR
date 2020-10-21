require([
    "modules/jquery-mozu",
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    'modules/api',
    'modules/iframexhr'
], function($, _, Hypr, Backbone, api, IFrameXmlHttpRequest) {
    $(document).ready(function(e) {  
                
        var referrer =  document.referrer;
        var site= window.location.origin;
        if(referrer !== ""){  
            var a= referrer;
            var b= a.split('/');
            var url = "";
                for(var i = 3 ; i<b.length; i++){ 
                     url= url+'/'+b[i]; 
                    }
            if(url != "/user/login"){        
                $('.urllink').attr("value", url);  
            }else if(url === "" || url ==="/"  ){
                $('.urllink').attr("value", "/home");  
            } 
        }  
        
        else{
             $('.urllink').attr("value", "/home");
        }
        /**
         * enum used for handling the differnt sections without conflict.
        **/
        var EMAIL = 1,
            PASSWORD = 2,
            LOGIN = 3,
            FORGETPASSWORD = 4;
        
        /**
         * Toggle the visibility between the login and forget forms
        **/
        $('[toggle-login-forget-password-form]').on('click',function(e){
            var formName = e.target.getAttribute('toggle-login-forget-password-form');
            if(formName === "login"){
                $('[forgetpassword-form-container]').fadeOut(function(){
                    $('[login-form-container]').fadeIn();
                });
            }else{
                $('[login-form-container]').fadeOut(function(){
                    $('[forgetpassword-form-container]').fadeIn();
                });
            }
        });
        
        
        /**
         * Handle Login submit button 
        **/
        
        $('[action-login]').on('click',function(){
          //  alert("action login");
            var userEmail = $('[name="email-login"]').val(),
                userPassword = $('[name="password-login"]').val();
            //$("#page-content").addClass("is-loading");
            if(validate(EMAIL,userEmail,LOGIN) && validate(EMAIL,userPassword,LOGIN)){
                //alert("going on");
                api.action('customer', 'loginStorefront', {
                    email: userEmail,
                    password: userPassword
                }).then(JBworkflow, displayApiMessageLogin);
            }
        });
       
        
    
        
        /**
         * Handle forget password email submit button...
        **/
        $('[submitforgotpassword]').on('click',function(){
            var email = $('[name="reset-password-email"]').val();
            if(validate(EMAIL,email,FORGETPASSWORD)){
                api.action('customer', 'resetPasswordStorefront', {
                    EmailAddress: email
                }).then(displayResetPasswordMessage, displayApiMessageForgetPassword);
            }
        });
        
        /**
         * validating the form data
        **/
        function validate(field, value, section){
            clearAllValidations();
            switch(field){
                case(1):
                    if(value.length === 0){
                        showValidationMessages(section, "Please enter valid email address.", "#b94a48");
                        return false;
                    }
                    return true;
                case(2):
                    if(value.length === 0){
                        showValidationMessages(section, "Please enter valid password.", "#b94a48");
                        return false;
                    }
                    return true;
            }
        }
        
        /**
         * Show Error or Validation message for both section
         * message-login-bar
         * forgetpassword-message
        **/
        function showValidationMessages(section, msg, typeColor){
            switch(section){
                case(3):
                    $('[message-login-bar]')[0].innerHTML = msg;
                    $('[message-login-bar]').css({'color':typeColor});
                    $('[message-login-bar]').fadeIn();
                    break;
                case(4):
                    $('[forgetpassword-message]')[0].innerHTML = msg;
                    $('[forgetpassword-message]').css({'color':typeColor});
                    $('[forgetpassword-message]').fadeIn();
                    break;
            }
        }
        
        /**
         * Clear all validations and remove messages 
        **/
        function clearAllValidations(){
            var msg = "", typeColor = "#000";
            $('[message-login-bar]')[0].innerHtml = msg;
            $('[message-login-bar]').css({'color':typeColor});
            $('[forgetpassword-message]')[0].innerHtml = msg;
            $('[forgetpassword-message]').css({'color':typeColor});
            $('[message-login-bar]').fadeOut();
            $('[forgetpassword-message]').fadeOut();
        }
        
        /**
         * Loginsuccessfully.
         * Fetch user segments and do redirections
         * if user dosn't have the SPT segment, logout and redirect ot eCommerce site.
         * or else to myaccountpage.
        **/function calculateLimits(bucket,obj){
                            var temphtml="<figure><img width=100px src='../../resources/images/JB_logo2.png' alt='' /></figure><table>";
                            var JBLimit=0;
                            var JBBalance=0; 
                            var JBUsage=0;
                            if(obj.credits){
                                JBLimit=obj.credits[0].initialBalance;
                                JBBalance=obj.credits[0].currentBalance;
                                JBUsage=JBLimit-JBBalance;     
                            }
                            if(bucket==="e"){
                                temphtml+="<tr><td colspan=2>You have been logged in.</td></tr>";
                                temphtml+="<tr><td colspan=2>Unfortunately, we're not able to accept an order from you at the moment. Please call Accounts Receivable at 707-399-2309 </br>(M-F, 7am-5pm PT) to discuss options.</td></tr>";     
                                 
                            } 
                            temphtml+='<tr class="credits"><td>Jelly Belly Credit Limit</td><td>$'+parseFloat(JBLimit).toFixed(2)+'</td></tr>';
                            temphtml+='<tr class="credits"><td>Jelly Belly Credit Used</td><td>$'+parseFloat(JBBalance).toFixed(2)+'</td></tr>';
                            temphtml+='<tr class="credits"><td>Jelly Belly Credit <b>Available</b></td><td class="avail">$'+parseFloat(JBUsage).toFixed(2)+'</td></tr>';
                            if(bucket!="e"){
                            temphtml+="<tr><td><button handle-login >Continue Shopping</button></td></tr>"; 
                            }else{
                                temphtml+="<tr><td><button closepop >close</button></td></tr>"; 
                            } 
                            return temphtml; 
        }  
       
        function JBworkflow(){
            //alert("beginning workflow");
            handleLoginComplete();
         //   return;
            var JBLimit=0,JBBalance=0,JBUsage=0;
            $('#receiver').load('/myaccount', function() {
                var customer = JSON.parse($('#receiver #data-mz-preload-customer').html());
                $((customer).attributes).each(function(k,v){
                    if(v.fullyQualifiedName.toLowerCase()=="tenant~bucket"){
                        var bucket=v.values[0];
                        if(bucket.toLowerCase()=="a"){
                            //$("#page-content").removeClass("is-loading");
                            handleLoginComplete();
                        }else if(bucket.toLowerCase()=="b"){
                            var bucketb="<figure<img src='../../resources/images/JB_logo2.png' alt='' /><figure<table><tr><td colspan=2>We apologies you cannot process the order this time.</td></tr>";
                            bucketb+="<tr><td colspan=2>Please call our customer care for further information</td></tr><tr><td colspan=2><button closepop >close</button></td></tr></table>";
                            $(".bucketinfo").html(bucketcinfo);
                             $('<iframe>', {
                            src: window.location.origin + "/logout",
                            id:  'myFrame',
                            frameborder: 0,
                            scrolling: 'no'
                            }).appendTo('body');
                            //$("#page-content").removeClass("is-loading");
                            $(".popup-modal-bg, .bucketinfo").show();
                        }else if(bucket.toLowerCase()=="c"){  
                            
                            /*console.log("JBLimit==>"+JBLimit);
                            console.log("JBBalance==>"+JBBalance);
                            console.log("JBUsage==>"+JBUsage);*/
                            var bucketcinfo=calculateLimits(bucket,customer);
                            $(".bucketinfo").html(bucketcinfo);
                            //$("#page-content").removeClass("is-loading");
                            $(".popup-modal-bg, .bucketinfo").show();
                        
                        }else if(bucket.toLowerCase()=="d"){
                           /* console.log("Bucket==>"+bucket);
                            JBLimit=customer.credits[0].initialBalance;
                            JBBalance=customer.credits[0].currentBalance;
                            JBUsage=JBLimit-JBBalance;
                            console.log("JBLimit==>"+JBLimit);
                            console.log("JBBalance==>"+JBBalance);
                            console.log("JBUsage==>"+JBUsage);*/
                            var bucketdinfo=calculateLimits(bucket,customer);
                            $(".bucketinfo").html(bucketdinfo);
                            //$("#page-content").removeClass("is-loading");
                            $(".popup-modal-bg, .bucketinfo").show();
                        
                        }else if(bucket.toLowerCase()=="e"){
/*                        console.log("Bucket==>"+bucket);
                        JBLimit=customer.credits[0].initialBalance;
                            JBBalance=customer.credits[0].currentBalance;
                            JBUsage=JBLimit-JBBalance;
                            console.log("JBLimit==>"+JBLimit);
                            console.log("JBBalance==>"+JBBalance);
                            console.log("JBUsage==>"+JBUsage);*/
                            var bucketeinfo=calculateLimits(bucket,customer);
                            $(".bucketinfo").html(bucketeinfo);
                             $('<iframe>', {
                            src: window.location.origin + "/logout",
                            id:  'myFrame',
                            frameborder: 0,
                            scrolling: 'no'
                            }).appendTo('body'); 
                            
                            //$("#page-content").removeClass("is-loading");
                            $("#myFrame").hide();
                            $(".popup-modal-bg, .bucketinfo").show();
                           
                    }
                        
                        
                    }
                });
                });
                
              
                
                
            
        }
        $(document).on('click','[handle-login]',function(){
         //  alert("handle-login");
           handleLoginComplete();   
        });
        $(document).on('click','[closepop]',function(){
           $(".popup-modal-bg, .bucketinfo").hide();
            window.location.reload();
        });
        
                                
        function handleLoginComplete(){
            $('#receiver').load('/myaccount', function() {
                var memberAutoLogin;
                var memberAutoLogin2; 
                var easesite = Hypr.getThemeSetting('b2beast');
                var westsite = Hypr.getThemeSetting('b2bwest');
                var userEmail = $('[name="email-login"]').val(),
                    userPassword = $('[name="password-login"]').val();
                var customer = JSON.parse($('#receiver #data-mz-preload-customer').html());
               // JBworkflow(customer);
                var isSpecialityCustomerEast = false;
                var isSpecialityCustomerWest = false;
                var allowedSites = 0;
                
                $((customer).segments).each(function(k,v){
                    if(v.code === "B2BWEST"){
                        isSpecialityCustomerWest = true;
                    }    
                    if(v.code === "B2BEAST") {
                        isSpecialityCustomerEast = true;
                    }    
                });
                
                if(isSpecialityCustomerWest && isSpecialityCustomerEast){
                   // alert("entering both");
                    /*if(site == (westsite + "123")){
                        
                        if(url != "/user/login" && url!== undefined){        
                            window.location= url;  
                        }else if(url === "" || url ==="/"  ){
                            window.location= "/home";  
                        } 
                        else{
                            window.location= "/home";
                        }
                    }*/
                    
                    //else{
                            $('<iframe>', {
                            src: window.location.origin + "/logout",
                            id:  'myFrame',
                            frameborder: 0,
                            scrolling: 'no'
                            }).appendTo('body');

                        var westOK = false;
                        var eastOK = false;
                        
                        userEmail = $('[name="email-login"]').val();
                        userPassword = $('[name="password-login"]').val();
                    
                        memberAutoLogin = new IFrameXmlHttpRequest(westsite+"/resources/receiver.html");
                        memberAutoLogin.withCredentials = true;
                        memberAutoLogin.setRequestHeader("Accept", "application/json");
                        memberAutoLogin.setRequestHeader("Content-Type", "application/json");
                        memberAutoLogin.open('POST', westsite+"/user/login", true);
                        memberAutoLogin.onreadystatechange=function() {
                            if (memberAutoLogin.readyState==4 && memberAutoLogin.status==200) {
                                console.log(memberAutoLogin.responseText);
                                westOK = true;
                                console.log("west is ok");
                            }
                        };
                        memberAutoLogin.send('{"email":"'+userEmail+'","password":"'+userPassword+'"}');
                    
                        memberAutoLogin2 = new IFrameXmlHttpRequest(easesite+"/resources/receiver.html");
                        memberAutoLogin2.withCredentials = true;
                        memberAutoLogin2.setRequestHeader("Accept", "application/json");
                        memberAutoLogin2.setRequestHeader("Content-Type", "application/json");
                        memberAutoLogin2.open('POST', easesite+"/user/login", true);
                        memberAutoLogin2.onreadystatechange=function() {
                            if (memberAutoLogin2.readyState==4 && memberAutoLogin2.status==200) {
                                console.log(memberAutoLogin2.responseText);
                                eastOK = true;
                                console.log("east is ok");
                            }
                        };
                        memberAutoLogin2.send('{"email":"'+userEmail+'","password":"'+userPassword+'"}');
                        
                        setInterval(function(){ 
                            if (westOK && eastOK) {
                                console.log("LOGGED IN TO BOTH");
                                //window.location = "/chooser"; 
                                
                                }
                            else {
                                console.log("STILL WAITING"); }
                        
                            }, 1000);
                    //}
                    
                }
                
                else if(isSpecialityCustomerWest){
                    if(site == westsite){
                        
                        if(url != "/user/login" && url!== undefined){        
                            window.location= url;  
                        }else if(url === "" || url ==="/"  ){
                            window.location= "/home";  
                        } 
                        else{
                            window.location= "/home";
                        }
                    }
                    else{
                            $('<iframe>', {
                            src: window.location.origin + "/logout",
                            id:  'myFrame',
                            frameborder: 0,
                            scrolling: 'no'
                            }).appendTo('body');

                        userEmail = $('[name="email-login"]').val();
                        userPassword = $('[name="password-login"]').val();
                    
                        memberAutoLogin = new IFrameXmlHttpRequest(westsite+"/resources/receiver.html");
                        memberAutoLogin.withCredentials = true;
                        memberAutoLogin.setRequestHeader("Accept", "application/json");
                        memberAutoLogin.setRequestHeader("Content-Type", "application/json");
                        memberAutoLogin.open('POST', westsite+"/user/login", true);
                        memberAutoLogin.onreadystatechange=function() {
                            if (memberAutoLogin.readyState==4 && memberAutoLogin.status==200) {
                                console.log(memberAutoLogin.responseText);
                                window.location = westsite+"/home";
                            }
                        };
                        memberAutoLogin.send('{"email":"'+userEmail+'","password":"'+userPassword+'"}');
                    
                    }
                }
                
                else if(isSpecialityCustomerEast){
                    
                    if(site == easesite){
                         if(url != "/user/login" && url!== undefined){        
                            window.location= url;  
                        }else if(url === "" || url ==="/"  ){
                            window.location= "/home";  
                        } 
                        else{
                            window.location= "/home";
                        }
                         //window.location = "https://t12046-s16686.sandbox.mozu.com/home";
                    }
                   
                    else{     
                            $('<iframe>', {
                            src: window.location.origin + "/logout",
                            id:  'myFrame',
                            frameborder: 0,
                            scrolling: 'no'
                            }).appendTo('body');

                            memberAutoLogin = new IFrameXmlHttpRequest(easesite+"/resources/receiver.html");
                            memberAutoLogin.withCredentials = true;
                            memberAutoLogin.setRequestHeader("Accept", "application/json");
                            memberAutoLogin.setRequestHeader("Content-Type", "application/json");
                            memberAutoLogin.open('POST', easesite+"/user/login", true);

                            memberAutoLogin.onreadystatechange=function() {
                                if (memberAutoLogin.readyState==4 && memberAutoLogin.status==200) {
                                    console.log(memberAutoLogin.responseText);
                                    window.location = easesite+"/home";
                                }
                            };
                            memberAutoLogin.send('{"email":"'+userEmail+'","password":"'+userPassword+'"}');
                    }
                    
                }
            });
        }
        
        /**
         * Show Login Error Api Messages
         * LOGIN = 3
         * FORGETPASSWORD = 4;
        **/
        function displayApiMessageLogin(a,b,c){
            showValidationMessages(LOGIN,a.message,"#b94a48");
        }
        
        /**
         * Show Reset password success message
        **/
        function displayResetPasswordMessage(a,b,c){
            showValidationMessages(FORGETPASSWORD,"Password reset link has been sent to your registered email address.","#0F0");
        }
        
        /**
         * Show resetpassword api error message.
        **/
        function displayApiMessageForgetPassword(a,b,c){
            showValidationMessages(FORGETPASSWORD,a.message.split(':')[1]+" this email address is not found.","#b94a48");
        }
        
        
    });
});








































