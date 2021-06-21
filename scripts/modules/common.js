function brontoGetCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

var brontoObj = {
	runs: 0,
	build: function (api) {
		var brontoPageType = JSON.parse(document.getElementById("data-mz-preload-pagecontext").innerHTML).pageType;
		var objToGet = 'cart';
		if (brontoPageType === 'confirmation' || brontoPageType === 'checkout')
			objToGet = 'order';
		var self = this;

		api.get(objToGet).then(function (resp) {
			//console.log(resp);
			if (window.brontoCart) {
				console.log("DELETING brontoCart");
				delete window.brontoCart;
				console.log(window.brontoCart);
			} else {
				//console.log("window.brontoCart does not exist yet");
			}
			var brontoMain = (objToGet === 'order' ? resp.data.items[0] : resp.data);
			var brontoItems = (objToGet === 'order' ? resp.data.items[0].items : resp.data.items);
			if (brontoItems.length > 0) {
				// console.log("building brontoCart");
				window.brontoCart = {
					"emailAddress" : brontoGetCookie("recordProxyUser"),
					"currency": brontoMain.currencyCode,
					"subtotal": brontoMain.subtotal ? brontoMain.subtotal.toFixed(2) : 0.00,
					"discountAmount": brontoMain.discountTotal ? brontoMain.discountTotal.toFixed(2) : 0.00,
					"taxAmount": brontoMain.taxTotal ? brontoMain.taxTotal.toFixed(2) : 0.00,
					"grandTotal": brontoMain.total ? brontoMain.total.toFixed(2) : 0.00,
					"orderId": (objToGet == 'cart' ? (brontoMain.orderId !== undefined ? brontoMain.orderId : "") : brontoMain.orderNumber),
					"cartUrl": location.href.indexOf('east') > -1 ? "https://east.jellybellyretailer.com/cart" : "https://west.jellybellyretailer.com/cart",
					"lineItems": []
				}; 
				for (var x = 0; x < brontoItems.length; x++) {
					var item = brontoItems[x];
					//console.log(item);
					window.brontoCart.lineItems.push({
						"sku": item.product.productCode,
						"name": item.product.name,
						"description": item.product.name,
						"category": "General",
						"other": "",
						"unitPrice": item.product.price.price ? item.product.price.price.toFixed(2) : 0.00,
						"salePrice": item.product.price.salePrice ? item.product.price.salePrice.toFixed(2) : 0.00,
						"quantity": item.quantity,
						"totalPrice": (item.product.price.price * item.quantity) ? (item.product.price.price * item.quantity).toFixed(2) : 0.00,
						"imageUrl": "https:" + item.product.imageUrl,
						"productUrl": (location.href.indexOf('east') > -1 ? "https://east.jellybellyretailer.com/p/" : "https://west.jellybellyretailer.com/p/") + item.product.productCode
					});
				}
				if (brontoPageType == "checkout")
					window.brontoCart.cartPhase = "SHIPPING_INFO";
				else if (brontoPageType == "confirmation")
					window.brontoCart.cartPhase = "ORDER_COMPLETE";
			} else {
				//console.log("not building or updating brontoCart");
				// do nothing, do not build the bronto cart
			}

			if (self.runs === 0) {
				//console.log(self.runs + " runs. Attaching bronto scripts.");
				var brParent = document.createElement('script');
				brParent.type = 'text/javascript';
				brParent.setAttribute("data-name", "__br_tm");
				brParent.innerHTML = "var _bsw = _bsw || []; _bsw.push(['_bswId', '0ddbdae0d8ed8de881a5920959ceb5e08170fa5efc78eea9850b7eb092fff579']); (function() { var bsw = document.createElement('script'); bsw.type = 'text/javascript'; bsw.async = true; bsw.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'js.bronto.com/c/aivlrxzna1c47pw74zt92o5ajgycfwkiyojg82btlvqg6v6vjq/0ddbdae0d8ed8de881a5920959ceb5e08170fa5efc78eea9850b7eb092fff579/s/b.min.js'; var t = document.getElementsByTagName('script')[0]; t.parentNode.insertBefore(bsw, t); })();";
				var zzz = document.getElementsByTagName('script')[0];
				zzz.parentNode.insertBefore(brParent, zzz);

				var brRec = document.createElement('script');
				brRec.type = 'text/javascript';
				brRec.setAttribute("data-bbaid", "b0839069-2cdd-4d5e-b43a-1456a09ba0c3");
				brRec.async = true;
				brRec.src = "https://cdn.bronto.com/bba/bba.js";
				var yyy = document.getElementsByTagName('script')[0];
				yyy.parentNode.insertBefore(brRec, yyy);
				self.runs++;
			} else {
				// do nothing, do not attach scripts again
				console.log(self.runs + " runs. Not attaching bronto scripts.");
				self.runs++;
			}
		}, function (e) {
			console.error(e);
		});
	}
};

