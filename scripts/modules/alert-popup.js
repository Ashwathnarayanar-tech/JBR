define([
    "modules/jquery-mozu",
    "hyprlive",
    "modules/backbone-mozu"], function($, Hypr, Backbone) {

        var AlertView = Backbone.MozuView.extend({
            templateName: "modules/alert-popup",
            additionalEvents: { 
                "click .fa-times-circle": 'closepopup'
            },
            closepopup: function(){
                this.model.set("subscriptionDialog", false);
                this.model.set("subscribeBtns", false);
                this.model.set("futureDialog", false);
                this.model.set("visible", false);
                if($(document).find(".overlay-for-complete-page").hasClass("overlay-shown"))
                    $(document).find(".overlay-for-complete-page").removeClass("overlay-shown");
                if($(document).find(".main-content").hasClass('is-loading'))
                    $(document).find(".main-content").removeClass("is-loading");
				if($(document).find('.addtocartoverlay').length>0)
					$(document).find('.addtocartoverlay').hide();
				$(document).find('.overlay-for-complete-page').removeClass('is-loading');	
                this.render(); 
            },
            fillmessage: function(dialogRef, message, callback){
                //$(document).find("[data-mz-alert]").removeClass();
                this.model.set("message", message);
                this.model.set("visible", true);
                if(dialogRef === "subscribe") {
                	this.model.set("subscribeBtns", true);
                } else if(dialogRef === "third-dailog") {
                    this.model.set("subscriptionDialog", true);
                }else if(dialogRef === "future-dailog") {
                    this.model.set("futureDialog", true);
                }    
                var me = this;
                this.render();
                $(document).find("[data-mz-alert]").addClass(dialogRef);
                $(document).find('.'+dialogRef+' .mz-btn-accept').on('click',function(e){
                    if(dialogRef == "second-dailog"){
                        me.removeCookie();
                    } 
                    callback(true); 
                });
                $(document).find('.'+dialogRef+' .mz-btn-reject').on('click',function(e){
                    if($(this).hasClass("mz-btn-backtosub")) {
                        me.model.set("subscriptionDialog", false);
                        me.model.set("subscribeBtns", false);
                        me.model.set("futureDialog", false);
                    }
                    callback(false);
                });
            },
            removeCookie:function(){
                $.removeCookie("isSubscriptionActive",{ path: '/' });
                if(typeof $.cookie("isSubscriptionActive") == "undefined") {
                    if($(window).width() < 768) {
                        $(document).find('#mb_cart').attr('href','/cart');
                    } else {
                        $(document).find('.mz-utilitynav a.mz-utilitynav-link-cart').attr('href','/cart');
                         $(document).find('.jb-minicart-checkout-container .cart-checkout-buttons').find('a').attr('href','/cart');
                        $(document).find('.jb-minicart-checkout-container .cart-checkout-buttons').find('#cartform').attr('action',require.mozuData('pagecontext').secureHost+'/checkout');
                    }
                }
            },
            render: function() {
                Backbone.MozuView.prototype.render.apply(this);
            }
        });
        
        var messageModel = Backbone.MozuModel.extend({});
        var messages = {};
        var alertView = new AlertView({
            el: $(".mz-alert-popup"),
            model: new messageModel(messages)
        });
        alertView.render();
        
        return{  
            AlertView: alertView
        };

    });