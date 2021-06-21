require([
    "modules/jquery-mozu",
    "hyprlive",
    "modules/backbone-mozu",
    "modules/api",
    'modules/models-cart',
    "vendor/jquery-ui.min",
    "shim!vendor/owl.carousel[jquery=jQuery]>jQuery"
], function($, Hypr, Backbone, api, CartModels) {

    // function purchaseOrder() {

    // }

    $(document).ready(function() {
        console.log("page init");
        /*Detect IE browser and add js Array.find*/
        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent) || navigator.userAgent.indexOf("Trident/") > -1) {
            console.log("IE detected");
            if (!Array.prototype.find) {
                Object.defineProperty(Array.prototype, 'find', {
                    value: function(predicate) {
                        if (this === null) {
                            throw new TypeError('"this" is null or not defined');
                        }

                        var o = Object(this);

                        var len = o.length >>> 0;

                        if (typeof predicate !== 'function') {
                            throw new TypeError('predicate must be a function');
                        }

                        var thisArg = arguments[1];
                        var k = 0;

                        while (k < len) {
                            var kValue = o[k];
                            if (predicate.call(thisArg, kValue, k, o)) {
                                return kValue;
                            }
                            k++;
                        }
                        return undefined;
                    },
                    configurable: true,
                    writable: true
                });
            }
        }
        
        var customerId = require.mozuData("user").userId;
        var subscriptionId = window.location.search.split("=")[1];
        var existingEntityData = "";
        var subscribedItems = "",
            shippingInfo = "",
            paymentInfo = "",
            scheduleInfo = "",
            generalInfo = "";
        try {
           api.request('POST', '/svc/getSubscription',{method:"GET",subscriptionId:subscriptionId}).then(function(res) {
                 if (!res.error &&  res.res.subscriptionId !== undefined) {
                            var ob = res.res;
                            subscribedItems = ob.order.items; //array
                            paymentInfo = ob.order.payments; //array, contains billingInfo
                            shippingInfo = ob.order.fulfillmentInfo; //object, fulfillmentContact
                            scheduleInfo = ob.schedule; //object
                            generalInfo = ob.order;
                            console.log(ob.order.fulfillmentInfo);
                    $('.mz-confirmation-header').append('<h4>Your subscription number is <span>' + subscriptionId + '</span></h4>');

                    // display Shipping info
                    console.log(subscribedItems);
                    var shippingInfoBody = "",
                        shippingInfoFooter = "";
                    $.each(subscribedItems, function(k, v) {
                        shippingInfoBody += '<tr class="mz-row row-' + (k + 1) + '"><td class="mz-name">' + v.product.name + '</td>';
                        shippingInfoBody += '<td class="mz-qty">' + v.quantity + '</td>';
                        shippingInfoBody += '<td class="mz-price">';
                        if (v.unitPrice.listAmount != v.unitPrice.saleAmount) {
                            console.log(v);
                            shippingInfoBody += '<span class="mz-retailprice">$' + v.unitPrice.listAmount + '</span><span class="mz-saleprice">$' + v.unitPrice.saleAmount + '</span></td>';
                        } else {
                            shippingInfoBody += '<span class="mz-saleprice">$' + v.unitPrice.saleAmount + '</span></td>';
                        }
                        if(v.subtotal != v.discountedTotal) {
                            shippingInfoBody += '<td class="mz-product-total"><span class="mz-strikeout">$' + v.subtotal + '</span><span class="mz-total-amount"> $'+ v.discountedTotal +'</span></td></tr>';
                        } else {
                            shippingInfoBody += '<td class="mz-product-total"><span>$'+ v.discountedTotal +'</span></td></tr>';
                        }
                    });
                    console.log(shippingInfoBody);
                    $(".mz-shippinginfo-table>tbody").append(shippingInfoBody);
                    if($(window).width() > 767) {
                        shippingInfoFooter += '<tr class="desktop"><td colspan="4" class="mz-shipping-info-subtotal">';
                        shippingInfoFooter += '<div class="mz-shipto"><h4>SHIP TO</h4> <div>' + shippingInfo.fulfillmentContact.firstName + ' ' + shippingInfo.fulfillmentContact.lastNameOrSurname + '<br />'+ shippingInfo.fulfillmentContact.address.address1 +'<br />'+ shippingInfo.fulfillmentContact.address.cityOrTown +',<br />'+ shippingInfo.fulfillmentContact.address.stateOrProvince +' '+ shippingInfo.fulfillmentContact.address.postalOrZipCode +'</div></div>';
                        shippingInfoFooter += '<div class="mz-shipping-method"><h4>SHIPPING METHOD</h4> <div>' + shippingInfo.shippingMethodName + '</div></div>';
                        if (generalInfo.shippingTotal > 0) {
                            shippingInfoFooter += '<div class="mz-shipping-total"><h4>SHIPPING PRICE</h4> <div>$' + parseFloat(generalInfo.shippingTotal).toFixed(2) + '</div></div>';
                        }
                        shippingInfoFooter += '<div class="mz-subtotal"><h4>SUBTOTAL<h4> <div>$' + parseFloat(generalInfo.total).toFixed(2) + '</div></div></td></tr>';
                    } else {
                        shippingInfoFooter += '<tr class="mobile"><td colspan="4" class="mz-shipping-info-subtotal"><div class="mz-subtotal"><h4>SUBTOTAL<h4> <div>$' + parseFloat(generalInfo.total).toFixed(2) + '</div></div></td></tr>';
                        shippingInfoFooter += '<tr class="mobile"><td colspan="4" class="mz-shippinginfo-container"><div class="mz-shipto"><h4>SHIP TO</h4> <div>' + shippingInfo.fulfillmentContact.firstName + ' ' + shippingInfo.fulfillmentContact.lastNameOrSurname + '<br />'+ shippingInfo.fulfillmentContact.address.address1 +'<br />'+ shippingInfo.fulfillmentContact.address.cityOrTown +',<br />'+ shippingInfo.fulfillmentContact.address.stateOrProvince +' '+ shippingInfo.fulfillmentContact.address.postalOrZipCode +'</div></div>';
                        shippingInfoFooter += '<div class="mz-shipping-method"><h4>SHIPPING METHOD</h4> <div>' + shippingInfo.shippingMethodName + '</div></div></td></tr>';
                    }
                    $(".mz-shippinginfo-table>tfoot").append(shippingInfoFooter);


                    // display payment info
                    console.log(paymentInfo);
                    var paymentAmount = '<div class="mz-payment-main"><span class="mz-payment-amount">$' + paymentInfo[0].amountRequested + '</span><span>' + paymentInfo[0].paymentType + '</span></div>';
                    $(".mz-payment-table>thead").append(paymentAmount);

                    var paymentBillingInfo = '<div class="mz-billing"><h4>BILLING EMAIL</h4> <div>' + paymentInfo[0].billingInfo.billingContact.email + '</div></div>';
                    paymentBillingInfo += '<div class="mz-billing"><h4>BILLING NAME</h4> <div>' + paymentInfo[0].billingInfo.billingContact.firstName + ' ' + paymentInfo[0].billingInfo.billingContact.lastNameOrSurname + '</div></div>';
                    paymentBillingInfo += '<div class="mz-billing"><h4>BILLING ADDRESS</h4> <div>' + paymentInfo[0].billingInfo.billingContact.firstName + ' ' + paymentInfo[0].billingInfo.billingContact.lastNameOrSurname + '</div><div>' + paymentInfo[0].billingInfo.billingContact.phoneNumbers.home + '</div><div>' + paymentInfo[0].billingInfo.billingContact.address.address1 + '<br/>' + paymentInfo[0].billingInfo.billingContact.address.cityOrTown + ',<br/>' + paymentInfo[0].billingInfo.billingContact.address.stateOrProvince + ' ' + paymentInfo[0].billingInfo.billingContact.address.postalOrZipCode + '</div></div>';
                    paymentBillingInfo += '<div class="mz-billing"><h4>CARD NUMBER</h4>';
                        if(paymentInfo[0].paymentType == "creditcard") {
                            paymentBillingInfo += '<div><sup>**** **** ****</sup>1111</div></div>';
                        }
                    $(".mz-payment-table>tbody").append(paymentBillingInfo);


                    // display Scheduled info
                    var schedHead = '<div class="mz-billing"><h4>HOW OFTEN? EVERY</h4> <div>' + scheduleInfo.frequency + ' - ' + scheduleInfo.frequencyType + '</div></div>';
                    $(".mz-schedule-table>tbody").append(schedHead);
                    var sched = '<div class="mz-billing"><h4>FOR HOW LONG?</h4>';
                    if (scheduleInfo.endType == "null") {
                        sched += ' <div>Until I Cancel</div></div>';
                    } else {
                        sched += ' <div>' + scheduleInfo.endType + '</div></div>'; 
                    }
                    var date  = new Date(scheduleInfo.startDate),
                    startDate = new Date((date.getUTCMonth()+1)+'/'+date.getUTCDate()+'/'+date.getUTCFullYear()),
                    fdate = ('0'+(startDate.getMonth()+1)).slice(-2)+ '-' + ('0'+startDate.getDate()).slice(-2) + '-' + startDate.getFullYear();
                    sched += '<div class="mz-billing"><h4>WHEN? STARTING</h4> <div>' +fdate+ '</div></div>';
                    $(".mz-schedule-table>tbody").append(sched);

                    // handling charges info
                    var handlingInfo = '<table class="mz-handling"><tbody><tr class="mz-subtotal"><td>Subtotal:</td><td>$' + parseFloat(generalInfo.discountedTotal).toFixed(2) + '</td></tr><tr class="mz-shippingtotal"><td>Shipping &amp; Handling: </td><td>$' + parseFloat(generalInfo.shippingTotal).toFixed(2) + '</td></tr><tr class="mz-groundship-msg"><td colspan="2"><span>Free Ground Shipping for Orders $55+ in the contiguous US</span></td></tr><tr class="mz-total"><td>Total </td><td>$' + parseFloat(generalInfo.total).toFixed(2) + '</td></tr></tbody></table>';

                    $(".mz-pricing-info").append(handlingInfo);

                    //$(".mz-loader").html("");
                    $(".mz-confirmation-container").removeClass("is-loading");
                } // end of IF Loop

            }, function(er) {
                // fail condition
                //$(".mz-loader").html("");
                $(".mz-confirmation-container").removeClass("is-loading");
                console.log("Data error " + er);
            });
        } catch (e) {
            console.log(e);
        }
    });

});