var page =window.location.pathname.split('/').pop();
var PageLocation= !window.location.pathname.split("/")[2] ? "" : window.location.pathname.split("/")[2].toLowerCase();
if(PageLocation =="storelocator"  ){
    if (window.location.protocol == "https:") {
        var restOfUrl = window.location.href.substr(6);
        window.location = "http:" + restOfUrl; 
        } 
}
require([
    "modules/jquery-mozu", "underscore", "modules/api", 'modules/models-product', 'modules/minicart',
    'modules/cart-monitor', "hyprlive", "modules/backbone-mozu","modules/alert-popup",'modules/models-cart',"https://d3js.org/d3.v4.min.js",
    "shim!vendor/owl.carousel[jquery=jQuery]>jQuery",
    'shim!vendor/jquery-colorbox/jquery.colorbox[jquery=jQuery]'
], function($, _, api, ProductModels, MiniCart, CartMonitor, Hypr, Backbone,alertPopup,CartModels, d3, Cufon) {
    var ProductChallengeView = Backbone.MozuView.extend({
      templateName: 'modules/account-status',
      
       getRenderContext: function () {
            var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            var count=0;
            while(c.model.contacts.length>0){
                if(c.model.contacts[count]){
                    var surName = c.model.contacts[count].lastNameOrSurname.charAt(0);
                    if((surName=="1" || surName=="2" || surName=="3" || surName=="4" || surName=="5") && c.model.contacts[count].lastNameOrSurname.length==8){
                        count++;
                    }else if(c.model.contacts.length==1 && c.model.contacts[0].types.length == 2){
                        count++;
                    }
                    else{
                          c.model.contacts.splice(count,1);
                    }
                }else{
                    break;
                }
            }
            return c;
        }
  });     
         
var customers  = Backbone.MozuModel.extend({});
   $(document).ready(function(event){
	   brontoObj.build(api);
	   
	   $(document).on("click", ".brontocart-shipping-info, .brontocart-ship-method, .brontocart-billing, .brontocart-place-order", function(e) {
			console.log(e);
			if($(e.currentTarget).hasClass("brontocart-shipping-info")) {
				console.log("shipping info");
				window.brontoCart.cartPhase = "SHIPPING_METHOD";
			}
			if($(e.currentTarget).hasClass("brontocart-ship-method")) {
				console.log("shipping method");
				window.brontoCart.cartPhase = "BILLING";
			}
			if($(e.currentTarget).hasClass("brontocart-billing")) {
				console.log("billing");
				window.brontoCart.cartPhase = "ORDER_REVIEW";
			}
			if($(e.currentTarget).hasClass("brontocart-place-order")) {
				console.log("place order");
				window.brontoCart.cartPhase = "ORDER_SUBMITTED";
			}
			});
	   
	   var segmentArray = document.getElementById('segments').innerHTML;
       var segments = segmentArray.split(',');

        if(segments.indexOf('B2B-DISC-5PERCENT') > -1){
            var userContext = require.mozuData('user'); //JSON.parse(document.getElementById('data-mz-preload-user').innerHTML);
            if(require.mozuData('user').lastName != $.cookie("discountAcct")){
            $.colorbox({
                open : true,
                maxWidth : "100%",
                maxHeight : "100%",
                scrolling : false,
                fadeOut : 500,
                html : "<div style='padding: 30px;text-align:center;'><p>You qualify for a 5% discount. <br>Your discount will be shown in the Cart.</p><center><button id='close' style='order: none;color: white;padding: 7px 32px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;background-color:#008CBA;color:#fff;'>Okay, got it!</button></center>", 
                overlayClose : false,
                onComplete : function () {
                    $.cookie("discountAcct", userContext.lastName);
                $("#close").on('click',function() {
                  $.colorbox.close();
              });
            $('#cboxLoadedContent').css({
                background : "#ffffff"
            });
          }
          });
       }
     }

	$(document).on('click','[data-mz-action="logout"]', function(e) { 
        $.cookie("discountAcct", ""); 
        if(typeof $.cookie("isSubscriptionActive") != "undefined") {
            $.cookie("isSubscriptionActive", '', {path: '/', expires: -1});
            $.cookie("scheduleInfo", '', {path: '/', expires: -1});
            // empty cart
        }

    });
        //Logout functionality
        // if(!require.mozuData('user').isAuthenticated && !require.mozuData('pagecontext').isEditMode){
        //     // var domainName = "jellybellyretailer.com"; 
        //     // if(window.location.host.indexOf("mozu") !== -1){
        //     //     domainName = "sandbox.mozu.com";
        //     //     $.cookie("userData", '', {path: '/', expires: -1, domain: domainName });
        //     //     if(window.location.host.split(".")[0].split("-")[1] !== Hypr.getThemeSetting('themeLoginURL').split(".")[0].split("-")[1])
        //     //         window.location = Hypr.getThemeSetting('selectstore')+"?clearSession=yes";
        //     // }else{  
        //     //     $.cookie("userData", '', {path: '/', expires: -1, domain: domainName });
        //     //     if(window.location.host.indexOf('east') != -1 || window.location.host.indexOf('west') !==-1)
        //     //         window.location = Hypr.getThemeSetting('selectstore')+"?clearSession=yes";
        //     // } 
        //     // $.cookie("userData", '', {path: '/', expires: -1, domain: domainName });
        //     // if(window.location.host.split(".")[0].split("-")[1] !== Hypr.getThemeSetting('themeLoginURL').split(".")[0].split("-")[1])
        //     //         window.location = Hypr.getThemeSetting('selectstore')+"?clearSession=yes";         
        // } 
        /* v.r.s changes 
         * ensures edit-cookie is removed in unwanted pages  
        */
        var isCheckoutPage = require.mozuData("pagecontext").pageType == "checkout" ? true : false;
        if(!isCheckoutPage && typeof $.cookie("chktEdit") != "undefined") {
            $.cookie("chktSub",'',{path: '/',expires: -1});
            $.cookie("chktEdit",'',{path: '/',expires: -1});
        }
        
        // 5% modal implementation 
        
    function createVisualization(data, color) {
        var dataObj = data; /*_.find(data, function(category){
            return category.categoryId === categoryId;
        });*/
        var divId = data.div;

        $("#" + divId).empty();
        $("#" + divId).append("<h4>" + data.categoryName + "</h4>");
        var font1 = "12px";
        var min = 0;
        var max = dataObj.items[0].unitsSold;

        dataObj.items = dataObj.items.slice(0, 10);
        var ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        var scale = d3.scaleLinear();
        scale.domain([0, max]);
        scale.range([0, 350]);

        var xBase = 0;

        d3.select("#" + divId)
        .append("svg")
        .attr("width", 350)
        .attr("height", 300)
        .style("border", "2px solid #dddddd")
        .style("background", "#efefef")
        .selectAll("rect")
        .data(dataObj.items)

        .enter()
        .append("rect")
        .attr("width", 0)
        .attr("height", 7)
        .attr("y", function (d, i) {
            return (i * 25) + 17;
        })
        .attr("x", xBase)
        .attr("fill", color)

        .transition()
        .duration(2000)
        .attr("width", function (d, i) {
            return scale(d.unitsSold);
        });

        d3.select("#" + divId + " svg")
        .selectAll("a")
        //.selectAll("text")
        .data(dataObj.items)

        .enter()
        .append("a")
        .attr("href", function (d) {
            return "/p/" + d.sku;
        })
        .append("text")
        .on("touchstart", function(d) { location.href = "/p/" + d.sku; })
        .text(function (d) {
            var pname = d.productName;
            if (d.productName.length > 60)
                pname = d.productName.substring(0,59) + '...';
            return pname;
        })
        .style("font-size", font1)
        .attr("x", 3)
        .attr("y", function (d, i) {
            return (i * 25) + 15;
        });

        d3.select("#" + divId + " svg")
        .append("line")
        .attr("x1", xBase)
        .attr("y1", 260)
        .attr("x2", xBase + scale(max))
        .attr("y2", 260)
        .attr("stroke", "black")
        .attr("stroke-width", 3);

        d3.select("#" + divId + " svg")
        .selectAll(".tick")
        .data(dataObj.items)

        .enter()
        .append("text")
        .classed("tick", true)
        
        .attr("x", function (d) {
            return xBase + scale(d.unitsSold) + 3;
        })
        .attr("y", function (d, i) {
            return (i * 25) + 15;
        });

        d3.select("#" + divId + " svg")
        .selectAll(".tick2")
        //.data(ticks)
        .data(ticks)

        .enter()
        .append("text")
        .style("font-size", font1)
        .classed("tick2", true)

        .text(function (d) {
            return d;
        })
        .attr("x", function (d) {
            return xBase + scale(d * (max / 10)) - 12;
        })
        .attr("y", 280);

        d3.select("#" + divId + " svg")
        .selectAll("span")

        .data(["POPULARITY"])
        .enter()
        .append("text")
        .style("font-size", font1)
        .text(function (d) {
            return d;
        })
        .attr("x", 0)
        .attr("y", 300);
    }
    
    function createSVG(svgWidth,barWidth,paddingfSt,paddinglst,paddingmid,x){
        api.request('GET','/svc/data_visualizations').then(function(r){
            var count = 0;
            for(var i=0;i<r.length;i++){
                var first = 0,width = 0,y=0,ty = 0,rect = '',text = '';
                var color = ['#F03E35','#8B7CF2','#EB911C','#62C73A'];
				/* jshint ignore:start */
                var graph = '<svg xmlns="http://www.w3.org/2000/svg" width="'+svgWidth+'" height="435" style="background: rgb(255, 255, 255);border-radius: 10px;">'
                    +'<rect width="'+svgWidth+'" height="45" y="0" x="0" fill="'+color[i]+'"></rect>'
                    +'<text transform="translate(100)" y="30" x="'+x+'" fill="#fff" style="font-family: &quot;Trebuchet MS&quot;, Verdana, sans-serif;font-size: 14px;padding: 14px 0;color: #fff;border-radius: 8px 0 0;text-align: center;'
                    +'">'+r[i].categoryName+'</text>';
                var forIterater = r[i].items ? r[i].items.length >= 10 ? 10:r[i].items.length : 0;
                for(var j=0;j<forIterater;j++){
                    if(j===0){
                        first = r[i].items[j].unitsSold;
                        width = barWidth;
                        y = 75;
                        ty=67;
                    }else{
                        width = ((r[i].items[j].unitsSold)/first)*barWidth;
                        y+=32;
                        ty +=32;
                    }
                    count++;
                    var pname = r[i].items[j].productName; if(pname.length>59){ pname = pname.substring(0,59)+'...';}
                    rect += '<rect width="'+width+'" height="2" y="'+y+'" x="'+x+'" fill="'+color[i]+'"><animate attributeName="width" from="0" to="'+width+'" dur="2s" fill="freeze"/></rect>';
                    text += '<a href="/p/'+r[i].items[j].sku+'" style="font-size: 12px; font-family: &quot;Trebuchet MS&quot;, Verdana, sans-serif;">'
                        +'<text x="'+x+'" y="'+ty+'" style="font-size: 12px;font-family: Trebuchet MS,Verdana,sans-serif;color: #e00e0e !important;'
                        +'display: inline-block;">'+pname+'</text></a>';
                }
                graph+=rect+text;
                graph += '<g><rect class="node" x="0" y="385" width="'+svgWidth+'" height="50" fill="#777575" style="background: #777575;color: #fff;border-radius: 0 0 8px 8px;"></rect>'
                    +'<text transform="translate(100)" class="tick2" x="40" y="405" fill="#fff" style="font-family: &quot;Trebuchet MS&quot;, Verdana, sans-serif;font-size: 12px;padding: 8px 0 0 8px; text-align:center;" >POPULARITY</text>'
                    +'<text class="tick2" x="10" y="425" fill="#fff" style="font-size: 11px; padding: '+paddingfSt+'; font-family: &quot;Trebuchet MS&quot;, Verdana, sans-serif;"></text>'
                    +'<text class="tick2" x="35" y="425" fill="#fff" style="font-size: 11px; padding:'+paddingmid+'; font-family: &quot;Trebuchet MS&quot;, Verdana, sans-serif;">1</text>'
                    +'<text class="tick2" x="68" y="425" fill="#fff" style="font-size: 11px;padding: '+paddingmid+';font-family: &quot;Trebuchet MS&quot;, Verdana, sans-serif;">2</text>'
                    +'<text class="tick2" x="102.99999999999997" y="425" fill="#fff" style="font-size: 11px; padding: '+paddingmid+'; font-family: &quot;Trebuchet MS&quot;, Verdana, sans-serif;">3</text>'
                    +'<text class="tick2" x="138" y="425" fill="#fff" style="font-size: 11px; padding: '+paddingmid+'; font-family: &quot;Trebuchet MS&quot;, Verdana, sans-serif;">4</text>'
                    +'<text class="tick2" x="173" y="425" fill="#fff" style="font-size: 11px; padding: '+paddingmid+'; font-family: &quot;Trebuchet MS&quot;, Verdana, sans-serif;">5</text>'
                    +'<text class="tick2" x="207.99999999999994" y="425" fill="#fff" style="font-size: 11px; padding: '+paddingmid+'; font-family: &quot;Trebuchet MS&quot;, Verdana, sans-serif;">6</text>'
                    +'<text class="tick2" x="242.99999999999997" y="425" fill="#fff" style="font-size: 11px; padding: '+paddingmid+'; font-family: &quot;Trebuchet MS&quot;, Verdana, sans-serif;">7</text>'
                    +'<text class="tick2" x="278" y="425" fill="#fff" style="font-size: 11px; padding: '+paddingmid+'; font-family: &quot;Trebuchet MS&quot;, Verdana, sans-serif;">8</text>'
                    +'<text class="tick2" x="313" y="425" fill="#fff" style="font-size: 11px; padding: '+paddingmid+'; font-family: &quot;Trebuchet MS&quot;, Verdana, sans-serif;">9</text>'
                    +'<text class="tick2" x="348" y="425" fill="#fff" style="font-size: 11px; padding: '+paddinglst+'; font-family: &quot;Trebuchet MS&quot;, Verdana, sans-serif;">10</text></g>'    
                    +'</svg>';
                $(document).find('.mz-cms-col-6-12').eq(i).find('svg,h4').remove();
                $(document).find('.mz-cms-col-6-12').eq(i).html(''); 
                $(document).find('.mz-cms-col-6-12').eq(i).append(graph);
                /* jshint ignore:end */
            }
            $(document).find('#data-visualizations').find('.mz-cms-col-6-12').find('a').each(function(i,v){
                var cate = $(this).parents('svg').find('.catName').text();
                var pname = $(this).find('text').text(); 
                $(this).attr("onclick","ga('send',{'hitType':'event','eventCategory':'checkout top sellers','eventAction':'click','eventLabel':'"+cate+' '+pname+"' });");
            });
        });
    }

    if (require.mozuData('pagecontext').cmsContext.page.path === 'home' || require.mozuData('pagecontext').cmsContext.page.path === 'rapid-order'){
        $("#data-visualizations").insertAfter("#data-visualizations-here");
        $('#data-visualizations').append('<div style="background-color: #fff;padding: 5px;width: 88%;margin: 0 auto;margin-bottom: 21px;border-radius: 8px;text-align: center;padding: 7px 6px;font-size: 16px;"><h2 align="center" style="color: #1384B5;font-size: 22px;">Check out our Top Sellers!</h2><p style="padding: 0 23px;">You asked us to provide more info about which products were selling, and here it is!  If you want more info, let us know.  In the meantime, just click on a product that interests you.</p></div>');
        $('#data-visualizations').append('<div class="mz-cms-row" style="margin: 44px 0;"><div class="mz-cms-col-6-12" id="dv1" width="50%" style="text-align: center;">RETRIEVING DATA...</div><div class="mz-cms-col-6-12" id="dv2" width="50%" style="text-align: center;">RETRIEVING DATA...</div></div><div class="mz-cms-row"><div class="mz-cms-col-6-12" id="dv3" width="50%" style="text-align: center;">RETRIEVING DATA...</div><div class="mz-cms-col-6-12" id="dv4" width="50%" style="text-align: center;">RETRIEVING DATA...</div></div>');       
    
        if($(window).width()>1023){  
            createSVG(374,350,'0px 14.5px 0px 12px','0px 0px 0px 14.5px','0px 14.5px',12);
        }else if($(window).width()>767){
            createSVG(340,330,'0px 13px 0px 6px','0px 4px 0px 13px','0px 13px',6);  
        }else{
            api.request('GET', '/svc/data_visualizations').then(function(res){
                var dvcolors = ['#F03E35','#8B7CF2','#EB911C','#62C73A'];
                var dvi = 0;
                _.each(res, function(item) {
                    createVisualization(item, dvcolors[dvi]);
                    dvi = dvi + 1;
                });
            }); 
        }
    }
        //var domainName = "jellybellyretailer.com";
        // if(window.location.host.indexOf("mozu") !== -1){
        //     domainName = "sandbox.mozu.com";
        //     $("a[data-mz-action='logout'],.comltlogout,.pop-up-two .continue").click(function(e){  
        //         //$.cookie("userData", null, { path: '/', domain: domainName}); 
        //         $.cookie("userData", '', {path: '/', expires: -1, domain: domainName });
        //         if(window.location.host.split(".")[0].split("-")[1] !== Hypr.getThemeSetting('themeLoginURL').split(".")[0].split("-")[1]){
        //             e.preventDefault();    
        //         }  
        //       //  $.cookie("userData", null, { path: '/', domain: domainName}); 
        //       //$.cookie("userData", '', {path: '/', expires: -1, domain: domainName });
        //         // var cookies = $.cookie();
        //         // for(var cookie in cookies) {
        //         //   $.removeCookie(cookie);
        //         // }
        //         $.ajax({   
        //             method: 'GET',   
        //             url: '../../logout',   
        //             complete: function() {
                        
        //             // if(window.location.host.split(".")[0].split("-")[1] !== Hypr.getThemeSetting('themeLoginURL').split(".")[0].split("-")[1])
        //             //     window.location = Hypr.getThemeSetting('selectstore')+"?clearSession=yes";     
        //               //window.location = "https://t12046-s16686.sandbox.mozu.com/select-store?clearSession=yes";
                      
        //               location.reload();
        //             }  
        //         });   
        //     }); 
        // }else{      
        //     $("a[data-mz-action='logout']").click(function(e){  
        //       // $.cookie("userData", null, { path: '/', domain: domainName});
        //         $.cookie("userData", '', {path: '/', expires: -1, domain: domainName });
        //         if(window.location.host.indexOf('east') != -1 ||  window.location.host.indexOf('west') !=-1){
        //             e.preventDefault();    
        //         } 
                
        //      //   $.cookie("userData", null, { path: '/', domain: domainName}); 
        //       $.cookie("userData", '', {path: '/', expires: -1, domain: domainName });
        //         var cookies = $.cookie();
        //         for(var cookie in cookies) {
        //           $.removeCookie(cookie);
        //         }
        //         $.ajax({   
        //             method: 'GET',    
        //             url: '../../logout',   
        //             complete: function() { 
        //             if(window.location.host.indexOf('east') != -1 || window.location.host.indexOf('west') !==-1)
        //             window.location = Hypr.getThemeSetting('selectstore')+"?clearSession=yes";
        //             //window.location = "https://t12046-s16686.sandbox.mozu.com/select-store?clearSession=yes";
        //             }  
        //         }); 
        //     }); 
        // }
        $('[data-mz-action="logout"]').each(function() {
            var el = $(this);
 
            //if were in edit mode, we override the /logout GET, to preserve the correct referrer/page location | #64822
            if (require.mozuData('pagecontext').isEditMode) {

                el.on('click', function(e) { 
                    e.preventDefault();
                    $.ajax({
                        method: 'GET',
                        url: '../../logout',
                        complete: function() { location.reload(); }
                    });
                });
            }

        });
       
      // SBRID05  address selection
      /* if(require.mozuData('pagecontext').isEditMode === false){
            if (window.location.pathname.indexOf('/accountvalidation') != -1) {
                sessionStorage.removeItem('adressid');
                if($.cookie('adressid')){
                    $.removeCookie('adressid');
                }
            } 
            else if(window.location.pathname.indexOf('/checkout') != -1 && !sessionStorage.adressid){ 
                window.location="/logout"; 
            }
            else if($.cookie('adressid') === undefined){
                window.location="/logout";     
            } 
        } 
  
       
    if(window.location.pathname== "/accountvalidation") { 
        $('.mobile-menu').hide();   
        var customer;
        api.request('get','api/commerce/customer/accounts/'+ require.mozuData('user').accountId ).then(function(resp){
            customer=resp;
            window.customer=customer;
            if(customer !== undefined ){ 
                var productchallengeView = new ProductChallengeView({
                    el: $('#acc'), 
                    model: new customers (customer)  
                });
                $('#loading').hide();
                productchallengeView.render();
            }
            $("#addressproceed").prop('disabled', true);
            $("#addressproceed").css('background','grey');
            $(".addr-select").change(function(){
                if($(this).val() !== "0"){
                    $("#addressproceed").prop('disabled', false); 
                    $("#addressproceed").css('background','#1381b5');
                } else{
                    $("#addressproceed").prop('disabled', true); 
                    $("#addressproceed").css('background','grey');
                }
            });
                
        });  
        
    }  */
    
  
    function calculateLimits(acc,resp){
        var temphtml="<figure class='fig-all'><img src='../../resources/images/JB_logo2.png' alt='' /></figure><figure class='close-fig'><img src='../../resources/images/close.jpg' alt='Close'/></figure><div class='account-all'>";
        var JBLimit;
        var JBBalance;  
        var JBUsage; 
        JBLimit=resp.Limit;
        JBBalance=resp.Available;  
        JBUsage=JBLimit-JBBalance; 
        if(parseFloat(JBUsage)<0){
            var a=JBUsage.toString();
            var b=a.substr(1,a.length-1);
            JBUsage='-$'+parseFloat(b).toFixed(2);
        }else{
            JBUsage='$'+parseFloat(JBUsage).toFixed(2);
        
        }
        if(resp.AccountServiceLevel.toLowerCase() =="c"){
            
            temphtml+='<p>Thanks for logging in.</p>';
            temphtml+='<p class="msg-c">Here’s what your account standing looks like:</p>';
            temphtml+='<p class="credits_limit"><span>Jelly Belly Credit Limit</span><span>$'+parseFloat(JBLimit).toFixed(2)+'</span></p>';
            temphtml+='<p class="credits_used"><span>Jelly Belly Credit Used</span><span>'+JBUsage+'</span></p>';
            temphtml+='<p class="credits_available"><span>Jelly Belly Credit <b>Available</b></span><span class="avail">$'+parseFloat(JBBalance).toFixed(2)+'</span></p>';
            temphtml+="<button handle-login class='bucket-btn continue-button'>Continue Shopping</button>";
            temphtml+='<p class="asl-msg2">Remember that orders over <b>$200 ship for free!</b></p></div>';
           
        }
        else if(resp.AccountServiceLevel.toLowerCase() =="d"){
            temphtml+='<p>Thanks for logging in.</p>';
            temphtml+='<p>Please be aware that you are close to your JBCC Credit limit:</p>';
            temphtml+='<p class="credits_limit"><span>Jelly Belly Credit Limit</span><span>$'+parseFloat(JBLimit).toFixed(2)+'</span>';
            temphtml+='<p class="credits_used"><span>Jelly Belly Credit Used</span><span>'+JBUsage+'</td></tr>';
            temphtml+='<p class="credits_available"><span>Jelly Belly Credit <b>Available</b></span><span class="avail">$'+parseFloat(JBBalance).toFixed(2)+'</span></p>';
            temphtml+="<button handle-login class='bucket-btn continue-button'>Continue Shopping</button>";
            temphtml+='<p  class="asl-msg" >Feel free to place your order, though it may go on hold pending payment. If you have questions, you may call Accounts Receivable (707-399-2309) M-F, 7am-5pm PT.</p></div>';
           
        }
        else if(resp.AccountServiceLevel.toLowerCase() =="e"){
            temphtml+='<p>You have been logged in.</p>';
            temphtml+='<p class="msg-e">Unfortunately, we'+'re not able to accept an order from you at the moment. Please call Accounts Receivable at 707-399-2309 (M-F, 7am-5pm PT) to discuss options.</p>';
            temphtml+='<p class="credits_limit"><span>Jelly Belly Credit Limit</span><span>$'+parseFloat(JBLimit).toFixed(2)+'</span></p>';
            temphtml+='<p class="credits_used"><span>Jelly Belly Credit Used</span><span>'+JBUsage+'</span></p>';
            temphtml+='<p class="credits_available"><span>Jelly Belly Credit <b>Available</b></span><span class="avail">$'+parseFloat(JBBalance).toFixed(2)+'</span></p>';
            temphtml+="<button class='acc-close continue-button' closepop >Close</button></div>";
     
        }
       
        return temphtml; 
    }  
        
        function JBworkflow(resp){  
          var JBLimit=0,JBBalance=0,JBUsage=0,bucketcin;  
           if(resp.AccountServiceLevel.toLowerCase()=="a"){   
            var bucketcinfo="<figure class='a-continue'><img src='../../resources/images/JB_logo2.png' alt='' /></figure><figure class='close-fig'><img src='../../resources/images/close.jpg' alt='Close'/></figure><div class='account-a'><p>Thanks for logging in.</p>";
                bucketcinfo+="<p>Your order today must be paid with a credit card and will be shipped ASAP.  If you have questions, feel free to call Customer Service (800-323-9380) or Accounts Receivable (707-399-2309) M-F, 7am-5pm PT.</p></div><button handle-login class='bucket-btn continue-button'>Continue Shopping</button>";
            $(".pop-acc").html(bucketcinfo);
             $(".addr-pop-up, .pop-acc").show();
           }  
           else if(resp.AccountServiceLevel.toLowerCase()=="b" || resp.AccountServiceLevel.toLowerCase()=="-"){
                var bucketb="<figure class='fig-b'><img src='../../resources/images/JB_logo2.png' alt='' /></figure><figure class='close-fig'><img src='../../resources/images/close.jpg' alt='Close'/></figure><div class='account-b'><p>You have been logged in.</p><p>Unfortunately, we're not able to accept an order from you at the moment. Please call Accounts Receivable at 707-399-2309 (M-F, 7am-5pm PT) to discuss options.</p></div>";
                bucketb+="<button class='acc-close continue-button' closepop >Close</button>";
                $(".pop-acc").html(bucketb);
                 $('<iframe style="display:none">', {
                src: window.location.origin + "/logout",
                id:  'myFrame', 
                display: 'none',  
                frameborder: 0, 
                scrolling: 'no' 
                }).appendTo('body');
                $(".addr-pop-up, .pop-acc").show(); 
                
            }else if(resp.AccountServiceLevel.toLowerCase()=="c"){   
              
                bucketcin=calculateLimits(resp.AccountServiceLevel,resp);
                $(".pop-acc").html(bucketcin);
             
                $(".addr-pop-up, .pop-acc").show();
                 
            
            }else if(resp.AccountServiceLevel.toLowerCase()=="d"){
                var bucketdinfo=calculateLimits(resp.AccountServiceLevel,resp);
                $(".pop-acc").html(bucketdinfo);
                $(".addr-pop-up, .pop-acc").show();
               
            }else if(resp.AccountServiceLevel.toLowerCase()=="e"){ 
                var bucketeinfo=calculateLimits(resp.AccountServiceLevel,resp);
                $(".pop-acc").html(bucketeinfo);
                $(".addr-pop-up, .pop-acc").show();
                          
            }
   }
   

    $(document).on('click','.proceed', function (e) {  
        $("#addressproceed").prop('disabled', true);
        $("#addressproceed").css('background','grey');
        $('#loading').show();
        var addressid,accountid,erpcustomernumber;
        if($('.addr-select' ).length>0){
            addressid = $('.addr-select option:selected').attr('addressid');
            accountid = $('.addr-select option:selected').attr('accountid');
            erpcustomernumber = $('.addr-select option:selected').attr('lastname');
        }else if($('.one-address' ).length>0){
            addressid = $('.one-address' ).attr('addressid');
            accountid = $('.one-address' ).attr('accountid');
            erpcustomernumber = $('.one-address' ).attr('lastname');
        }
 
        $(document).on('click','.bucket-btn',function(){
            sessionStorage.setItem("adressid",addressid);
            $.cookie("adressid",addressid);
            $.cookie("erpnumber",erpcustomernumber);
            window.location= "/home";
        }).on('click','.acc-close',function(e){
            window.location="/logout";
        }).on('click','.close-fig',function(){
            $('.addr-pop-up').hide();
        });
        
/*        $(".addr-pop-up").on('click',function(){
        // $(this).children(".wrapper_email").toggle(); 
        }).on('click','.pop-acc',function(e) { 
            e.stopPropagation();
        }).on('click','.',function(e){
            sessionStorage.setItem("adressid",addressid);
            $.cookie("adressid",addressid);
            window.location= "/home"; 
        }).on('click','.pop-login',function(e) {
            window.location="/logout";
        }).on('click','.acc-close',function(e){
            window.location="/logout";
        });*/
        api.request('GET','/lookup/' + addressid + '/' + accountid + '/'+ erpcustomernumber).then(function(resp) {
        //api.request('GET','/lookup/' + addressid + '/' + accountid).then(function(resp) {
        if(resp){
            $('#loading').hide();
            $("#addressproceed").prop('disabled', false);
            $("#addressproceed").css('background','rgb(19, 129, 181)');
            api.action('cart','empty');
        }
        JBworkflow(resp);   
        //  sessionStorage.setItem('user', JSON.stringify(resp));
        // East and west site address filter
        /*var sites=[];
        var segments=window.customer.segments;
        for(var i=0;i<segments.length;i++){
        sites.push(segments[i].code);
        }
        if(sites.indexOf(resp.Site) !== -1){
        JBworkflow(resp);      
        }else{
        if(resp.Site === "B2BEAST"){
        $('.site-error').text('Please Select East address');
        }else if(resp.Site === "B2BWEST"){
        $('.site-error').text('Please Select West address');
        
        }
        }*/
        
        });
    });       
       /* $(document).on('click','#add-to-cart.jb-tealium-trigger', function(e) {
            e.preventDefault();
            console.log($(this).parents().hasClass('mz-l-stack-section'));
            var qty;
            if($(this).parents().hasClass('mz-l-stack-section')) {
                qty = $('#quantity').val();
            } else {
                qty = $(this).parents('.mz-productlist-item').find('#quantity').val()
            }
            console.log(qty);
        });*/
        
         /*
         * Newsaletter auto popup based on coockies value.
         * Newsletter popup on clicking email link in social network page 
         */
    $(document).ready(function(){
        /*
        $(".autoclickable-btn").trigger('click');   
        $("#pre-selectchecked" ).attr('checked',true); 
        $(".mz-shipmethod").trigger('click');    
*/
        // $('.autoclickable-btn').click(function(event, wasTriggered) {
        // if (wasTriggered) {
        // $(".mz-shipmethod").trigger('click');   
        // }  
        // });

// $('button').trigger('click', true);
 
//         $('.addr-select').click(function(){  
//             alert('abnbmb');       
//         }); 
    
      
      
 /*   $('.add-fm li').each(function(index){
       var a=$('.add-fm li')[index];
        var adrnum=parseInt(a.find('.addr-filt').text());
        if(parseInt(a.find('.addr-filt').text())===-9999960){
          a.hide();  
        }
    });
    */
    
   // $('.addr-select').click(function(){
       // $('.option01').click(function(){ 
         //   $(this).find()
         
      //  });
   // });
      
     
     
     
 //crosssellll     
                     /*     var owlArtThump = $('.mz-productlist-carousel ul');
                    owlArtThump.owlCarousel({
                        loop:true,
                        nav:true,
                        margin:2,
                        dots:false,
                        responsiveClass:true,
                        responsive:{
                            0:{
                                items:1
                            },
                            400:{
                                items:3
                            },
                            600:{
                                items:4
                            },
                            1000:{
                                items:5
                            }
                        }
                    });*/
            
    // timeout expire
    
        var anonymous = require.mozuData('user').isAnonymous;
        var authUser = require.mozuData('user').isAuthenticated;
        var pop = $('.pop-up-one').is(':hidden');
        if(authUser){
        
            
            var IDLE_TIMEOUT = 15;
            var idleTime = 0;
            var countDownSec = 60;
            var countDownMin;
            var count;
            var idleInterval = setInterval(timerIncrement, 60000); 
           
            $(this).mousemove(function (e) {
                if($('.pop-up-one').is(':hidden'))
                idleTime = 0;
            });
            $(this).click(function (e) {
                if($('.pop-up-one').is(':hidden'))
                idleTime = 0;
            });
            $(this).keypress(function (e) {
                if($('.pop-up-one').is(':hidden'))
                idleTime = 0;
            });
            
        }
            $('.pop-up-one .continue').on('click',function(){
               $('.pop-up-one').hide();
                idleTime=0;
                clearInterval(count);
            });
            
            $('.pop-up-two,  .inactivity-button').on('click',function(){
                $('.pop-up-two .pop-timer').hide();
                // $.ajax({   
                //     method: 'GET',    
                //     url: '../../logout',   
                //     complete: function() {
                //         if(window.location.host.split(".")[0].split("-")[1] !== Hypr.getThemeSetting('selectstore').split(".")[0].split("-")[1])
                //             window.location = Hypr.getThemeSetting('themeLoginURL')+"?clearSession=yes";        
                //         }  
                // });
                window.location="/logout";
            });
             
        function timerIncrement() {
            idleTime = idleTime + 1;
            // console.log(idleTime);
            if (idleTime ==10 ) {  
                countDownMin=4;
                countDownSec=60;
                $('.pop-up-one').show();
                count = setInterval(countDown,1000);
                
            }else if(idleTime >= IDLE_TIMEOUT){
                $('.pop-up-one').hide();
                $('.pop-up-two').show();
                clearInterval(count);
               //var logout= setTimeout(function(){
                 //  $('.pop-up-two').hide();
                  // window.location="/logout";
              // }
               //    , 1000);
                
                
            }
        }
          
        function countDown(){
            countDownSec = countDownSec-1;
            //countDownMin-- ;
            if(countDownSec === 0){
               countDownSec=59;
               countDownMin-- ;
            }
           countDownSec = countDownSec <= 9 ? "0"+countDownSec:countDownSec;
            $('.countdown').text(countDownMin+":"+ countDownSec);
        }    
        // assume for now this is a US visitor
        
        var $userAgent = '';
        $(".overlay").click(function(){
            $(".gridder-list").find(".jb-add-to-cart").show();
            if( $(this).parent().hasClass('selectedItem')){
                $(this).parent().find('.jb-add-to-cart').hide();
            }else{
                $(".gridder-list").find(".jb-add-to-cart").show();
            }
        });
        //To detect OS //
        $(".jb-center-logo-img").on("click", function(event){           
            var OSName = "Unknown";
            if (window.navigator.userAgent.indexOf("Windows NT 10.0") != -1) OSName="Windows 10";
            if (window.navigator.userAgent.indexOf("Windows NT 6.3") != -1) OSName="Windows 8.1";
            if (window.navigator.userAgent.indexOf("Windows NT 6.2") != -1) OSName="Windows 8";
            if (window.navigator.userAgent.indexOf("Windows NT 6.1") != -1) OSName="Windows 7";
            if (window.navigator.userAgent.indexOf("Windows NT 6.0") != -1) OSName="Windows Vista";
            if (window.navigator.userAgent.indexOf("Windows NT 5.1") != -1) OSName="Windows XP";
            if (window.navigator.userAgent.indexOf("Windows NT 5.0") != -1) OSName="Windows 2000";
            if (window.navigator.userAgent.indexOf("Mac")!=-1) OSName="Mac/iOS";
            if (window.navigator.userAgent.indexOf("X11")!=-1) OSName="UNIX";
            if (window.navigator.userAgent.indexOf("Linux")!=-1) OSName="Linux";
            
            //alert('Your OS is: ' + OSName);
            //To detect Browser and Version //
            var nVer = window.navigator.appVersion;
            var nAgt = window.navigator.userAgent;
            var browserName  = window.navigator.appName;
            var fullVersion  = ''+parseFloat(window.navigator.appVersion); 
            var majorVersion = parseInt(window.navigator.appVersion,10);
            var nameOffset,verOffset,ix;
            
            // In Opera 15+, the true version is after "OPR/" 
            if ((verOffset=nAgt.indexOf("OPR/"))!=-1) {
            browserName = "Opera";
            fullVersion = nAgt.substring(verOffset+4);
            }
            // In older Opera, the true version is after "Opera" or after "Version"
            else if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
            browserName = "Opera";
            fullVersion = nAgt.substring(verOffset+6);
            if ((verOffset=nAgt.indexOf("Version"))!=-1) 
            fullVersion = nAgt.substring(verOffset+8);
            }
            // // In MSIE, the true version is after "MSIE" in userAgent
            // else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
            // browserName = "Microsoft Internet Explorer";
            // fullVersion = nAgt.substring(verOffset+5);
            // }
            // In Chrome, the true version is after "Chrome" 
            else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
            browserName = "Chrome";
            fullVersion = nAgt.substring(verOffset+7);
            }
            // In Safari, the true version is after "Safari" or after "Version" 
            else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
            browserName = "Safari";
            fullVersion = nAgt.substring(verOffset+7);
            if ((verOffset=nAgt.indexOf("Version"))!=-1) 
            fullVersion = nAgt.substring(verOffset+8);
            }
            // In Firefox, the true version is after "Firefox" 
            else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
            browserName = "Firefox";
            fullVersion = nAgt.substring(verOffset+8);
            }
            // In most other browsers, "name/version" is at the end of userAgent 
            else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
            (verOffset=nAgt.lastIndexOf('/')) ) 
            {
            browserName = nAgt.substring(nameOffset,verOffset);
            fullVersion = nAgt.substring(verOffset+1);
            if (browserName.toLowerCase()==browserName.toUpperCase()) {
            browserName = window.navigator.appName;
            }
            }
            // trim the fullVersion string at semicolon/space if present
            if ((ix=fullVersion.indexOf(";"))!=-1)
            fullVersion=fullVersion.substring(0,ix);
            if ((ix=fullVersion.indexOf(" "))!=-1)
            fullVersion=fullVersion.substring(0,ix);
            
            majorVersion = parseInt(''+fullVersion,10);
            if (isNaN(majorVersion)) {
            fullVersion  = ''+parseFloat(window.navigator.appVersion); 
            majorVersion = parseInt(window.navigator.appVersion,10);
            }            var a=window.navigator.appVersion;
           var b=a.split(' ');
           if(b[b.length - 1]=="Edge/12.10240" ){
               var c =b[b.length - 1].split('/');
               browserName = c[0];
                fullVersion = c[1];
               
           } 
           if(browserName != "Firefox"){
                if((/MSIE/i).test(window.navigator.userAgent)===true||(/rv/i).test(window.navigator.userAgent)===true){
                    var keep = window.navigator.appVersion;
                   
                    var x = keep.split(';');
                    var y = x[x.length-1].split(")");
                    var z = y[0].split(":");
                    fullVersion = z[1];
                    $userAgent='Internet Explorer';
                }  
            }
         
            // trim the fullVersion string at semicolon/space if present
            if ((ix=fullVersion.indexOf(";"))!=-1)
            fullVersion=fullVersion.substring(0,ix);
            if ((ix=fullVersion.indexOf(" "))!=-1)
            fullVersion=fullVersion.substring(0,ix);
                majorVersion = parseInt(''+fullVersion,10);
            if (isNaN(majorVersion)) {
            fullVersion  = ''+parseFloat(window.navigator.appVersion); 
            majorVersion = parseInt(window.navigator.appVersion,10);
            } 
   
         //$(".jb-userdetails").show();
            $('#osview').append('OS is: ' + OSName);
            if( $userAgent === 'Interet Explorer'){
                $('#osview2').append('Browser name: '+$userAgent + ' Version '+fullVersion+'<br>');    
            }else{
            $('#osview2').append('Browser name: '+browserName + ' Version '+fullVersion+'<br>');}
            $( this ).off(event);  
       
        });
        
        //     $.getJSON("//jsonip.com/?callback=?", function (data) {
        // //alert("Your ip: " + data.ip);
        // $('#osview3').append('IP Address: '+ data.ip );
        // });
        
    //     $(".img-overlay").css('display','none');
 
            $('.toggleModal').on('click', function (e) {
            e.stopPropagation();
            $('.modal').addClass('active');
            $(document).find('#cboxOverlay').show();
            $(document).find('body').addClass("haspopup");
                    //$(this).fadeOut(300);
        });
            $("#close-popup").click(function(e){
                $('.modal').removeClass('active');  
                $(document).find('#cboxOverlay').hide();
                $(document).find('body').removeClass("haspopup");
            });
            $(document).on('click','#cboxOverlay', function(e){
                var target = $(e.target)[0];
                if($(target).parents('.modal').length) return;
                //e.stopPropagation();
                //do your hiding stuff
                $(document).find('#cboxOverlay').hide();
             $('.modal').removeClass('active');
            });
            $(".jb-product-description").text(function(index, currentText) {
            return currentText.substr(0, 250); 
            });
            $("#gridder-list .multiline").text(function(index, currentText) {
                return currentText.substr(0, 200) + '...';
            });
     /*   $('#emailConnectPage').on('click', function(){
            NewsLetter.JB.NewsletterSignup.emailFormFooterLinkClicked();
        });*/
        /**
         * Add click event for PDP page accordian.
         * Functionality: Open clicked accordian, if its closed and close other.
         **/
         $(document).on('click','#ReviewHeader a[href="#ReviewHeader"]',function(e){
            $('#accordian li').removeClass('active');
            $("#accordian ul ul").slideUp();
            $('.comment-section').parent().addClass("active");
            $('.comment-section').slideDown();
            $("html, body").animate({scrollTop:  $("#ReviewsContainer").offset().top }, 1000);
            
        }) ;
         
        $(document).on('click','#accordian h3', function() {
              if(!$(this).parent().hasClass("active")){
                  $('#accordian li').removeClass('active');
                  $(this).parent().addClass("active");
                  $("#accordian ul ul").slideUp();
                if(!$(this).next().is(":visible"))
                {
                  $(this).next().slideDown();
                }
              } else{
                  $('#accordian li').removeClass('active');
                  $("#accordian ul ul").slideUp();
              }
          });
    
         if($('#mobile_show_search')){
             
             $('#mobile_show_search').click(function(e){
                $('.jb-mobile-search').slideToggle(); 
                $('#page-content').toggleClass('mobile-search-content','');
                $(document).find('.tt-input').filter(':visible').focus();
             });
             $("#jb-mobile-search-close").click(function(e){
                console.log(this);
                $('.jb-mobile-search').slideUp(); 
                $(document).find('#mobile_show_search').filter(':visible').focus();
                $('#page-content').removeClass('mobile-search-content','');
                });
         }
         
        /*  $('.jb-mobile-main-menu-items').click(function(e) {
              e.preventDefault();
              
              
          });*/
     // Footer mobile Main
       $('.mz-column .mz-mobile > .mz-footer-title').click(function(event) {
          if (!$(this).hasClass("mz-footer-current")) {
            $('.mz-column > ul.mz-footer-links').slideUp();
             $('.mz-columnfull > ul.mz-footer-links').slideUp();
              $('.mz-columnfull .datalink > li > .mz-footer-links').slideUp();
             $('.mz-columnfull .datalink > li > .mz-footer-links').slideUp();
            $(".mz-datlinktoogle").html("+");
            $(this).parent().next().slideDown();
            $('.mz-footer-current').removeClass('mz-footer-current');
            $(this).addClass('mz-footer-current');
            return false;
          }
          else {
             
            //event.preventDefault();
          }
        });
      
      // Footer Mobile Sub
        $('.mz-columnfull .mz-mobile > .mz-footer-title').click(function(event) {
            
          if (!$(this).hasClass("mz-footer-current")) {
              event.preventDefault();
              $('.mz-column > ul.mz-footer-links').slideUp();
              //$('.mz-columnfull .datalink > li > .mz-footer-links').slideUp();
                $(this).parent().next().slideDown();
                $('.mz-footer-current').removeClass('mz-footer-current');
            $(this).addClass('mz-footer-current');
          } else {
           event.preventDefault();
         
          
          }
          
        });
        // Vending page Form
        $('#formtrigger').click(function () {
        $('#fundraisingForm').fadeIn();
   });

   
      // Footer Third Level
        $('.mz-columnfull .datalink > li > .mz-footer-title > .mz-mobile').click(function(event) {
              if (!$(this).parent().hasClass("mz-footer-current")) {
                      $('.mz-columnfull .datalink > li > .mz-footer-links').slideUp();
                      $(this).parent().parent().find(".mz-footer-links").slideDown();
                       $('.mz-footer-current').removeClass('mz-footer-current');
                        $(this).parent().addClass('mz-footer-current');
                        $(".mz-datlinktoogle").html("+");
                        //alert($(this).html());
                        $(this).parent().find(".mz-datlinktoogle").html("-");
                        
              } else {
            event.preventDefault();
          }
        });
      
      // Footer Desktop Sitemap
        $("#siteMapToggle").click(function(){  
           $(this).closest("div").parent().find(".datalink").toggle(); 
            var tempHtml=$("#siteMapToggle").text();
            if(tempHtml=="+"){
                $("#siteMapToggle").html('-');    
                $(".mz-footer-row").css('background-position','136% 107%');
           $("html, body").animate({scrollTop:  $(".mz-columnfull").offset().top+30 }, 500);
            }else{
                $("#siteMapToggle").html('+');    
                $(".mz-footer-row").css('background-position','136% 147%');
            }
            
        });              
   /* $(document).on('click','.mz-l-sidebaritem-new h4',function(){   
        if($(this).attr("class")!=="selected"){
          $(".mz-l-sidebaritem-new ul").slideUp();
          $(".showfirstitem").removeClass("showfirstitem");
          $(".mz-l-sidebaritem-new h4").removeClass("selected");
          $(".mz-l-sidebaritem-new h4").find("span").removeClass("mz-open-facet");
          $(".mz-l-sidebaritem-new h4").find("span").addClass("mz-close-facet");
          $(this).parent().find(".mz-facetingform-facet").slideDown();
          $(this).addClass("selected");
          if($(this).find("span").hasClass("mz-close-facet")){
            $(this).find("span").removeClass('mz-close-facet');
            $(this).find("span").addClass('mz-open-facet');    
          }
        }
    });*/
    
    
    /*
     * Company History Slide show
     */
    var owlCompanyHistory = $('#company-slider-history .company-sliders-history');
                    owlCompanyHistory.owlCarousel({
                        center:true,
                        loop:true,
                        nav:true,
                        dots:true,
                        responsiveClass:true,
                        transitionStyle : "fade",
                        responsive:{
                            0:{
                                items:1
                            },
                            600:{
                                items:1
                            },
                            1000:{
                                items:1
                            }
                        }
                    });
    /*
     * Donations
     */
    $('#step2a input').click(function(e){
        switch($(e.target).val()){
               case 'Yes':
                   $('#step3a').slideDown();
                   break;
               case 'No':
                   showAlertMessage();
                   break;
        }
    });
    $('#step3a input').click(function(e){
        switch($(e.target).val()){
               case 'Yes':
                   showAlertMessage();
                   break;
               case 'No':
                   $('#step4a').slideDown();
                   break;
        }
    });
    $('#step4a input').click(function(e){
        switch($(e.target).val()){
               case 'Yes':
                   $('#step5a').slideDown();
                   break;
               case 'No':
                   showAlertMessage();
                   break;
        }
    });
    $('#step5a input').click(function(e){
        switch($(e.target).val()){
               case 'Yes':
                   showAlertMessage();
                   break;
               case 'No':
                   $('#step6a').slideDown();
                   break;
        }
    });
    $('#step6a input').click(function(e){
        $('#step7a').slideDown();
    });
    
    function showAlertMessage(){
        alert('Thank you for your interest in Jelly Belly Candy Company. Based on the information you have provided, we regret we cannot proceed any further. We currently consider requests for certain types of support from organizations within our outreach focus and meeting eligibility requirements.');
    }
    
    /**
     * Conference Space
     **/
    $('.conferencePricing').click(function(e){
        $('.conferencePricing .carnival-details .contentList').slideToggle();
    });
    $('a[href="mailto:jbevents@jellybelly.com"]').click(function(e){
        e.preventDefault();
        $('.conferencePricing .carnival-details .contentList').slideToggle();
    });
    
    /**
     * Wedding center & Ideas
     **/
    var wedding_URL =  GetURLParameter('wedding');
    function GetURLParameter(sParam)
    {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++)
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam)
            {
                return sParameterName[1];
            }
        }
        return '';
    }
    
    if(wedding_URL){
        $('#'+wedding_URL).show();
        var owlWedding = $( '#'+wedding_URL + ' .slider');
                    owlWedding.owlCarousel({
                        center:true,
                        loop:true,
                        nav:true,
                        dots:true,
                        responsiveClass:true,
                        transitionStyle : "fade",
                        responsive:{
                            0:{
                                items:1
                            },
                            600:{
                                items:1
                            },
                            1000:{
                                items:1
                            }
                        }
                    });
    }
     
     
     //Art gallery
     $('.art-galleries .art-galleries-head').click(function(e){
        $('.art-galleries .art-galleries-head').removeClass('active'); 
        $('.art-gallery-item .art-gallery-details').hide();
        $(e.target).addClass('active');
        var galleryName  = e.target.getAttribute('galleryname');
        var galleryItemURL  = e.target.getAttribute('galleryItemURL');
        $('.art-gallery-item .galleryItemURL').fadeOut(400, function() {
                    $('.art-gallery-item .galleryItemURL').attr('src',galleryItemURL);
                })
                .fadeIn(400);
        $('.art-gallery-item-thumbs').hide();
        $('.'+galleryName).show();
     });
     
     
     $(document).on('click','.thump',function(e) {
         var AGD  = e.target.getAttribute('AGD');
         $('.art-gallery-item .galleryItemURL').hide();
         $('.art-gallery-item .art-gallery-details').hide();
         $('.art-gallery-item .art-gallery-details[AGD='+AGD+']').show();
     });
     
     
     var owlArtThump = $('.art-gallery-item-thumbs');
        owlArtThump.owlCarousel({
            loop:true,
            nav:true,
            margin:2,
            dots:false,
            responsiveClass:true,
            responsive:{
                0:{
                    items:1
                },
                400:{
                    items:3
                },
                600:{
                    items:4
                },
                1000:{
                    items:7
                }
            }
        });
    //Cooking Ideas
    $('[close-open-coocking-ideas]').click(function(e){ 
        $(e.target.parentElement).find('.baking-recipe').slideToggle();
    });
    //FAQ WIDGET
    $('.faq-q').click(function(e){
        $('.faq-a').slideUp( function(){
            var xx = $('.faq-q').find('img');
            $.each(xx,function(ind,val){
                val.style.setProperty('transform','rotate(-90deg)');
                val.style.setProperty('-webkit-transform','rotate(-90deg)');
                val.style.setProperty('-ms-transform','rotate(-90deg)');
            });    
        });
        
        if(e.currentTarget.nextElementSibling.style.display === "none")
        {        
            $(e.currentTarget.nextElementSibling).slideToggle(function(){
                var x = $(e.currentTarget).find('img')[0];
                x.style.setProperty('transform','rotate(0deg)');
                x.style.setProperty('-webkit-transform','rotate(0deg)');
                x.style.setProperty('-ms-transform','rotate(0deg)');
            });
        } 
        
    });
    //quick-view cookie storing

    //$(".img-overlay").click(function(){
    //(".img-overlay").hide(); 
    //); 

    //FLAVOUR GUIDE
    $(".jb-colapsing-title").bind("click", function(e){
        $(this).parent().find(".jb_contentfolder").slideToggle();
        if($(this).find(".mz-mobile").css("display")=="block"){
            var temphtml=$(this).find(".mz-mobile").text();
            if(temphtml=="+"){
                $(this).find(".mz-mobile").text("-");
            }else{
                $(this).find(".mz-mobile").text("+");
            }
        }
        var meThis = this;
        //close all opening other than clicked
        $.each($(".jb_contentfolder"),function(ind,val){
            if(val != $(meThis).parent().find(".jb_contentfolder")[0]){
                $(val).slideUp();
            }    
        });
    });
        var preview=[];
        if($.cookie('quickview') !== undefined){
        $(".gridder-list .img-overlay").click(function(){
            var recent= $.cookie('quickview');  
            preview = recent.split(",");
            var current= $(this).parent().data('mz-product').productCode;
            if(preview.indexOf(current) == -1){
                if(preview.length >= 5)
                {  
                    preview.splice(3, 1);
                    //procode.push(require.mozuData('product').productCode);
                }
                preview.splice(0,0,current);
           } 
            else
            {
                var a=preview.indexOf(current);
                preview.splice(a,1); 
                preview.splice(0,0,current);
            }
          $.cookie('quickview',preview,{path: '/'});
        });
        }
        else {
            preview.push($(this).parent().data('mz-product'));
            $.cookie('quickview',preview,{path: '/'});
        }
        
        $('.zero-popup .continue').on('click',function(){
            $('.zero-popup').hide();    
        });
        $('.items-per-order .continue').on('click',function(){
            $('.items-per-order').hide();      
        });
        
        require(["modules/add-to-cart-plp", "modules/notify-me"]);
    
    });
    function addToCartAndUpdateMiniCart(PRODUCT,count,$target){
        PRODUCT.set({'quantity':count});
        $(document).find('.overlay-for-complete-page').addClass('is-loading');
        PRODUCT.addToCart(1);
        PRODUCT.on('addedtocart', function(attr) {
            $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
            $(document).find('.overlay-for-complete-page').removeClass('is-loading');
            CartMonitor.update();
            MiniCart.MiniCart.showMiniCart();
            if(require.mozuData('pagecontext').cmsContext.template.path==="product"){
                $("html, body").animate({
                    scrollTop: $(".mz-pageheader-desktop").offset().top
                }, 500); 
            }
            PRODUCT = '';
            $(document).find('.confirm-popup-body').removeClass('active');
            $(document).find('body').removeClass('has-popup');
        });
        api.on('error', function (badPromise, xhr, requestConf) {
            showErrorMessage(badPromise.message);
            $(document).find('.overlay-for-complete-page').removeClass('is-loading');
        });
        
        require(['pages/jb-tealium-new']);
        require(['modules/header-myaccount']);
        //require(['modules/menu']);
        //require(['pages/jb-overlay-popup']);
        require(['widgets/column']);

    }
    function showErrorMessage(msg){
        $('[data-mz-message-bar]').empty();
        $('[data-mz-message-bar]').append('<p>'+msg+'</p>');
        $('[data-mz-message-bar]').fadeIn();
        setTimeout(function(){
            $('[data-mz-message-bar]').hide();
        },4000);
        $('.jb-inner-overlay').remove();
        // $("html, body").animate({scrollTop:  $(".mz-l-paginatedlist").offset().top }, 1000);
    }
    var pageContext = require.mozuData('pagecontext').pageType;
    if(pageContext != "cart" && pageContext != "product"){  
        $(document).on('click','.show-popup-confirmation', function(e){
            if(typeof $.cookie("isSubscriptionActive") !== "undefined") {
                alertPopup.AlertView.fillmessage("future-dailog",Hypr.getLabel('futureSubscription'), function(result) {
                    if(!result) {
                         alertPopup.AlertView.closepopup();
                    }else{
                        alertPopup.AlertView.closepopup();
                    } 
                }); 
            }else{
                var $target = $(e.currentTarget), productCode = $target.data("mz-prcode"); 
                var $quantity = $(e.target.parentNode.parentNode).find('#quantity')[0].options[$(e.target.parentNode.parentNode).find('#quantity')[0].options.selectedIndex];
                var count = parseInt($quantity.innerHTML,10);
                var myDate = $(e.currentTarget).parents('.jb-quickviewdetails').find('.stock.green').find('b').html();
                $(document).find('.confirmation-popup').find('.bold-text').html(myDate);
                $(document).find('.confirmation-popup').find('.add-to-cart-popup').attr('mz-productCode',productCode);
                $(document).find('.confirmation-popup').find('.add-to-cart-popup').attr('mz-quentity',count); 
                $(document).find('.confirmation-popup').addClass('active');
                $(document).find('.confirm-popup-body').addClass('active');
                $(document).find('body').addClass('has-popup');
            }
        });
        $(document).on('click', '.times-circle, .cancel-atc', function(e){
            $(document).find('.confirmation-popup').removeClass('active');
            $(document).find('.confirm-popup-body').removeClass('active');
            $(document).find('body').removeClass('has-popup');
        });
        if(pageContext != "my_account"){
            $(document).on('click', '.add-to-cart-popup', function(e){
                $(document).find('.confirmation-popup').removeClass('active');
                var $target = $(e.currentTarget), productCode = $target.attr("mz-productCode"), count = parseInt($target.attr('mz-quentity'),10);
                api.get('product', productCode).then(function(sdkProduct){
                    var PRODUCT = new ProductModels.Product(sdkProduct.data);
                    var variantOpt = sdkProduct.data.options;
                    if(variantOpt !== undefined && variantOpt.length>0){  
                        var newValue = $target.parent().parent().find('[plp-giftcart-prize-change-action]')[0].value;
                        var ID =  $target.parent().parent().find('[plp-giftcart-prize-change-action]')[0].getAttribute('data-mz-product-option');
                        if(newValue != "Select gift amount" && newValue !== ''){
                            var option = PRODUCT.get('options').get(ID);
                            var oldValue = option.get('value');
                            if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                                option.set('value', newValue);
                            }
                            setTimeout(function(){
                                    addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                            },2000);
                        }else{
                            showErrorMessage("Please choose the Gift Card amount before adding it to your cart. <br> Thanks for choosing to give a Jelly Belly Gift Card!");
                            $target.removeClass('is-loading');
                        }
                    }else{
                        var pro = PRODUCT;
                        var qntcheck = 0;
                        $.each(MiniCart.MiniCart.getRenderContext().model.items,function(k,v){
                            if(v.product.productCode == pro.get('productCode') && ((v.quantity + count) > 50)){ 
                                qntcheck = 1;
                            }
                        });
                        if(pro.get('price.price') === 0 && MiniCart.MiniCart.getRenderContext().model.items.length > 0 ){
                            //console.log(MiniCart);
                            var cartItems = MiniCart.MiniCart.getRenderContext().model.items;
                            var len = cartItems.length;
                            for(var i=0;i<len;i++){
                                if(cartItems[i].product.productCode === pro.get('productCode')){
                                    if(cartItems[i].product.price.price === pro.get('price.price')){
                                        $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                                        $target.removeClass('is-loading');
                                        $('.zero-popup').show();
                                        $(document).find('.confirm-popup-body').removeClass('active');
                                        $(document).find('body').removeClass('has-popup');
                                        return false;
                                    }
                                }
                            }
                            addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                        }else if(qntcheck){
                            $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                            $target.removeClass('is-loading');
                            $(".items-per-order").show(); 
                            return false;    
                        }else{
                            addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                        }
                    }
                });
            });
        }
    }
    
    if(!$(document).find('body').hasClass('mz-cart')){
        // add to cart function in all carousels.
        $(document).on('click', '.jb-add-to-cart-cur', function(e) {
            //e.preventDefault();
           // $('[data-mz-productlist],[data-mz-facets]').addClass('is-loading');
            var $target = $(e.currentTarget), productCode = $target.data("mz-prcode");
            $('[data-mz-message-bar]').hide();
            $(document).find('.overlay-for-complete-page').addClass('is-loading');
            var $quantity = $(e.target.parentNode.parentNode).find('#quantity')[0].options[$(e.target.parentNode.parentNode).find('#quantity')[0].options.selectedIndex];
            var count = parseInt($quantity.innerHTML,10);
            
            if(typeof $.cookie("isSubscriptionActive") === "undefined") {
                addToCartProducts(productCode,count,$target);
            }
            else {
                alertPopup.AlertView.fillmessage("first-dailog","You have started building a Subscription. Do you want to add this item to your Subscription?", function(result) {
                if(!result) {
                    alertPopup.AlertView.fillmessage("second-dailog","We can't mix Subscription and non-Subscription items at this time. Do you want to remove the Subscription item(s) from the cart?", function(result1) {
                        if(result1) {
                            console.log("will clear cart and subscription related cookie & update cart with selected item as non-Subscription");
                            var cartModel = CartModels.Cart.fromCurrent();
                            try {
                                // empty cart
                                cartModel.apiEmpty().then(function(res) {
                                alertPopup.AlertView.closepopup();
                                    // remove subscription cookie
                                    $.removeCookie("isSubscriptionActive",{path:"/"});
                                    $.removeCookie("scheduleInfo",{path:"/"});

                                    addToCartProducts(productCode,count,$target); 
                                });
                            } 
                            catch(e){
                                console.error(e);  
                            } 
                        }
                        else { 
                            alertPopup.AlertView.closepopup();
                            $(document).find('.overlay-for-complete-page').removeClass('is-loading');
                            console.log("do nothing, keep cart as it is!");
                        }
                    });
                } else {
                    // add product as subscription 
                    $(document).find('.overlay-for-complete-page').removeClass('is-loading');
                    console.log("add product as subscription");
                    alertPopup.AlertView.closepopup();
                    addToCartProducts(productCode,count,$target);
                }
            });
        }
            
        });
        // notify me function
        $(document).on('click','.jb-out-of-stock-cur', function(e) {
            //alert(e.target.getAttribute('data-mz-product-code'));
            $.colorbox({
                open : true,
                maxWidth : "100%",
                maxHeight : "100%",
                scrolling : false,
                fadeOut : 500,
                html : "<div id='notify-me-dialog-cur' style='padding: 25px;'><form><span>Enter your email address to be notified when this item is back in stock.</span><br><input style='margin-top: 10px;' id='mz-instock-request-email-cur' type='text' value='"+decodeURIComponent(jQuery.cookie('userData'))+"'><span style='background: #39A857; color: #ffffff; padding: 3px; margin-left: 5px; cursor: pointer;' id='instock-notification-signup-button-cur' data-mz-product-code='" + e.target.getAttribute('data-mz-product-code') + "'>NOTIFY ME</span></form><div class='notify-error' style='color:red; font-size:15px;display:none;'>Please enter a valid Email id</div></div>", //"/resources/intl/geolocate.html",
                overlayClose : true,
                onComplete : function () {
                   $('#cboxClose').show();
                   $('#cboxLoadedContent').css({
                       background : "#ffffff"
                   });
               }
            });
            $(document).find('body').addClass("haspopup");
        });

        $(document).on('click', '#instock-notification-signup-button-cur', function(e){
            if($('#mz-instock-request-email-cur').val() !== ""){
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var patt = new RegExp(re);
            if(patt.test($('#mz-instock-request-email-cur').val())){
                var obj = {
                    email: $('#mz-instock-request-email-cur').val(),
                    customerId: require.mozuData('user').accountId,
                    productCode: e.target.getAttribute('data-mz-product-code'),
                        locationCode: '' //this.model.get('inventoryInfo').onlineLocationCode
                    };
                    if(window.location.host.indexOf('s16708') > -1 || window.location.host.indexOf('east') > -1 || window.location.host.indexOf('s48917')>-1 || window.location.host.indexOf('s50196')>-1){
                        obj.locationCode = 'MDC';
                    }else if(window.location.host.indexOf('s21410') > -1 || window.location.host.indexOf('west') > -1 || window.location.host.indexOf('s48916')>-1 || window.location.host.indexOf('s50197')>-1){
                        obj.locationCode = 'FDC';
                    }
                    api.create('instockrequest',obj ).then(function () {
                        $("#notify-me-dialog-cur").fadeOut(500, function () { $("#notify-me-dialog-cur").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
                    }, function () {
                        $("#notify-me-dialog-cur").fadeOut(500, function () { $("#notify-me-dialog-cur").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
                    });
                }else{
                    $('.notify-error').show();
                }
            }else{
                $('.notify-error').show();
            }
        });
    }
    
    var addToCartProducts=function(productCode,count,$target){
        api.get('product', productCode).then(function(sdkProduct) {
            var PRODUCT = new ProductModels.Product(sdkProduct.data);
            var variantOpt = sdkProduct.data.options;
            if(variantOpt !== undefined && variantOpt.length>0){
                var newValue = $target.parent().parent().find('[plp-giftcart-prize-change-action]')[0].value;
                var ID =  $target.parent().parent().find('[plp-giftcart-prize-change-action]')[0].getAttribute('data-mz-product-option');
                if(newValue != "Select gift amount" && newValue !== ''){
                    var option = PRODUCT.get('options').get(ID);
                    var oldValue = option.get('value');
                    if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                        option.set('value', newValue);
                    }
                    setTimeout(function(){
                        addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                    },2000);
                }else{
                    showErrorMessage("Please choose the Gift Card amount before adding it to your cart. <br> Thanks for choosing to give a Jelly Belly Gift Card!");
                    $(document).find('.overlay-for-complete-page').removeClass('is-loading');
                }
            }else{
                var pro = PRODUCT;
                var qntcheck = 0;
                $.each(MiniCart.MiniCart.getRenderContext().model.items,function(k,v){
                    if(v.product.productCode == pro.get('productCode') && ((v.quantity + count) > 50)){
                        qntcheck = 1;
                    }
                });
                if(pro.get('price.price') === 0 && MiniCart.MiniCart.getRenderContext().model.items.length > 0 ){
                    //console.log(MiniCart);
                    var cartItems = MiniCart.MiniCart.getRenderContext().model.items;
                    var len = cartItems.length;
                    for(var i=0;i<len;i++){
                        if(cartItems[i].product.productCode === pro.get('productCode')){
                            if(cartItems[i].product.price.price === pro.get('price.price')){
                                $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                                $(document).find('.overlay-for-complete-page').removeClass('is-loading');
                                $('.zero-popup').show();
                                return false;
                            }
                        }
                    }
                    addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                }else if(qntcheck){
                    $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                    $(document).find('.overlay-for-complete-page').removeClass('is-loading');
                    $(".items-per-order").show();
                    return false;
                }else{
                    addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                }
            }
        });
    };
     // enable scroll after closing zoom image poup
    $(document).on('click','#cboxClose',function(){
        setTimeout(function(){
            $(document).find('body').removeClass("haspopup"); 
        },250); 
    });
 
    $(document).on('click','#cboxOverlay',function(e){
        if($(e.target).attr('id') == "cboxOverlay"){ 
            setTimeout(function(){ 
                $(document).find('body').removeClass("haspopup");
            },250); 
        }
    });

    //setting order by email in order confirmation page
    var confirm = require.mozuData('pagecontext').pageType;
    if (confirm === "confirmation") {
        var userInfo = $.cookie('userData');
        $('.userEmail').text(decodeURIComponent(jQuery.cookie('userData')));
    }

    //  Setting the cookie value to session storage
    /* if($.cookie('userData')!== "null" && $.cookie('userData')!== undefined){
        sessionStorage.setItem('Useremail', JSON.parse($.cookie("userData")).email); 
    }*/
         
}); 

});

