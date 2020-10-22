window.handlingAdjustment = 0;
window.lastSetShipDate = "";

require(["modules/jquery-mozu", "underscore","modules/api", "hyprlive", "modules/backbone-mozu", "modules/models-checkout",
"modules/views-messages", "modules/cart-monitor", 'hyprlivecontext', 'modules/editable-view', 'modules/preserve-element-through-render',"modules/models-cart","vendor/jquery-ui.min"],
function ($, _, api,Hypr, Backbone, CheckoutModels, messageViewFactory, CartMonitor, HyprLiveContext, EditableView, preserveElements,CartModels) {
    var isAddresTypeChanged = false;
	
    var CheckoutStepView = EditableView.extend({
		edit: function () {
            this.model.edit();
            if(this.$el.attr("id") === "step-payment-info") {
                this.$el.find("#datePicker").val(this.model.get("purchaseOrder").get("pOCustomField-shipdate"));
            }
        },
        next: function () {
            // wait for blur validation to complete
            var me = this;
            me.editing.savedCard = false;
            _.defer(function () {
                me.model.next();
            });
        },
        choose: function () {
            var me = this;
            me.model.choose.apply(me.model, arguments);
        },
        constructor: function () {
            var me = this;
            EditableView.apply(this, arguments);
            me.resize();
            setTimeout(function () {
                me.$('.mz-panel-wrap').css({ 'overflow-y': 'hidden'});
            }, 250);
            me.listenTo(me.model,'stepstatuschange', me.render, me);
            me.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    me.handleEnterKey(e);
                    return false;
                }
            });
        },
        initStepView: function() {
            this.model.initStep();
        },
        handleEnterKey: function (e) {
            this.model.next();
        },
        render: function () {
            this.$el.removeClass('is-new is-incomplete is-complete is-invalid').addClass('is-' + this.model.stepStatus());
            EditableView.prototype.render.apply(this, arguments);
            this.resize();
            //Hide validation message section
            window.checkoutViews.messageView.el.style.display = "none";
			
			//this.updateFreeShippingDisplays();
			
			_.defer(_.bind(this.updateFreeShippingDisplays, this));

            var me = this.model;

			$("#order-comments").on('change keyup paste', function() {
			var charCount = $("#order-comments").val().length;
            if (charCount > 0) {
                $("#comments-display").fadeIn("slow");
            }
            else {
                $("#comments-display").fadeOut("slow");
            }
			var userLines = $("#order-comments").val().split("\n");

            var comment = ["", "", "", "", "", "", "", "", "", ""];
            var index = 0;
            var newLine = 0;
            
            for (var i = 0; i < userLines.length && i < 10; i++)
            {
                if (userLines[i].length < 30) {
                    comment[index] += userLines[i];
                    index++;
                }
                else if (userLines[i].length >= 30){
                    var words = userLines[i].split(" ");
                    for(var w = 0; w < words.length; w++) {
                        if ((comment[index].length + " ".length + words[w].length) < 30 ) {
                            comment[index] += (comment[index].length > 0 ? " " : "") + words[w];
                        } 
                        else {
                            // begin next line
                            index++;
                            newLine = 1;
                            comment[index] += words[w];
                        }
                    }
                }
                if(newLine) { index++; newLine = 0; }
            } 

            if (charCount >= 275) {
                $("#comments-character-count").css({ color: "#000000", "font-weight": "bold" });
                $("#comments-line-count").css({ color: "#000000", "font-weight": "bold" });
            }
            else {
                $("#comments-character-count").css({ color: "#000000",  "font-weight": "normal" });
            }
            
            $("#comments-character-count").html($("#order-comments").val().length);
            
            for(i = 0; i < 10; i++)
            {
                $("#line" + i).css({ background: "#cccccc"}).html(comment[i]);
            }
            
            me.parent.commentsReformatted = comment.slice(0, 10).join("\n");
            // me.parent.set('shopperNotes.giftMessage', comment.join("\n")); 
            // 
            //catch (e) {  }
        });
        
        $("#order-comments").trigger("change");
        
        var segmentArray = document.getElementById('segments').innerHTML;
  			var segments = segmentArray.split(',');

  			if(segments.indexOf('B2B-DISC-5PERCENT') > -1){
  				$("#discount-cell div").css({ "background" : "lightyellow"});
  				$("#discount-cell div span").css({ "color" : "black"});
  			}
  			
  			//update shipping dates
            if(window.getDates && window.getDates.Items.length>0){
                this.updateShippingDates();
            }
            setTimeout(function(){   
                $('.error-msg').html('');
                window.checkoutViews.couponCode.model.set('errormessagecoupon','');
            },12000); 
        },
        updateFreeShippingDisplays: function() {
            var order = this.model.getOrder();
            // var addressType = order.apiModel.data.fulfillmentInfo.fulfillmentContact.address.addressType;
            var subtotal = order.apiModel.data.subtotal; // checkoutModel.apiModel.data.subtotal;
            //var stateOrProvince = order.apiModel.data.fulfillmentInfo.fulfillmentContact !== null ? order.apiModel.data.fulfillmentInfo.fulfillmentContact.address.stateOrProvince : "ZZ";
            var fulfillmentInfo = order.apiModel.data.fulfillmentInfo;
            var stateOrProvince = fulfillmentInfo && fulfillmentInfo.fulfillmentContact && fulfillmentInfo.fulfillmentContact.address && fulfillmentInfo.fulfillmentContact.address.stateOrProvince || "ZZ";
			
            if ((subtotal >= Hypr.getThemeSetting('freeshippingBoundingValue') && subtotal < Hypr.getThemeSetting('shippingSwitchoverValue')) || (subtotal >= Hypr.getThemeSetting('freeshippingBoundingValue') && $.cookie('isPoBoxSelected') == "true") || (subtotal >= Hypr.getThemeSetting('freeshippingBoundingValue') && _.contains(["AK","HI","AA","AE","AP"], stateOrProvince))) {
                // SHOW SUREPOST METHODS AS FREE
				if ($("#shippingmethod_detail_ups_UPS_SUREPOST_LESS_THAN_1LB").length) {
                    $("#shippingmethod_detail_ups_UPS_SUREPOST_LESS_THAN_1LB").html("FREE");
                }
                if ($("#shippingmethod_detail_ups_UPS_SUREPOST_1LB_OR_GREATER").length) {
                    $("#shippingmethod_detail_ups_UPS_SUREPOST_1LB_OR_GREATER").html("FREE");
                }
                if ($("#shippingmethod_summary_ups_UPS_SUREPOST_LESS_THAN_1LB").length) {
                    $("#shippingmethod_summary_ups_UPS_SUREPOST_LESS_THAN_1LB").html("FREE");
                }
                if ($("#shippingmethod_summary_ups_UPS_SUREPOST_1LB_OR_GREATER").length) {
                    $("#shippingmethod_summary_ups_UPS_SUREPOST_1LB_OR_GREATER").html("FREE");
                }
                // show the original price for ground
                if ($("#shippingmethod_detail_ups_UPS_GROUND").length && $.cookie("shipmethod_ups_UPS_GROUND")) {
					$("#shippingmethod_detail_ups_UPS_GROUND").html("$" + $.cookie("shipmethod_ups_UPS_GROUND"));
                }
                }
            else if (subtotal >= Hypr.getThemeSetting('shippingSwitchoverValue')) {
				// SHOW UPS GROUND AS FREE
                if ($("#shippingmethod_detail_ups_UPS_GROUND").length) {
                    $("#shippingmethod_detail_ups_UPS_GROUND").html("FREE");
                }
                if ($("#shippingmethod_summary_ups_UPS_GROUND").length) {
                    $("#shippingmethod_summary_ups_UPS_GROUND").html("FREE");
                }
                
                // show the original prices for the surepost methods
                if ($("#shippingmethod_detail_ups_UPS_SUREPOST_LESS_THAN_1LB").length && $.cookie("shipmethod_ups_UPS_SUREPOST_LESS_THAN_1LB")) {
					$("#shippingmethod_detail_ups_UPS_SUREPOST_LESS_THAN_1LB").html("$" + $.cookie("shipmethod_ups_UPS_SUREPOST_LESS_THAN_1LB"));
                }
                if ($("#shippingmethod_detail_ups_UPS_SUREPOST_1LB_OR_GREATER").length && $.cookie("shipmethod_ups_UPS_SUREPOST_1LB_OR_GREATER")) {
					$("#shippingmethod_detail_ups_UPS_SUREPOST_1LB_OR_GREATER").html("$" + $.cookie("shipmethod_ups_UPS_SUREPOST_1LB_OR_GREATER"));
                }
                }
            else {
                }
				if(Hypr.getThemeSetting('showHeatSensitiveText')) {
					var items = order.apiModel.data.items;
					for (var i = 0; i < items.length; i++){
						var properties = items[i].product.properties;
						for (var y = 0; y < properties.length; y++)
						{
							if (properties[y].attributeFQN === 'tenant~IsHeatSensitive')
							{ 
								if(properties[y].values[0].value) {
									$('#heat-warning').css({ display: "block" });
									$('#hide-from-heat-sensitive').css({ display: "none" });
									}
							}
						}
					}
				}
        },
        updateShippingDates:function() {
             var blackoutdates = "";
            if(window.getDates && window.getDates.BlackoutDates.length > 0) {
                blackoutdates = window.getDates.BlackoutDates.map(function(d) {
                   return window.formatDate(d);
                });
            }
            window.checkoutViews.orderSummary.model.get('items').forEach(function(e,i) {
               var foundEl = _.findWhere(window.getDates.Items, {SKU: e.product.productCode});
               if(foundEl && foundEl.FirstShipDate) {
                    var udate = new Date(foundEl.FirstShipDate),
                    futureDate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
                    var fdate = ('0'+(futureDate.getMonth()+1)).slice(-2)+ '/' + ('0'+futureDate.getDate()).slice(-2) + '/' + futureDate.getFullYear();
        
                    var nextday = new Date(),businessdays=2,day,month,year,currentDate,comparedate;
						while(businessdays){
							nextday.setFullYear(nextday.getFullYear(),nextday.getMonth(),(nextday.getDate()+1));
							day = nextday.getDay();
							month = nextday.getMonth();
							year = nextday.getFullYear();
							currentDate = nextday.getDate(); 
							comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
							 
							if(day===0 || day===6 ||blackoutdates.indexOf(comparedate) !== -1){
								nextday.setFullYear(year,month,currentDate);
							}else{
								businessdays--;
							}
						}
                        
                    /* check if date is regular or future and then determine if product is a regular one or SFO */
                    if(foundEl.inventory > 0 && futureDate > nextday) {
                        e.isFutureProduct = true;
                    }    
                    e.nextAvailableDate = fdate;
                    e.availableInventory = foundEl.inventory;
                }
               else {
                   e.availableInventory = foundEl.inventory;
               }
            });
            var udate =  new Date(window.getDates.FirstShipDate),
                sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
            window.checkoutViews.orderSummary.model.set("firstShipDate",sdate);
            window.checkoutViews.orderSummary.render();
            //window.checkoutViews.steps.paymentInfo.render();
            if(window.getDates.FirstShipDate) window.checkoutViews.steps.paymentInfo.dateSelector(sdate);
            $('.datePicker').datepicker('option', 'minDate', sdate);
            $("#first-shipdate").text(this.formatShipDate(window.checkoutViews.orderSummary.model.get("firstShipDate")));
        },
        formatDate: function(date) {
            var sdate = new Date(date);
            return ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
        },
        formatShipDate:function(date){
            var udate = new Date(date),
                sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
            return ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
        },
        resize: _.debounce(function () {
            this.$('.mz-panel-wrap').animate({'height': this.$('.mz-inner-panel').outerHeight() });
        },200)
    });

	var OrderSummaryView = Backbone.MozuView.extend({
		templateName: 'modules/checkout/checkout-order-summary',
		additionalEvents: {
			"change #interval-month, #interval-month-label, #interval-cancellation, #interval-startdate": "updateScheduleInfo"
		},

		initialize: function() {
			this.listenTo(this.model.get('billingInfo'), 'orderPayment', this.onOrderCreditChanged, this);
			if (typeof $.cookie("isSubscriptionActive") != "undefined") {
				this.model.set("isSubscriptionActive", $.cookie("isSubscriptionActive"));
				if (typeof $.cookie("scheduleInfo") != "undefined") {
					this.model.set("scheduleInfo", JSON.parse(JSON.parse($.cookie("scheduleInfo"))));
				}
			}
			//this.render();
		},
		/*added extra*/
		getRenderContext: function() {
			var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
			if ($.cookie("isSubscriptionActive")) {
				c.model.scheduleInfo.startDate = JSON.parse(JSON.parse($.cookie("scheduleInfo"))).startDate;
			}
			return c;
		},
		render: function() {
			this.updateShippingDates();
			EditableView.prototype.render.apply(this, arguments);
			if ($.cookie("isSubscriptionActive")) {
				this.dateSelector();
			}
		}, 
		updateShippingDates:function() {
             var blackoutdates = "",self = this;
            if(window.getDates && window.getDates.BlackoutDates.length > 0) {
                blackoutdates = window.getDates.BlackoutDates.map(function(d) {
                   return window.formatDate(d);
                });
            }
            self.model.get('items').forEach(function(e,i) {
               var foundEl = _.findWhere(window.getDates.Items, {SKU: e.product.productCode});
               if(foundEl && foundEl.FirstShipDate) {
                    var udate = new Date(foundEl.FirstShipDate),
                    futureDate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
                    var fdate = ('0'+(futureDate.getMonth()+1)).slice(-2)+ '/' + ('0'+futureDate.getDate()).slice(-2) + '/' + futureDate.getFullYear();
        
                    var nextday = new Date(),businessdays=2,day,month,year,currentDate,comparedate;
						while(businessdays){
							nextday.setFullYear(nextday.getFullYear(),nextday.getMonth(),(nextday.getDate()+1));
							day = nextday.getDay();
							month = nextday.getMonth();
							year = nextday.getFullYear();
							currentDate = nextday.getDate(); 
							comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
							 
							if(day===0 || day===6 ||blackoutdates.indexOf(comparedate) !== -1){
								nextday.setFullYear(year,month,currentDate);
							}else{
								businessdays--;
							}
						}
                        
                    /* check if date is regular or future and then determine if product is a regular one or SFO */
                    if(foundEl.inventory > 0 && futureDate > nextday) {
                        e.isFutureProduct = true;
                    }    
                    e.nextAvailableDate = fdate;
                    e.availableInventory = foundEl.inventory;
                }
                else {
                   e.availableInventory = foundEl.inventory;
                }
            });
        },
        formatDate: function(date) {
            var sdate = new Date(date);
            return ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
        },
        formatShipDate:function(date){
            var udate = new Date(date),
                sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
            return ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
        },
		editCart: function() {
			// if(typeof $.cookie("chktEdit") != "undefined") {
			//     $.cookie("chktSub",'',{path: '/',expires: -1});
			//     $.cookie("chktEdit",'',{path: '/',expires: -1});
			// }
			if(typeof $.cookie("isSubscriptionActive") != "undefined") {
				if(typeof $.cookie("chktEdit") != "undefined")
					window.location = '/subscriptions#edit='+$.cookie("chktEdit");
				else window.location = '/subscriptions';
			} else {
				window.location = "/cart";
			}
		},
        dateSelector: function() {
			var me = this;
			var finaldate;
			var heat;
			var finalDate;
			if (this.isHeatSensitive()) {
				finaldate = this.heatSensitvieDatePicker();
				finalDate = finaldate.replace(/-/g, '/');
				heat = true;
			} else {
				finaldate = this.datePicker();
				finalDate = finaldate.replace(/-/g, '/');
				heat = false;
			}


			// Date Picker 
			$('#interval-startdate').datepicker({
				beforeShowDay: heatSensitive,
				minDate: '0',
				maxDate: '+6m',
				dateFormat: "mm-dd-yy",
				onSelect: function(dateText, inst) {
					var date = $(this).datepicker('getDate'),
						day = date.getDate(),
						month = date.getMonth() + 1,
						year = date.getFullYear();
					var shipdate = ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2) + '-' + year;
					window.shipdate = shipdate;
					$('#interval-startdate').datepicker("setDate", shipdate);
					$('#interval-startdate').val(shipdate);
					me.render();
					//$('.estimateddate').text(shipdate);   
				}
			});

			if (window.shipdate) {
				var selected = window.shipdate;
				$('#interval-startdate').datepicker("setDate", selected);
				$('#interval-startdate').val(selected);
				if ($.cookie("isSubscriptionActive")) {
					me.model.attributes.scheduleInfo.startDate = selected;
				}
			} else {
				$('#interval-startdate').datepicker("setDate", finaldate);
				$('#interval-startdate').val(finaldate);
				if ($.cookie("isSubscriptionActive")) {
					$('#interval-startdate').datepicker("setDate", me.model.attributes.scheduleInfo.startDate);
					$('#interval-startdate').val(me.model.attributes.scheduleInfo.startDate);
					//me.model.attributes.scheduleInfo.startDate = finaldate;
				}
			}

			function heatSensitive(date) {
				var restDates = Hypr.getThemeSetting('shipping_date');
				var blackoutdates = restDates.split(',');
				var day;
				var m = date.getMonth();
				var d = date.getDate();
				var y = date.getFullYear();

				var dd = new Date();
				var mm = dd.getMonth();
				var ddd = dd.getDate();
				var yy = dd.getFullYear();

				var shipdate = new Date(finalDate);
				var currentDate = ('0' + (mm + 1)).slice(-2) + "/" + ('0' + ddd).slice(-2) + "/" + yy;
				var compareDate = ('0' + (m + 1)).slice(-2) + '/' + ('0' + d).slice(-2) + '/' + y;
				if (heat) {
					for (var i = 0; i < blackoutdates.length; i++) {
						if ($.inArray(compareDate, blackoutdates) != -1 || new Date() > date || shipdate > date) {
							return [false];
						}
					}
					day = date.getDay();
					if (day === 3 || day === 4 || day === 5 || day === 6 || day === 0) {
						return [false];
					} else {
						return [true];
					}
				} else {
					for (var j = 0; j < blackoutdates.length; j++) {
						if ($.inArray(compareDate, blackoutdates) != -1 || new Date() > date || shipdate > date) {
							return [false];
						}
					}
					day = date.getDay();
					if (day === 6 || day === 0) {
						return [false];
					} else {
						return [true];
					}
				}
			}
		},
		datePicker: function(){
			var date = new Date();
			var businessdays = 2;
			var restDates = Hypr.getThemeSetting('shipping_date');
			var blackoutdates = restDates.split(',');
			var day, month, year, fulldate, currentDate, comparedate;
			while (businessdays) {
				date.setFullYear(date.getFullYear(), date.getMonth(), (date.getDate() + 1));
				day = date.getDay();
				month = date.getMonth();
				year = date.getFullYear();
				currentDate = date.getDate();
				fulldate = ('0' + (month + 1)).slice(-2) + '-' + ('0' + currentDate).slice(-2) + '-' + year;
				comparedate = ('0' + (month + 1)).slice(-2) + '/' + ('0' + currentDate).slice(-2) + '/' + year;


				if (day === 0 || day === 6 || blackoutdates.indexOf(comparedate) !== -1 || new Date() > comparedate) {
					date.setFullYear(year, month, (currentDate + 1));
				} else {

					/*date.setFullYear(year,month,(currentDate+1));
					if(date.getDay()===0 || date.getDay()===6 || blackoutdates.indexOf(comparedate) !== -1 ){
						date.setFullYear(year,month,(currentDate+1));
					}else{*/
					businessdays--;
					//}
				}
			}
			date.setFullYear(year, month, (date.getDate()));
			var finaldate = ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + '-' + date.getFullYear();
			$('.earliest-date span').text(finaldate);
			//$('#interval-startdate').datepicker("setDate",final);
			return finaldate;
        },
		heatSensitvieDatePicker: function() {
			var date = new Date();
			var businessdays = 2;
			var restDates = Hypr.getThemeSetting('shipping_date');
			var blackoutdates = restDates.split(',');
			var day, month, year, currentDate, comparedate;
			while (businessdays) {
				date.setFullYear(date.getFullYear(), date.getMonth(), (date.getDate() + 1));
				day = date.getDay();
				month = date.getMonth();
				year = date.getFullYear();
				currentDate = date.getDate();
				// fulldate= ('0'+(month+1)).slice(-2)+ '-' + ('0'+currentDate).slice(-2) + '-' + year;
				comparedate = ('0' + (month + 1)).slice(-2) + '/' + ('0' + currentDate).slice(-2) + '/' + year;

				if (day === 0 || day === 6 || day === 3 || day === 4 || day === 5 || blackoutdates.indexOf(comparedate) !== -1) {
					date.setFullYear(year, month, (currentDate));
				} else {
					businessdays--;
				}
			}
			date.setFullYear(year, month, (currentDate));
			var finaldate = ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + '-' + date.getFullYear();
			$('.earliest-date span').text(finaldate);
			return finaldate;
		},
		isHeatSensitive: function() {
			if (Hypr.getThemeSetting('heatsensitive')) {
				var items = window.orderSummary.model.get('items');
				var itemsLength = items.length;
				var i = 0;
				for (i; i < itemsLength; i++) {
					if (items[i].product.properties.length > 0) {
						var j = 0;
						var proLength = items[i].product.properties.length;
						for (j; j < proLength; j++) {
							if (items[i].product.properties[j].attributeFQN === "tenant~isheatsensitive" || items[i].product.properties[j].attributeFQN === "tenant~IsHeatSensitive") {
								if (items[i].product.properties[j].values[0].value) {
									return true;
								}
							}
						}
					}
				}
				return false;
			} else {
				return false;
			}
		},

		updateScheduleInfo: function(e) {
			this.model.attributes.scheduleInfo[e.target.getAttribute("name")] = e.target.value;
			this.render();
			console.log(this.model.get("scheduleInfo"));
		},

		onOrderCreditChanged: function(order, scope) {
			this.render();
		},

		// override loading button changing at inappropriate times
		handleLoadingChange: function() {}
	});


    var ShippingAddressView = CheckoutStepView.extend({
        templateName: 'modules/checkout/step-shipping-address',
        autoUpdate: [
            'firstName',
            'lastNameOrSurname',
			'companyOrOrganization',
            'address.address1',
            'address.address2',
            'address.address3',
            'address.cityOrTown',
            'address.countryCode',
            'address.stateOrProvince',
            'address.postalOrZipCode',
            'address.addressType',
            'phoneNumbers.home',
            'contactId',
            'email',
            'updateMode'
        ],
        additionalEvents: {
            "keydown input[name='shippingphone']": "phoneNumberFormating",
            "keyup input[name='shippingphone']": "phoneNumberFormating2",
            "change [data-mz-value='address.addressType']": "addressTypeChanged"
           // "click [data-mz-value='contactId']": "addressSelection"
        },
        renderOnChange: [
            'address.countryCode',
            'contactId'
        ],
        beginAddContact: function () {
            this.model.set('contactId', 'new');
        },
        addressSelection: function(e){
            if(e.target.value != "new"){
                $.cookie('isPoBoxSelected',false);
                $.cookie('isExistingAddress',true);
            }else{
                $.cookie('isExistingAddress',false);
            }
        },
        addressTypeChanged: function(e){
            if(e.target.value === "POBox"){
                $.cookie('isPoBoxSelected',true);
            }else{
                $.cookie('isPoBoxSelected',false);
            }
        },
        getRenderContext: function () {
            var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            $(c.model.contacts).each(function(key , val){
                $(c.model.contacts[key].types).each(function(k,v){
                    if(v.name === "Shipping" && v.isPrimary){
                        c.model.contacts[key].isDefaultShipping = true;
                    }
                });
            });
            return c;
        },
        phoneNumberFormating2: function(e){
            var keyChar  = $('input[name="shippingphone"]').val()[$('input[name="shippingphone"]').val().length-1];
            var value = $('input[name="shippingphone"]').val();
            if(keyChar === "!" || keyChar === "@" || keyChar === "#" || keyChar === "$" || keyChar === "%" || keyChar === "^" || keyChar === "&"  || keyChar === "*" || keyChar === "(" || keyChar === ")" || keyChar === "_" || keyChar === "+" || keyChar === "~"){
                $('input[name="shippingphone"]').val(value.substr(0,value.length-1));
            }
        },
        initialize: function(){
            this.model.set('address.countryCode',"US");  
        },
        phoneNumberFormating : function(e){
            if(e.shiftKey){
                e.stopPropagation();
                e.preventDefault();
            }
            if((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode === 9){     
                var keyChar = String.fromCharCode( e.keyCode);
                var length = $('input[name="shippingphone"]').val().length;
                switch(length){
                    case(0): 
                        $('input[name="shippingphone"]').val('('+$('input[name="shippingphone"]').val());
                        break;
                    case(4): 
                        $('input[name="shippingphone"]').val($('input[name="shippingphone"]').val()+') ');
                        break;
                    case(9): 
                        $('input[name="shippingphone"]').val($('input[name="shippingphone"]').val()+'-');
                        break;
                }
            }else{
                    if(e.keyCode != 8){
                        e.stopPropagation();
                        e.preventDefault();
                    }
            }
        },
		confirmValidationBypass: function(){
            this.model.bypass(); 
        }
    });

    var ShippingInfoView = CheckoutStepView.extend({
        templateName: 'modules/checkout/step-shipping-method',
        getRenderContext: function () {
                var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
                if(c.model.availableShippingMethods){
					c.model.availableShippingMethods = _.map(c.model.availableShippingMethods, function(method) { 
                        if(method.shippingMethodCode.indexOf("SUREPOST") > -1)
                            method.shippingMethodName = "UPS SurePost®";
                        return method;
                        });
                    c.model.availableShippingMethods = c.model.availableShippingMethods.sort(function(obj1,obj2){ return obj1.price > obj2.price; });
                }
                if($.cookie('isPoBoxSelected') === "true"){
                    $(c.model.availableShippingMethods).each(function(key,val){
                        if(val.shippingMethodCode.indexOf("SUREPOST")<0){
                            key = c.model.availableShippingMethods.indexOf(val);
                            c.model.availableShippingMethods.splice(key, 1);
                        }
                    });
                }
                return c;
        },
        renderOnChange: [
            'availableShippingMethods'
        ],
        additionalEvents: {
            "change [data-mz-shipping-method]": "updateShippingMethod"
        },
        updateShippingMethod: function (e) {
            this.model.updateShippingMethod(this.$('[data-mz-shipping-method]:checked').val());
        },
        calculateColdPacks: function(shipDate){
          var o = this.model.getOrder();
          var o2 = o.get("items").map(function(i){ 
            return { 
              productCode: i.product.productCode, 
              quantity: i.quantity,
              price: i.product.price.price,
              subtotal: i.subtotal
            };
          });
          //console.log(o2);
          //console.log(shipDate);
          var reformattedDate;
          try {
            reformattedDate = new Date(shipDate.replace(/-/g, '/'));
          } catch (e) { 
            reformattedDate = new Date(); 
          }
          
          api.request('post','/svc/handling_adjustment', {
            order_id: o.get('id'),
            customerNumber: require.mozuData('user').lastName,
            lineOfBusiness: "b2b",
            shipDate: reformattedDate.toISOString(), //str_replace('-','/'),
            items: o2
          }).then(function(resp){
            console.log(resp);
            //if (resp.handlingFee && resp.handlingFee > 0)
            window.checkoutViews.reviewPanel.model.set("heatSensitiveSubtotal", resp.heatSensitiveSubtotal);
            o.update();
            //window.checkoutViews.orderSummary.model.update();
            //window.checkoutViews.orderSummary.render();
//            if (resp.heatSensitiveSubtotal >= 0 && resp.heatSensitiveSubtotal < 200.00) {
              
              //$('#handling-fee').html("Handling fee: $" + resp.handlingFee).show();
              //$('button[data-mz-action*="submit"]').attr('disabled','').css({ background: "#cccccc" });
//            }
  //          else {
              
              //$('#handling-fee').html("").hide();
              //$('button[data-mz-action*="submit"]').removeAttr('disabled','').css({ background: "#25cc38" });
    //        }
          });

            
          // var heatSensitiveSubtotal = this.model.calculateColdPacks();
          // this.model.set("heatSensitiveSubtotal", heatSensitiveSubtotal);
          // //alert(heatSensitiveSubtotal);
          // if (heatSensitiveSubtotal > 0.00 && heatSensitiveSubtotal < 200.00) {
          //   $('#cold-pack-message').empty().html("You have $" + heatSensitiveSubtotal+ " of heat sensitive items. A $10 handling fee will be applied.");
          //   window.handlingAdjustment = "level 1";
          // }
          // else if (heatSensitiveSubtotal >= 200.00 && heatSensitiveSubtotal < 499.99) {
          //   $('#cold-pack-message').empty().html("You have $" + heatSensitiveSubtotal+ " of heat sensitive items. A $20 handling fee will be applied.");
          //   window.handlingAdjustment = "level 2";
          // }
          // else if (heatSensitiveSubtotal >= 500.00) {
          //   $('#cold-pack-message').empty().html("You have $" + heatSensitiveSubtotal+ " of heat sensitive items. The handling fee will be waived.");
          //   window.handlingAdjustment = "level 3";  
          // }
          // alert("adjust handling amount");
          this.alreadyCalculatedColdPacks = true;
          return;
        },
        alreadyCalculatedColdPacks: false
    });

    var poCustomFields = function() {
        
        var fieldDefs = [],

        isEnabled = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder &&
            HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.isEnabled;

            if (isEnabled) {
                var siteSettingsCustomFields = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.customFields;
                siteSettingsCustomFields.forEach(function(field) {
                    if (field.isEnabled) {
                        fieldDefs.push('purchaseOrder.pOCustomField-' + field.code);
                    }
                }, this);
            }

        return fieldDefs;

    };

    var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
    var pageContext = require.mozuData('pagecontext');
    var BillingInfoView = CheckoutStepView.extend({
        templateName: 'modules/checkout/step-payment-info',
        autoUpdate: [
            'savedPaymentMethodId',
            'paymentType',
            'card.paymentOrCardType',
            'card.cardNumberPartOrMask',
            'card.nameOnCard',
            'card.expireMonth',
            'card.expireYear',
            'card.cvv',
            'card.isCardInfoSaved',
            'check.nameOnCheck',
            'check.routingNumber',
            'check.checkNumber',
            'isSameBillingShippingAddress',
            'billingContact.firstName',
            'billingContact.lastNameOrSurname',
            'billingContact.address.address1',
            'billingContact.address.address2',
            'billingContact.address.address3',
            'billingContact.address.cityOrTown',
            'billingContact.address.countryCode',
            'billingContact.address.stateOrProvince',
            'billingContact.address.postalOrZipCode',
            'billingContact.phoneNumbers.home',
            'billingContact.email',
            'creditAmountToApply',
            'digitalCreditCode',
            'purchaseOrder.selectCreditCard',
            'purchaseOrder.purchaseOrderNumber',
            'purchaseOrder.paymentTerm'
        ].concat(poCustomFields()),
        renderOnChange: [
            'billingContact.address.countryCode',
            'paymentType',
            'isSameBillingShippingAddress',
            'usingSavedCard',
            'savedPaymentMethodId'
        ],
        additionalEvents: {
            "change [data-mz-digital-credit-enable]": "enableDigitalCredit",
            "change [data-mz-digital-credit-amount]": "applyDigitalCredit",
            "change [data-mz-digital-add-remainder-to-customer]": "addRemainderToCustomer",
            "change [name='paymentType']": "resetPaymentData",
            "change [data-mz-purchase-order-payment-term]": "updatePurchaseOrderPaymentTerm",
            'keyup #mz-payment-purchase-order-number' :'poNumber',
            'change #card-on-file, #terms-on-file':'changeTerms',
            "change .selectcard":"updateCardInfo"
        },
        initialize: function () {
                var test = window.test = 0;
          /*  var obj=require.mozuData('checkout').customer.attributes;
            var me=this;
            $(obj).each(function(k,v){
               if(v.fullyQualifiedName=="tenant~bucket"){
                me.model.set("customattribuese",v); 
               } 
            });*/
            this.listenTo(this.model, 'change:digitalCreditCode', this.onEnterDigitalCreditCode, this);
            this.listenTo(this.model, 'orderPayment', function (order, scope) {
                    this.render();
                }, this);
            this.listenTo(this.model, 'change:savedPaymentMethodId', function (order, scope) {
                $('[data-mz-saved-cvv]').val('').change();
                //this.render(); 
                if($('.mz-payment-select-saved-payments option:selected').text() === "Select a saved payment method"){
                    window.test  = 1;
                    window.testval = "";
                }
            }, this);
            this.codeEntered = !!this.model.get('digitalCreditCode');
        },
        getRenderContext: function () {
            var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);

            if(c.model.purchaseOrder.paymentTerms === undefined ){
                  window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder').set('paymentTerms',{file:null,card:null,cardNumber:null,profile:null,selectedCard:null});
            }
          
            //select card on file default
            if(window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.paymentTermOptions')){
                if( window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.paymentTermOptions').length=== 1 &&  window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.paymentTermOptions').models[0].get('code') === "card-on-file"){
                   window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.paymentTerms').card = true;
                }
                else if(window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.paymentTermOptions').length > 1 && 
                    window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.paymentTerms').card === null && 
                    window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.paymentTerms').file === null){
                    if( window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.paymentTerm.code') === "terms-on-file"|| window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.paymentTerm.code') === undefined){
                    window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.paymentTerms').file = true;
					//this.updatePurchaseOrderPaymentTerm('terms-on-file');
					this.model.setPurchaseOrderPaymentTerm('terms-on-file');
                    }else{
                        window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.paymentTerms').card = true;
                        this.model.setPurchaseOrderPaymentTerm("card-on-file");
                    }
                }else if(window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.paymentTermOptions').length === 1 &&
				window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.paymentTermOptions').models[0].get('code') === "terms-on-file"){
                    window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.paymentTerms').file = true;
                }
            }
            window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder').set('cards',window.rescards);
            return c;
        }, 
        poNumber:function(e){
            if((e.charCode>32 && e.charCode<45) || (e.charCode>57 && e.charCode<65) || (e.charCode>90 && e.charCode<97 && e.charCode!==95) || (e.charCode>122 && e.charCode<126) || e.charCode ===46 || e.charCode===47 ||  e.charCode == 32){
                return false;
            }
            if($(e.currentTarget).val().trim().length>2){
               $('#mz-payment-purchase-order-number').removeClass('is-invalid');
               $('.reqnumbers').css("color","#8c8c8c");
            }else{
               $('#mz-payment-purchase-order-number').addClass('is-invalid');
                $('.reqnumbers').css("color","red");
                //$('.placeorder').prop('disabled',true);
            }
        },
        changeTerms:function(e){
            var selectedCard = _.findWhere(this.model.get('purchaseOrder.cards').res,{isExpired: false});
            if(e.currentTarget.value === "card-on-file"){
                $('.maincard').show(); 
                this.model.get('purchaseOrder.paymentTerms').card  = true;
                this.model.get('purchaseOrder.paymentTerms').file  = false;
            
            this.model.get('purchaseOrder.paymentTerms').cardNumber = selectedCard.token!== undefined ?selectedCard.token: "";
            this.model.get('purchaseOrder.paymentTerms').profile = selectedCard.profileid;
            this.model.get('purchaseOrder.paymentTerms').selectedCard = true;
            this.model.get('purchaseOrder').set('selectCreditCard',selectedCard.token); 
            }else{ 
                $('.maincard').hide();
                this.model.get('purchaseOrder.paymentTerms').file = true;
                this.model.get('purchaseOrder.paymentTerms').card  = false;
                this.model.get('purchaseOrder.paymentTerms').profile = null;
                this.model.get('purchaseOrder.paymentTerms').selectedCard = null;
                this.model.get('purchaseOrder.paymentTerms').cardNumber = null;
                this.model.set('purchaseOrder.pOCustomField-profileid','');
                this.model.set('purchaseOrder.pOCustomField-cardnumber',''); 
                 
            }
            
            this.render();
        },
        updateCardInfo:function(e){
            var selectedCard = _.findWhere(this.model.get('purchaseOrder.cards').res,{token: $(e.currentTarget).val()});
            /*$('#mz-payment-pOCustomField-cardnumber').val(selectedCard.token);
            $('#mz-payment-pOCustomField-profileid').val(selectedCard.profileid);
            */
            this.model.get('purchaseOrder.paymentTerms').cardNumber = selectedCard.token!== undefined ?selectedCard.token: "";
            this.model.get('purchaseOrder.paymentTerms').profile = selectedCard.profileid;
            this.model.get('purchaseOrder.paymentTerms').selectedCard = true;    
            
            this.render();
        },
        addCard:function(){
            $('.card-over').show(); 
            $('.carddetails .mz-validationmessage').text("");
        },
        
        dateSelector:function(_sfo){
            var finaldate;
            var heat;
            var finalDate;
            if(this.isHeatSensitive()){
                finaldate  = this.heatSensitvieDatePicker(_sfo);
                finalDate = finaldate.replace(/-/g,'/');
                heat = true;
            }else{
                finaldate = this.datePicker(_sfo);
                finalDate = finaldate.replace(/-/g,'/');
                heat = false;
            }
               
            // Date Picker 
            $('.datePicker').datepicker({
                beforeShowDay: heatSensitive,
                minDate:'0',
                maxDate: '+12m',
                dateFormat: "mm-dd-yy",	
                onSelect: function(dateText, inst) { 
                    var date = $(this).datepicker('getDate'),
                    day  = date.getDate(),  
                    month = date.getMonth() + 1,              
                    year =  date.getFullYear();
                    var shipdate= ('0'+month).slice(-2)+ '-' + ('0'+day).slice(-2) + '-' + year;
                    window.shipdate = shipdate;
                     $('.datePicker').datepicker("setDate",shipdate);
                    $('.datePicker').val(shipdate);
                    window.checkoutViews.steps.shippingInfo.calculateColdPacks(date);
                    //$('.estimateddate').text(shipdate);   
                }
            });
               
           if(window.shipdate){
                var selected =  window.shipdate;
                $('.datePicker').datepicker("setDate",selected);
                $('.datePicker').val(selected);
            }else{
                 $('.datePicker').datepicker("setDate",finaldate);
                 $('.datePicker').val(finaldate);
                 $('.datePicker').val(finaldate);
            }
            function heatSensitive(date) {
                    //var restDates= Hypr.getThemeSetting('shipping_date');
                    var blackoutdates = "";
                    if(window.getDates && window.getDates.BlackoutDates.length > 0) {
                        blackoutdates = window.getDates.BlackoutDates.map(function(d) {
                           return window.formatDate(d);
                        });
                    }
                    var day;
                    var m = date.getMonth();
                    var d = date.getDate();
                    var y = date.getFullYear();
                
                    var dd = new Date();
                    var mm=dd.getMonth();
                    var ddd=dd.getDate();
                    var yy=dd.getFullYear();
                    
                    var shipdate =new Date(finalDate);
                    var currentDate=  ('0'+(mm+1)).slice(-2)+"/"+('0'+ddd).slice(-2)+"/"+ yy;
                    var compareDate = ('0'+(m+1)).slice(-2) + '/' +('0'+d).slice(-2) + '/' + y;
                    if(heat){
                        for (var i = 0; i < blackoutdates.length; i++) {
                        if ($.inArray( compareDate, blackoutdates) != -1 || new Date() > date  || shipdate > date ) {
                                return [false];
                            }
                        }
                        day = date.getDay();
                        if (day === 3 || day === 4 || day === 5 || day === 6 || day === 0 ) {
                            return [false] ; 
                        }else { 
                        return [true] ;
                        }
                    }else{
                        for (var j = 0; j < blackoutdates.length; j++) {
                            if ($.inArray( compareDate,blackoutdates) != -1 || new Date() > date || shipdate > date  ) {
                                return [false];
                            }
                        }
                        day = date.getDay();
                        if (day === 6 || day === 0 ) {
                            return [false] ; 
                        } else { 
                            return [true] ;
                        }
                    }     
                }
        },
        phoneNumberFormating2: function(e){
            var keyChar  = $('input[name="shippingphone"]').val()[$('input[name="shippingphone"]').val().length-1];
            var value = $('input[name="shippingphone"]').val();
            if(keyChar === "!" || keyChar === "@" || keyChar === "#" || keyChar === "$" || keyChar === "%" || keyChar === "^" || keyChar === "&"  || keyChar === "*" || keyChar === "(" || keyChar === ")" || keyChar === "_" || keyChar === "+" || keyChar === "~"){
                $('input[name="shippingphone"]').val(value.substr(0,value.length-1));
            }
        },
        phoneNumberFormating : function(e){
            if(e.shiftKey){
                e.stopPropagation();
                e.preventDefault();
            }
            if((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode === 9){     
                var keyChar = String.fromCharCode( e.keyCode);
                var length = $('input[name="shippingphone"]').val().length;
                switch(length){
                    case(0): 
                        $('input[name="shippingphone"]').val('('+$('input[name="shippingphone"]').val());
                        break;
                    case(4): 
                        $('input[name="shippingphone"]').val($('input[name="shippingphone"]').val()+') ');
                        break;
                    case(9): 
                        $('input[name="shippingphone"]').val($('input[name="shippingphone"]').val()+'-');
                        break;
                }
            }else{
                    if(e.keyCode != 8){
                        e.stopPropagation();
                        e.preventDefault();
                    }
            }
        },
        
        datePickerFormat:function(fdate){
            var businessdays = 2,blackoutdates = [],date = new Date(),finaldate,self =this;
            if(window.getDates && window.getDates.BlackoutDates.length > 0) {
                blackoutdates = window.getDates.BlackoutDates.map(function(d) {
                   return window.formatDate(d);
                });
            }
            var day,month,year,fulldate,currentDate,comparedate;
            while(businessdays){
                date.setFullYear(date.getFullYear(),date.getMonth(),(date.getDate()+1));
                day = date.getDay();
                month = date.getMonth();
                year = date.getFullYear();
                currentDate = date.getDate(); 
                fulldate= ('0'+(month+1)).slice(-2)+ '-' + ('0'+currentDate).slice(-2) + '-' + year;
                comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                
            
                if(day===0 || day===6 || blackoutdates.indexOf(comparedate) !== -1 || new Date() > comparedate){
                    date.setFullYear(year,month,currentDate);
                }else{
                    businessdays--;
                }
            }
            if(fdate && fdate>date){
                var udate = self.finalShipDatePicker(fdate);
                finaldate = ('0'+(udate.getMonth()+1)).slice(-2)+ '/' + ('0'+udate.getDate()).slice(-2) + '/' + udate.getFullYear();
            }else{
                finaldate = ('0'+(date.getMonth()+1)).slice(-2)+ '/' + ('0'+date.getDate()).slice(-2) + '/' + date.getFullYear();
            }
            $('.earliest-date span').text(finaldate);
            $('#first-shipdate').text(finaldate);
            //$('.datePicker').datepicker("setDate",final);
            return finaldate;  
        },
        finalShipDatePicker:function(finalShipDate){
            var self = this,date = new Date(finalShipDate),businessdays=1,blackoutdates = [],
                day,month,year,fulldate,currentDate,comparedate;
                
            if(window.getDates && window.getDates.BlackoutDates.length > 0) {
                blackoutdates = window.getDates.BlackoutDates.map(function(d) {
                   return window.formatDate(d);
                });
            }   
            date.setFullYear(date.getFullYear(),date.getMonth(),(date.getDate()+1));
            while(businessdays){
                date.setFullYear(date.getFullYear(),date.getMonth(),date.getDate());
                day = date.getDay();
                month = date.getMonth();
                year = date.getFullYear();
                currentDate = date.getDate(); 
                comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                if(day===0 || day===6 || blackoutdates.indexOf(comparedate) !== -1){
                    date.setFullYear(year,month,(currentDate+1));
                }else{
                    businessdays--;
                }
            }
            return date;
        },
        datePickerFormatFirstShipDate:function(date){
            var businessdays=1,blackoutdates = [];
            if(window.getDates && window.getDates.BlackoutDates.length > 0) {
                blackoutdates = window.getDates.BlackoutDates.map(function(d) {
                   return window.formatDate(d);
                });
            }
            var day,month,year,fulldate,currentDate,comparedate;
            while(businessdays){
                day = date.getDay();
                month = date.getMonth();
                year = date.getFullYear();
                currentDate = date.getDate(); 
                fulldate= ('0'+(month+1)).slice(-2)+ '-' + ('0'+currentDate).slice(-2) + '-' + year;
                comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                
                if(day===0 || day===6 || blackoutdates.indexOf(comparedate) !== -1 || new Date() > comparedate){
                    date.setFullYear(year,month,(currentDate+1));
                }else{
                    businessdays--;
                }
            }
            date.setFullYear(year,month,(date.getDate()));
            var finaldate = ('0'+(date.getMonth()+1)).slice(-2)+ '/' + ('0'+date.getDate()).slice(-2) + '/' + date.getFullYear();
            
            $('.earliest-date span').text(finaldate);
            $('#first-shipdate').text(finaldate);
            return finaldate;
        },
        datePicker:function(_Sfo){
            var date = new Date(),sdate;
            if(typeof _Sfo != "undefined"){
                date = new Date(_Sfo);
            }
            return this.datePickerFormat(date);
        },
        heatSensitvieDatePicker:function(_sfo){ 
            var date = new Date(),sdate,businessdays =2,blackoutdates = [],self = this,finalShipDate,bufferday=0,
            day,month,year,currentDate,comparedate,finaldate ;
            
            if(typeof _sfo != "undefined"){ 
                sdate = new Date(_sfo);
            }
            if(window.getDates && window.getDates.BlackoutDates.length > 0) {
                blackoutdates = window.getDates.BlackoutDates.map(function(d) {
                   return window.formatDate(d);
                });
            }
            while(businessdays){
                day = date.getDay(); 
                month = date.getMonth();
                year = date.getFullYear();
                currentDate = date.getDate(); 
               // fulldate= ('0'+(month+1)).slice(-2)+ '-' + ('0'+currentDate).slice(-2) + '-' + year;
                comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                if(bufferday && (day===0 || day===6 || day===3 || day===4 || day===5 ||blackoutdates.indexOf(comparedate) !== -1) ){
                    date.setFullYear(year,month,(currentDate+1));
                }else if(!bufferday && (day===0 || day===6 ||blackoutdates.indexOf(comparedate) !== -1) ){
                    date.setFullYear(year,month,(currentDate+1));
                }else if(!bufferday && (day===2 || day===3 || day===4)){
                    var cdate = new Date(); 
                    cdate.setFullYear(year,month,(currentDate+1));
                    if(cdate.getDay()!==0 && cdate.getDay()!==6 && blackoutdates.indexOf(
                        ('0'+(cdate.getMonth()+1)).slice(-2)+ '/' + ('0'+cdate.getDate()).slice(-2) + '/' + cdate.getFullYear())===-1 ){
                        businessdays--;
                        bufferday=1;        
                    }
                    date.setFullYear(year,month,(currentDate+1));
                }else if(!bufferday && day===5){
                    var hdate = new Date();
                    hdate.setHours(11,51,0);
                    if(date<hdate){
                        businessdays--;
                        bufferday=1;
                        date.setFullYear(year,month,(currentDate+1));
                    }else if(date>hdate){
                        date.setFullYear(year,month,(currentDate+1));
                    }
                }else if(!bufferday && day===1){
                    var mdate = new Date();
                    mdate.setHours(11,51,0);
                    if(date<mdate){
                        businessdays--;
                        bufferday=1;
                        date.setFullYear(year,month,(currentDate+1));
                    }else if(date>mdate){
                        date.setFullYear(year,month,(currentDate+1));
                    }
                }else if(bufferday && (day===1 || day===2) && blackoutdates.indexOf(comparedate) !== -1){
                    date.setFullYear(year,month,(currentDate+1));
                }else if(bufferday && (day===1 || day===2) && blackoutdates.indexOf(comparedate) === -1){
                    businessdays--;
                } 
                else{
                    businessdays--;
                    date.setFullYear(year,month,(currentDate+1));
                    bufferday=1;
                }
            }
            if(sdate && sdate && sdate>date){
                var fdate = self.finalShipHeatDatePicker(sdate);
                finaldate = ('0'+(fdate.getMonth()+1)).slice(-2)+ '/' + ('0'+fdate.getDate()).slice(-2) + '/' + fdate.getFullYear(); 
            }else{
                finaldate = ('0'+(date.getMonth()+1)).slice(-2)+ '/' + ('0'+date.getDate()).slice(-2) + '/' + date.getFullYear(); 
            }
            $('.earliest-date span').text(finaldate);
            $('#first-shipdate').text(finaldate); 
            return finaldate;
        },
        finalShipHeatDatePicker:function(finalShipDate){
            var self = this,date = new Date(finalShipDate),businessdays=1,blackoutdates = [],
                day,month,year,fulldate,currentDate,comparedate;
            if(window.getDates && window.getDates.BlackoutDates.length > 0) {
                blackoutdates = window.getDates.BlackoutDates.map(function(d) {
                   return window.formatDate(d);
                });
            }    
            while(businessdays){
                date.setFullYear(date.getFullYear(),date.getMonth(),date.getDate());
                day = date.getDay();
                month = date.getMonth();
                year = date.getFullYear();
                currentDate = date.getDate(); 
                comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                if(day===0 || day===6 ||  day===3 ||  day===4 || day===5 || blackoutdates.indexOf(comparedate) !== -1){
                    date.setFullYear(year,month,(currentDate+1));
                }else{
                    businessdays--;
                }
            }
            return date;
        },
        isHeatSensitive:function(){
            if(Hypr.getThemeSetting('heatsensitive')){
                var items = window.checkoutViews.orderSummary.model.get('items');
                var itemsLength = items.length; 
                var i=0;
                for(i;i<itemsLength;i++ ){
                    if(items[i].product.properties.length>0){
                        var j = 0;
                        var proLength =items[i].product.properties.length;
                        for(j;j<proLength;j++){
                            if(items[i].product.properties[j].attributeFQN==="tenant~isheatsensitive" || items[i].product.properties[j].attributeFQN==="tenant~IsHeatSensitive" ){
                                if(items[i].product.properties[j].values[0].value){
                                    return true;
                                }
                            }
                        }
                    }
                }    
                return false;
            }else{
                return false;
            }
        },
        resetPaymentData: function (e) {
            window.testval = $(e.currentTarget).val();
            if (e.target !== $('[data-mz-saved-credit-card]')[0]) {
                $("[name='savedPaymentMethods']").val('0');
            }
            this.model.clear();
            this.model.resetAddressDefaults();
            if(HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.isEnabled) {
                this.model.setPurchaseOrderInfo();
            }
        }, 
        updatePurchaseOrderPaymentTerm: function(e) {
            this.model.setPurchaseOrderPaymentTerm(e.target.value);
        },
        render: function() {
                var self = this; 
                CheckoutStepView.prototype.render.apply(this, arguments);
            var status = self.model.stepStatus();
                if(typeof window.getDates !== "undefined" && typeof window.getDates.FirstShipDate !== "undefined"){
                    var udate =  new Date(window.getDates.FirstShipDate),
                        sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
                    // sdate.setUTCHours(new Date().getUTCHours());
                    // var hours = sdate.getHours();
                    // if(hours >= 12){
                    //     sdate.setDate(sdate.getDate()+1);
                    // }
                    self.dateSelector(sdate);
                }    
                self.model.set('paymentType', 'PurchaseOrder');
               // $('.mz-payment-select-saved-payments').blur();
           /* if(window.test && !($(".mz-paymenttype-input[value=PurchaseOrder]").is(":checked")) && window.testval != "PurchaseOrder" && !$(".mz-paymenttype-input[value=CreditCard]").is(':checked')){ 
                $('.mz-paymenttype-input[value="CreditCard"]').trigger("click");
             
            }else if(window.testval == "PurchaseOrder" && (!window.test)){
                $('.mz-paymenttype-input[value="PurchaseOrder"]').trigger("click");    
            }*/
        },
        updateAcceptsMarketing: function(e) {
            this.model.getOrder().set('acceptsMarketing', $(e.currentTarget).prop('checked'));
        },
        updatePaymentType: function(e) {
            var newType = $(e.currentTarget).val();
            this.model.set('usingSavedCard', e.currentTarget.hasAttribute('data-mz-saved-credit-card'));
            this.model.set('paymentType', newType);
            if(newType === "PurchaseOrder"){
                this.model.setPurchaseOrderBillingInfo();
            }
        },
        beginEditingCard: function() {
            var me = this;
            if (!this.model.isExternalCheckoutFlowComplete()) {
                this.editing.savedCard = true;
                this.render();
            } else {
                this.cancelExternalCheckout();
            }
        },
        beginEditingExternalPayment: function () {
            var me = this;
            if (this.model.isExternalCheckoutFlowComplete()) {
                this.doModelAction('cancelExternalCheckout').then(function () {
                    me.editing.savedCard = true;
                    me.render();
                });
            }
        },
        beginEditingBillingAddress: function() {
            this.editing.savedBillingAddress = true;
            this.render();
        },
        beginApplyCredit: function () {
            this.model.beginApplyCredit();
            this.render();
        },
        cancelApplyCredit: function () {
            this.model.closeApplyCredit();
            this.render();
        },
        cancelExternalCheckout: function () {
            var me = this;
            this.doModelAction('cancelExternalCheckout').then(function () {
                me.editing.savedCard = false;
                me.render();
            });
        },
        finishApplyCredit: function () {
            var self = this;
            this.model.finishApplyCredit().then(function() {
                self.render();
            });
        },
        removeCredit: function (e) {
            var self = this,
                id = $(e.currentTarget).data('mzCreditId');
            this.model.removeCredit(id).then(function () {
                self.render();
            });
        },
        getDigitalCredit: function (e) {
            var self = this;
            this.$el.addClass('is-loading');
            this.model.getDigitalCredit().ensure(function () {
                self.$el.removeClass('is-loading');
            });
        },
        stripNonNumericAndParseFloat: function (val) {
            if (!val) return 0;
            var result = parseFloat(val.replace(/[^\d\.]/g, ''));
            return isNaN(result) ? 0 : result;
        },
        applyDigitalCredit: function(e) {
            var val = $(e.currentTarget).prop('value'),
                creditCode = $(e.currentTarget).attr('data-mz-credit-code-target');  //target
            if (!creditCode) {
                return;
            }
            var amtToApply = this.stripNonNumericAndParseFloat(val);
            
            this.model.applyDigitalCredit(creditCode, amtToApply, true);
            this.render();
        },
        onEnterDigitalCreditCode: function(model, code) {
            if ($.trim(code) && !this.codeEntered) {
                this.codeEntered = true; 
                this.$el.find('button').prop('disabled', false);
            }
            if (!$.trim(code) && this.codeEntered) {
                this.codeEntered = false;
                this.$el.find('button').prop('disabled', true);
            }
            $('#digital-credit-code').val($.trim(code));
        },
        enableDigitalCredit: function(e) {
            var creditCode = $(e.currentTarget).attr('data-mz-credit-code-source'),
                isEnabled = $(e.currentTarget).prop('checked') === true,
                targetCreditAmtEl = this.$el.find("input[data-mz-credit-code-target='" + creditCode + "']"),
                me = this;

            if (isEnabled) {
                targetCreditAmtEl.prop('disabled', false);
                me.model.applyDigitalCredit(creditCode, null, true);
            } else {
                targetCreditAmtEl.prop('disabled', true);
                me.model.applyDigitalCredit(creditCode, 0, false);
                me.render();
            }
        },
        addRemainderToCustomer: function (e) {
            var creditCode = $(e.currentTarget).attr('data-mz-credit-code-to-tie-to-customer'),
                isEnabled = $(e.currentTarget).prop('checked') === true;
            this.model.addRemainingCreditToCustomerAccount(creditCode, isEnabled);
        },
        handleEnterKey: function (e) {
            var source = $(e.currentTarget).attr('data-mz-value');
            if (!source) return;
            switch (source) {
                case "creditAmountApplied":
                    return this.applyDigitalCredit(e);
                case "digitalCreditCode":
                    return this.getDigitalCredit(e);
            }
        }
    });

    var CouponView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/coupon-code-field',
        handleLoadingChange: function (isLoading) {
            // override adding the isLoading class so the apply button 
            // doesn't go loading whenever other parts of the order change
        },
        initialize: function() {
            var me = this;
            this.listenTo(this.model, 'change:couponCode', this.onEnterCouponCode, this);
            this.codeEntered = !!this.model.get('couponCode');
            this.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    if (me.codeEntered) {
                        me.handleEnterKey();
                    }
                    return false;
                }
            });
        },
        onEnterCouponCode: function (model, code) {
            if ($.trim(code) && !this.codeEntered) {
                this.codeEntered = true; 
                this.$el.find('button').prop('disabled', false);
            }
            if (!$.trim(code) && this.codeEntered) {
                this.codeEntered = false;
                this.$el.find('button').prop('disabled', true);
            }
            $('#coupon-code').val($.trim(code));
        },
        autoUpdate: [
            'couponCode'
        ],
        addCoupon: function (e) {
            // add the default behavior for loadingchanges
            // but scoped to this button alone
           var self = this;
            if( $.trim($('#coupon-code').val()) === ""){
                $(".mz-messagebar").html('<ul class="is-showing mz-errors"><li>Please enter gift certificate code</li></ul>');
            }else{
                this.$el.addClass('is-loading');
                this.model.addCoupon().ensure(function() {
                    self.$el.removeClass('is-loading');
                    self.model.unset('couponCode');
                    self.render(); 
                });   
            }
          },
        handleEnterKey: function () {
            this.addCoupon();
        }
    });

    var CommentsView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/comments-field',
        autoUpdate: ['shopperNotes.giftMessage'],
        render: function(){
            var OSName = "Unknown";
             var storeclientdetail= '';
             var $userAgent = '';
           
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
            
              else if ((verOffset=nAgt.indexOf("Edge"))!=-1) {
            browserName = "IE Edge";
            fullVersion = nAgt.substring(verOffset+8);
            }
            // In older Opera, the true version is after "Opera" or after "Version"
            else if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
            browserName = "Opera";
            fullVersion = nAgt.substring(verOffset+6);
            if ((verOffset=nAgt.indexOf("Version"))!=-1) 
            fullVersion = nAgt.substring(verOffset+8);
            }
            // In MSIE, the true version is after "MSIE" in userAgent
            else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
            browserName = "Microsoft Internet Explorer";
            fullVersion = nAgt.substring(verOffset+5);
            }
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
             var a=window.navigator.appVersion;
            var b=a.split(' ');
            if(b[b.length - 1]=="Edge/12.10240" ){
            var c =b[b.length - 1].split('/');
            browserName = c[0];
            fullVersion = c[1];
            
            } 
            // alert( $userAgent)
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
  
            var ipaddress = this.model.get('ipAddress');
            var orderNotes;
             if( $userAgent === 'Internet Explorer'){
                orderNotes = {
                    
                    IP_Address:ipaddress,
                    Browser_Name_Version:$userAgent+" "+fullVersion,
                    OS_Name_Version:OSName,
					userEmail: decodeURIComponent($.cookie('userData'))
                    
                };
            }else{
                orderNotes = {
                    
                    IP_Address:ipaddress,
                    Browser_Name_Version:browserName+" "+fullVersion,
                    OS_Name_Version:OSName,
					userEmail: decodeURIComponent($.cookie('userData'))
                    
                };
            }
                   
          
        var notes=JSON.stringify(orderNotes);   
            
            this.model.get('shopperNotes').set('comments',notes);
            Backbone.MozuView.prototype.render.apply(this);
        }
                
    });

    var ReviewOrderView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/step-review',
        autoUpdate: [
            'createAccount',
            'agreeToTerms',
            'emailAddress',
            'password',
            'confirmPassword'
        ],
        renderOnChange: [
            'createAccount',
            'isReady'
        ],
        initialize: function () {
            var me = this;
            this.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    me.handleEnterKey();
                    return false;
                }
            });
            this.model.on('passwordinvalid', function(message) {
                if(message.indexOf("Adding customer failed for the following reason: Missing or invalid parameter: EmailAddress") < 0){
                    if(message.indexOf("Passwords did not match, please reenter"))
                        message = "Password not matching.";
                    me.$('[data-mz-validationmessage-for="password"]').text(message);
                }
            });
            this.model.on('userexists', function (user) {
                me.$('[data-mz-validationmessage-for="emailAddress"]').html(Hypr.getLabel("customerAlreadyExists", user, encodeURIComponent(window.location.pathname)));
            });
        },
        submit: function () {
            var self = this;
            _.defer(function () {
				if (self.model.commentsReformatted.length > 10) { 
					self.model.set('shopperNotes.giftMessage',self.model.commentsReformatted);
				}
               /* if($.cookie('userData')!== "null" && $.cookie('userData')!== undefined ){
                  self.model.get('fulfillmentInfo.fulfillmentContact').set('email',JSON.parse($.cookie('userData')).email);
                }*/
                 var userEmail;
                   if($.cookie('userData')!== "null" && $.cookie('userData')!== undefined){
                      userEmail = decodeURIComponent($.cookie('userData'));
                      if(userEmail !== undefined && userEmail !== "null"){
                        api.request('get','/svc/userCapture/'+self.model.get('orderNumber')+'/'+userEmail+'/'+self.model.get('ipAddress')  ).then(function(resp){
							document.cookie = "orderNumber=" + String(self.model.get('orderNumber'));
                            self.model.submit();
                        });
                        api.on('error',function(e){self.model.submit();});
                      }else{
                          self.model.submit();
                      }
                   }else{
                       self.model.submit();
                   }
                  /* var userData = {
                       email: userEmail,
                       orderNumber:self.model.get('orderNumber'),
                       ipAddress:self.model.get('ipAddress')
                   };*/
                    
                 /*  $.ajax({
                        method:'POST',
                        url:'/svc/userCapture',
                        data: JSON.stringify(userData),
                        dataType: 'json',
                        contentType: 'application/json',  
                        success:function(res){
                           
                        }
                   });*/
				//self.model.submit();
            });
        },
        handleEnterKey: function () {
            this.submit();
        },
		generateSubscriptionId: function(accn, length) {
            return accn + Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
        },
		subscribe: function() {
			$(".overlay-for-complete-page").addClass("overlay-shown");
			$("#page-content").addClass("is-loading");
			window.orderSummary.model.set("subscriptionStatus", "active");

            var urlParams = this.getUrlParams(window.location.href); 
                var editSubsId = urlParams.subId ? urlParams.subId :"";  
                var subscriptionId = (editSubsId) ? editSubsId : this.generateSubscriptionId(window.order.attributes.customerAccountId, 7);
                var userId = require.mozuData("user").userId;
                var createdDate = new Date().toISOString();
                var modifiedDate = new Date().toISOString();
                var order = {};
                order.customerId = userId; 
                order.subscriptionId = subscriptionId;
                order.modifiedDate = modifiedDate;
                order.subscribedStatus = "Active"; 
                order.lastOrderDate = null; 
                try{
                    order.nextOrderDate = new Date($(document).find('.subscription').find('#interval-startdate').val()).toISOString();
                } catch(err){
                    order.nextOrderDate = "";
                }
                order.lastCheckDate = null;
                order.order =  window.order.attributes;
                order.schedule = window.orderSummary.model.attributes.scheduleInfo;
                order.completedOrders = [];
                order.nickname = require.mozuData('user').firstName;
                try {
                      if(editSubsId){
                        var me = this;
                        api.request('POST', '/svc/getSubscription',{method:"GET",subscriptionId:editSubsId}).then(function(res) {
                            if (!res.error &&  res.res.subscriptionId !== undefined) {
                                var existingorder = res.res;
                                existingorder.modifiedDate = modifiedDate;
                                existingorder.subscribedStatus = "Active"; 
                                existingorder.nextOrderDate = order.nextOrderDate;
                                existingorder.order = order.order;
                                existingorder.schedule = order.schedule;
                                me.updateSubscription(existingorder,editSubsId);
                            }   
                        }, function(er) {
                            // fail condition
                            console.log("Data error " + er);
                        });
                      }
                      else {
                        this.createSubscription(order,subscriptionId,createdDate,modifiedDate);
                      }
                      //if(typeof $.cookie("subscriptionCreated") !== 'undefined' && $.cookie("subscriptionCreated") == 'true'){
                } catch (error) {
                    console.error(error);
                }
		},
        createSubscription: function(order,subscriptionId,createdDate,modifiedDate){
                var cartModel = new CartModels.Cart();
                order.createdDate = createdDate;           
                api.request('post','/svc/getSubscription',{method:"CREATE",data:order} ).then(function(res) {
                    if (res) {
                        cartModel.apiEmpty();
                        $.cookie("isSubscriptionActive", '', {
                            path: '/',
                            expires: -1
                        });
                        $.cookie("scheduleInfo", '', {
                            path: '/',
                            expires: -1
                        });
                        $.cookie("chktSub",'',{path: '/',expires: -1});
                        $.cookie("chktEdit",'',{path: '/',expires: -1});
                    }
                    setTimeout(function() {
                        $(".overlay-for-complete-page").removeClass("overlay-shown");
                        $("#page-content").removeClass("is-loading");
                        window.location.href = "/subscription-confirmation?subscription=" + subscriptionId;
                    }, 300);
                });
            },
            updateSubscription: function(order,subscriptionId){
                var cartModel = new CartModels.Cart();         
                api.request('post','/svc/getSubscription',{method:"UPDATE",data:order}).then(function(res) {
                    setTimeout(function() {
                        $(".overlay-for-complete-page").removeClass("overlay-shown");
                        $("#page-content").removeClass("is-loading");
                        window.location.href = "/subscription-confirmation?subscription=" + subscriptionId;
                    }, 300);
                    if (res) {
                        cartModel.apiEmpty();
                        CartMonitor.update();
                        $.cookie("isSubscriptionActive", '', {
                            path: '/',
                            expires: -1
                        });
                        $.cookie("scheduleInfo", '', {
                            path: '/',
                            expires: -1
                        });
                        $.cookie("chktSub",'',{path: '/',expires: -1});
                        $.cookie("chktEdit",'',{path: '/',expires: -1});
                    }
                });
            },
            getUrlParams:function(url){
        var regex = /[?&]([^=#]+)=([^&#]*)/g,params = {},match;
          while (match = regex.exec(url)) {
            params[match[1]] = match[2];
          }
          return params;
        },
		createSubscription1:function(existingEntityData,subscriptionInfo,ordersContainer,order,isEditSubscription,subscriptionId,createdDate,modifiedDate){
		    var cartModel = new CartModels.Cart();
			// check if entity already has data
			if (existingEntityData === "") {
				subscriptionInfo.createdDate = createdDate;
				ordersContainer.push(subscriptionInfo); 
				order.orderDetails = ordersContainer;
                
				api.request('post','/svc/getSubscription',{method:"CREATE",data:order} ).then(function(res) {
					if (res) {
						cartModel.apiEmpty();
						$.cookie("isSubscriptionActive", '', {
							path: '/',
							expires: -1
						});
						$.cookie("scheduleInfo", '', {
							path: '/',
							expires: -1
						});
						$.cookie("chktSub",'',{path: '/',expires: -1});
						$.cookie("chktEdit",'',{path: '/',expires: -1});
					}
					setTimeout(function() {
						$(".overlay-for-complete-page").removeClass("overlay-shown");
						$("#page-content").removeClass("is-loading");
						window.location.href = "/subscription-confirmation?subscription=" + subscriptionId;
					}, 300);
				});
			} else {
				// check if edit subscription is ON
				if (isEditSubscription && subscriptionId) {
					subscriptionInfo.modifiedDate = modifiedDate;
					existingEntityData.orderDetails.find(function(el, i) {
						if (el.subscriptionId == subscriptionId) {
							existingEntityData.orderDetails[i] = subscriptionInfo;
							//existingEntityData.orderDetails.push(subscriptionInfo);
							return;
						}
					});
				} else {
					subscriptionInfo.createdDate = createdDate;
					existingEntityData.orderDetails.push(subscriptionInfo);
				}
				api.request('post','/svc/getSubscription',{method:"UPDATE",data:existingEntityData}).then(function(res) {
					setTimeout(function() {
						$(".overlay-for-complete-page").removeClass("overlay-shown");
						$("#page-content").removeClass("is-loading");
						window.location.href = "/subscription-confirmation?subscription=" + subscriptionId;
					}, 300);
					if (res) {
						cartModel.apiEmpty();
						CartMonitor.update();
						$.cookie("isSubscriptionActive", '', {
							path: '/',
							expires: -1
						});
						$.cookie("scheduleInfo", '', {
							path: '/',
							expires: -1
						});
						$.cookie("chktSub",'',{path: '/',expires: -1});
						$.cookie("chktEdit",'',{path: '/',expires: -1});
					}
				});
			}
		}
    });

    var ParentView = function(conf) {
      var gutter = parseInt(Hypr.getThemeSetting('gutterWidth'), 10);
      if (isNaN(gutter)) gutter = 15;
      var mask;
      conf.model.on('beforerefresh', function() {
         killMask();
         conf.el.css('opacity',0.5);
         var pos = conf.el.position();
         mask = $('<div></div>', {
           'class': 'mz-checkout-mask'
         }).css({
           width: conf.el.outerWidth() + (gutter * 2),
           height: conf.el.outerHeight() + (gutter * 2),
           top: pos.top - gutter,
           left: pos.left - gutter
         }).insertAfter(conf.el);
      });
      function killMask() {
        conf.el.css('opacity',1);
        if (mask) mask.remove();
      }
      conf.model.on('refresh', killMask); 
      conf.model.on('error', killMask);
      return conf;
    };
    $(document).ready(function () {
        var $checkoutView = $('#checkout-form'),
            checkoutData = require.mozuData('checkout');
            
        /* v.r.s changes */
        var checkoutModel = window.order = new CheckoutModels.CheckoutPage(checkoutData);
        checkoutModel.set('billingInfo.totel',checkoutModel.get('total'));
        
        function getAndUpdateDates() {
            var orderModelItems = checkoutModel.get("items"),
                items = orderModelItems.map(function(item){ return item.product.productCode; });
            if(items.length>0){    
                api.request("post","/sfo/get_dates",{data: items})
                .then(function(r) {
                    var getDates = window.getDates = r;
                    updateShippingDates();
                },function(er) {
                    console.error(er);
                });
            }    
        }

        getAndUpdateDates();
			var updateShippingDates = window.updateShippingDates = function() {
            var blackoutdates = "";
            if(window.getDates && window.getDates.BlackoutDates.length > 0) {
                blackoutdates = window.getDates.BlackoutDates.map(function(d) {
                   return window.formatDate(d);
                });
            }
            window.checkoutViews.orderSummary.model.get('items').forEach(function(e,i) {
               var foundEl = _.findWhere(window.getDates.Items, {SKU: e.product.productCode});
               if(foundEl && foundEl.FirstShipDate) {
                    var udate = new Date(foundEl.FirstShipDate),
                    futureDate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
                    // futureDate.setUTCHours(new Date().getUTCHours());
                    // var hours = futureDate.getHours();
                    // if(hours >= 12){
                    //     futureDate.setDate(futureDate.getDate()+1);
                    // }
                   
                    var fdate = ('0'+(futureDate.getMonth()+1)).slice(-2)+ '/' + ('0'+futureDate.getDate()).slice(-2) + '/' + futureDate.getFullYear();
        
                    var nextday = new Date(),
						businessdays=2,day,month,year,currentDate,comparedate;
						while(businessdays){
							nextday.setFullYear(nextday.getFullYear(),nextday.getMonth(),(nextday.getDate()+1));
							day = nextday.getDay();
							month = nextday.getMonth();
							year = nextday.getFullYear();
							currentDate = nextday.getDate(); 
							comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
							 
							if(day===0 || day===6 ||blackoutdates.indexOf(comparedate) !== -1){
								nextday.setFullYear(year,month,currentDate);
							}else{
								businessdays--;
							}
						}
                        
                    /* check if date is regular or future and then determine if product is a regular one or SFO */
                    if(foundEl.inventory > 0 && futureDate > nextday) {
                        e.isFutureProduct = true;
                    }    
                   
                    e.nextAvailableDate = fdate;
                    e.availableInventory = foundEl.inventory;
                }
                else {
                   e.availableInventory = foundEl.inventory;
               }
            });
            
            var udate =  new Date(window.getDates.FirstShipDate),
                sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
                // sdate.setUTCHours(new Date().getUTCHours());
                // var hours = sdate.getHours();
                // if(hours >= 12){
                //     sdate.setDate(sdate.getDate()+1);
                // }
            window.checkoutViews.orderSummary.model.set("firstShipDate",sdate);
            window.checkoutViews.orderSummary.render();
            if(window.getDates)window.checkoutViews.steps.paymentInfo.dateSelector(sdate);
            $('.datePicker').datepicker('option', 'minDate', sdate);
            //$("#first-shipdate").text(formatDate(window.checkoutViews.orderSummary.model.get("firstShipDate")));
        };
        var formatDate = window.formatDate = function(date) {
            var udate = new Date(date),
            sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
            return ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
        };
        
            var checkoutViews = {
                parentView: new ParentView({
                  el: $checkoutView,
                  model: checkoutModel
                }),
                steps: {
                    shippingAddress: new ShippingAddressView({
                        el: $('#step-shipping-address'),
                        model: checkoutModel.get("fulfillmentInfo").get("fulfillmentContact")
                    }),
                    shippingInfo: new ShippingInfoView({
                        el: $('#step-shipping-method'),
                        model: checkoutModel.get('fulfillmentInfo')
                    }),
                    paymentInfo: new BillingInfoView({
                        el: $('#step-payment-info'),
                        model: checkoutModel.get('billingInfo')
                    })
                },
                orderSummary: new OrderSummaryView({
                    el: $('#order-summary'),
                    model: checkoutModel
                }),
                couponCode: new CouponView({
                    el: $('#coupon-code-field'),
                    model: checkoutModel
                }),
                // comments: Hypr.getThemeSetting('showCheckoutCommentsField') && new CommentsView({
                comments: new CommentsView({
                    el: $('#comments-field'),
                    model: checkoutModel
                }),
                
                reviewPanel: new ReviewOrderView({
                    el: $('#step-review'),
                    model: checkoutModel
                }),
                messageView: messageViewFactory({
                    el: $checkoutView.find('[data-mz-message-bar]'),
                    model: checkoutModel.messages
                })
            };

        window.checkoutViews = checkoutViews;
        window.orderSummary = window.checkoutViews.orderSummary;
        
        checkoutModel.on('complete', function() {
            CartMonitor.setCount(0);
            window.location = "/checkout/" + checkoutModel.get('id') + "/confirmation";
        });
        


      //  $('input[name="shippingphone"]').mask("(999) 999-9999");

        var $reviewPanel = $('#step-review');
        checkoutModel.on('change:isReady',function (model, isReady) {
            if (isReady) {
                setTimeout(function () { window.scrollTo(0, $reviewPanel.offset().top); }, 750);
            }
        });

        _.invoke(checkoutViews.steps, 'initStepView');

        $checkoutView.noFlickerFadeIn();
        
        $(document).on('keypress', '#coupon-code', function (e) {
            
                        if (e.which === 13) {
                            e.preventDefault();
                         return false;
                        }
                    });
        $(document).on('click','#copyshipping',function(e){
             $("html, body").animate({scrollTop:  $(e.target)[0].offsetTop }, 300);
        });
        $(document).on('click','.mz-shipmethod',function(e){
            $("#coupon-code-field").show();
        });
        $(document).on('click','.mz-digital-gift-card-product',function(e){
            $("#coupon-code-field").show();
        });

		
		_.defer(_.bind(checkoutViews.steps.shippingInfo.updateFreeShippingDisplays, checkoutViews.steps.shippingInfo));
        
		if (checkoutModel.hasHeatSensitiveItems()  && Hypr.getThemeSetting('heatsensitive')) {
            $('#heat-warning').css({ display: "block" });
            $('#hide-from-heat-sensitive').css({ display: "none" });
        }
       
        checkoutModel.commentsReformatted = "";
        
        
        
        // card on file
        
        var paymentModification = {};
        paymentModification.getCards = function(){
            var a = {customerNumber:require.mozuData('user').lastName} ;
            var ss = JSON.stringify(a);
            var self = this;
            $.ajax({
                method:'POST',
                url:'/svc/payments',
                data:ss,
                dataType: 'json',
                contentType: 'application/json',
                success:function(res){
                    if((res.error && res.error.indexOf('no profile')>-1) || ( res.res && res.res[0].respstat === "C" && res.res[0].resptext.indexOf("Profile not found")>-1)){
                        //$('.maincard').hide();
                        window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder').set('errors',Hypr.getLabel('noprofileid'));
                    }else if(res.error && res.error.indexOf('no cards')>-1){
                        window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder').set('profileid',res.profile);
                    }else{
                        var convertedRes = self.cardConvert(res.res);
                        window.rescards = res;
                        window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder').set('cards',res);
                    }
                    window.checkoutViews.steps.paymentInfo.render();
                }
            });
        };
        
        paymentModification.addCard = function(e){
                e.preventDefault();
                var card = {};
                var self = this;
                var validated = 0;
                var expMonth = "",expYear = "";
                $.each ($(e.currentTarget).serializeArray(),function(i,v){ 
                    if(v.value === "" && v.name !== "expirationYear" && v.name !== "expirationMonth" && v.name !== "address2"){
                        var error = self.validationError(v.name); 
                        if(error !== "validated"){
                            $('.carddetails [name="'+v.name+'"]').parent().find('.mz-validationmessage').text(error);
                        }
                    }else if(v.name === "expirationYear" || v.name === "expirationMonth"){
                       if(v.value !== "" &&  v.name === "expirationMonth"){
                           expMonth = v.value;
                       }else if(v.value !== "" &&  v.name === "expirationYear"){
                           expYear = v.value;
                       } 
                       else{
                            $('.carddetails [name="'+v.name+'"]').parent().find('.mz-validationmessage').text(Hypr.getThemeSetting('expires'));   
                       }
                       
                        if(expMonth !== "" && expYear !==""){
                           var exp =  self.expValidation(expMonth,expYear);
                           if(exp!== true){
                               $('.carddetails [name="'+v.name+'"]').parent().find('.mz-validationmessage').text(Hypr.getThemeSetting('expires'));
                           }else{
                               $('.carddetails [name="'+v.name+'"]').parent().find('.mz-validationmessage').text("");
                               card.expirationMonth = expMonth;
                               card.expirationYear = expYear;
                               validated = validated+2;
                           }
                        }
                    }else{
                       /* if(v.name === "cardNumber" && v.value.length!==16){
                             $('[name="'+v.name+'"]').parent().find('.mz-validationmessage').text(Hypr.getThemeSetting('cardNumberMissing'));
                        }else{*/
                            $('.carddetails [name="'+v.name+'"]').parent().find('.mz-validationmessage').text("");
                            card[v.name] = v.value;
                            validated++;
                        //}
                        
                    }
                });
                if( $(e.currentTarget).serializeArray().length === validated ){
                    if(window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.cards') && window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.cards').res.length>0){
                       card.profile =  window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.cards').res[0].profileid;
                    }else if(window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.profileid')){
                        card.profile = window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder.profileid');
                    }
                    $('.payment-loader').show();
                     var ss = JSON.stringify(card);
                    
                     $.ajax({
                        method:'POST',
                        url:'/svc/payments',
                        data:ss,
                        dataType: 'json',
                        contentType: 'application/json',  
                        success:function(res){
                            if(res.error && res.error.indexOf('not valid card')>-1){
                                $('.credit-overlay').show();
                                $('.crediterror').text(Hypr.getLabel('cardError'));
                            }else if(res.error && res.error.indexOf('cannot save the card')>-1){
                               $('.credit-overlay').show();
                                $('.crediterror').text(Hypr.getLabel('cardCannotAdd'));   
                            }else{
                                var convertedRes = self.cardConvert(res.res);
                                $('.credit-overlay').show();
                                $('.crediterror').text(Hypr.getLabel('cardAdded'));
                                window.rescards = res;
                                window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder').set('cards',res);
                            }
                            window.checkoutViews.steps.paymentInfo.render();
                            $('.payment-loader').hide();
                            $('.card-over').hide();
                            $('.carddetails :input,.carddetails select').val('');
                        },
                        fail:function(err){
                            console.log(err);
                            $('.payment-loader').hide();
                        }
                    });
                }
        };
        paymentModification.cardConvert = function(res){
            var curYear = new Date().getYear().toString().split('');
            curYear = curYear[1] + curYear[2];
            var curMonth = (new Date()).getMonth() + 1;
            
            $.each(res,function(i,v){
                var convCard = "";
                var tok = v.token;
                var a = tok.substr(tok.length-4,tok.length);
               for(var j=0;j<v.token.length-4;j++){
                   convCard+='X';
               }
               convCard = convCard+a;
               v.concard = convCard;
                if( v.expiry){
                    v.conExpiry = v.expiry[0]+v.expiry[1]+'/20'+v.expiry[2]+v.expiry[3];
                }
                if(parseInt((v.expiry[2] + v.expiry[3]), 10) > curYear){
                    v.isExpired = false;
                } else if(parseInt((v.expiry[2] + v.expiry[3]), 10) == curYear && parseInt((v.expiry[0] + v.expiry[1]), 10) >= curMonth){
                    v.isExpired = false;
                } else {
                    v.isExpired = true;
                }
            });
            return res;
        };
        
        paymentModification.validationError = function(name){
            var error;
            switch (name) {
                case "cardNumber":
                    error = Hypr.getLabel('cardNumberMissing');
                    break;
                case "credit-card-name":
                    error =  Hypr.getLabel('cardNameMissing');
                    break;
                 case "cvv":
                    error = Hypr.getLabel('securityCodeMissing');
                    break;    
                case "firstName":
                    error = Hypr.getLabel('firstNameMissing');
                    break;
                case "lastName":
                    error = Hypr.getLabel('lastNameMissing');
                    break;
                case "address1":
                    error = Hypr.getLabel('streetMissing');
                    break;
                case "ccity":
                    error = Hypr.getLabel('cityMissing');
                    break;
                case "state":
                    error = Hypr.getLabel('stateProvMissing');
                    break;
                case "zip":
                    error = Hypr.getLabel('postalCodeMissing');
                    break;
                default:
                    error="validated";
            }
            
            return error;
                        
        };
        
        paymentModification.expValidation = function(expMonth,expYear){
            var exp,
                thisMonth,
                isValid;

            if (isNaN(expMonth) || isNaN(expYear) || expMonth === 0 || expYear === 0) return Hypr.getThemeSetting('expires');

            exp = new Date(expYear, expMonth - 1, 1, 0, 0, 0, 0);
            thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);

            isValid = exp >= thisMonth;
            if (!isValid){
              return Hypr.getThemeSetting('expires');  
            }else{
                return true;
            }  
         };
         
        paymentModification.getCards();
        window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder').set('paymentTerms',{file:null,card:null,cardNumber:null,profile:null,selectedCard:null});
        
        if (typeof $.cookie("isSubscriptionActive") != "undefined") {
            window.checkoutViews.steps.paymentInfo.model.get('purchaseOrder').set('paymentTerms', {
                file: null,
                card: null,
                cardNumber: null,
                profile: null,
                selectedCard: null,
                isSubscriptionActive: true
            });
            $(document).find('#checkout-seasonal-notification').hide();
			$(document).find('.checkout-header h1').text('Subscription Checkout');
        }
        $('.credit-main').on('click','.continue',function(){
             $('.credit-overlay').hide(); 
        });
        $('.carddetails').on('submit',function(e){
            paymentModification.addCard(e);    
        });
        
        $('.cancel-button').on('click',function(){
            $('.card-over').hide();
        });
        
        $('.paymentTerm').on('click','.continue',function(){
            $('.paymentTerm').hide(); 
        });
        //end card on file
		if (typeof $.cookie("chktSub") != "undefined") {        
			if (window.history && window.history.pushState) {
				window.history.pushState('', null, './');
				$(window).on('popstate', function() {
					// $.cookie("chktSub",'',{path: '/',expires: -1});
					// $.cookie("chktEdit",'',{path: '/',expires: -1});
					window.location.href = '/subscriptions';

				});
			}
		}

    // try {
    //   var sd = window.checkoutViews.steps.paymentInfo.model.get("purchaseOrder").get("pOCustomField-shipdate");
    //   alert(sd);
    //   if (true){
    //     alert("yep");
    //     window.checkoutViews.steps.shippingInfo.calculateColdPacks(sd); 
    //   }
    // } catch (e) { console.log(e); }
    setInterval(function(){ 
      var fsd;
      try {
        fsd = window.checkoutViews.steps.paymentInfo.model.get("purchaseOrder").get("pOCustomField-shipdate"); // $("#first-shipdate").html();
      }
      catch (e) { fsd = ''; }
      if (fsd) {
        if (fsd != window.lastSetShipDate) {
          console.log("change in ship date: " + window.lastSetShipDate + " / " + fsd);
          window.lastSetShipDate = fsd;
          window.checkoutViews.steps.shippingInfo.calculateColdPacks(fsd);
        }
        else 
        { 
        console.log("same"); }
      }
  }, 2000);
  
  $("#step-payment-info").click(function(e){
    var fsd;
    try {
      fsd = window.checkoutViews.steps.paymentInfo.model.get("purchaseOrder").get("pOCustomField-shipdate"); // $("#first-shipdate").html();
    }
    catch (error) { fsd = ''; }
    window.checkoutViews.steps.shippingInfo.calculateColdPacks(fsd);
  });
    });
});