// require(["modules/api"], function(api) { 
//     window.blockoutDates = function blockoutDates(){    
//         window.getShippingBlockoutDates =  new Promise(function(resolve, reject){
//             console.log("window.shippingItems ---",window.shippingItems);
//             var items =  window.shippingItems ?  window.shippingItems :[];
//             var apiResult = {dates:[],isSuccess:false,blockoutDates:[]};

//             api.request("post","/sfo/get_dates",{data:items}).then(function(result){
//                 console.log( " result ---",result);
//                 var formatedDates = window.formatApiData(result);
//                 apiResult.dates = formatedDates;
//                 apiResult.blockoutDates = result.BlackoutDates;
//             resolve(apiResult);
//             },function(er){
//                 console.log("error ---",er);
//             resolve(apiResult);
//             });
//         });
//         return  window.getShippingBlockoutDates;
// };
// });

window.formatApiData = function formatApiData(result){
    var dates = [];
    if(result && result.Blackout){
        var blockoutDates = result.Blackout;
        for(var i=0;i<blockoutDates.length;i++){
            var dt = new Date(blockoutDates[i].Date);
            var mth = dt.getMonth()+1;
             mth = mth <10 ? "0"+mth : mth;
            var day = dt.getDate() < 10 ? "0"+dt.getDate() : dt.getDate();
            var year = dt.getFullYear();
            var formatDt = mth +'/'+day+'/'+year;
            dates.push(formatDt);
        }
    }
    return dates;
} ;


