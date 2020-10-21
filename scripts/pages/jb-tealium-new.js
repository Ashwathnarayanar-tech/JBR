var utag_data = {};
require(["modules/jquery-mozu"],
	function ($) {
	"use strict";
	
	var apiContext = JSON.parse(document.getElementById('data-mz-preload-apicontext').innerHTML);
	var pageContext = JSON.parse(document.getElementById('data-mz-preload-pagecontext').innerHTML);
	var userContext = JSON.parse(document.getElementById('data-mz-preload-user').innerHTML);
	var cartModel; // = require.mozuData('cart');
	var prodModel; // = require.mozuData('product');
	var checkoutModel; // = require.mozuData('checkout');
	var confirmationModel; // = require.mozuData('order');
	var categoryModel; // = require.mozuData('Category');
	var userModel; // = require.mozuData('user');
	var categoryproduct;

	
	if (pageContext.pageType == 'checkout') { // Checkout Page
		checkoutModel = require.mozuData('checkout');

		utag_data.site_name = "JellyBelly.com";
		utag_data.site_country = "US";
		utag_data.site_currency = "USD";

		utag_data.page_name = pageName(pageContext);
		utag_data.page_type = pageType(pageContext);
		utag_data.page_type_googleDynamicRemarketing = pageTypeGoogleDynamicRemarketing(pageContext);
		utag_data.page_referring_url = document.referrer;

		utag_data.product_id = checkoutDetail('id');
		utag_data.product_sku = checkoutDetail('id');
		utag_data.product_image = checkoutDetail('image');
		utag_data.product_quantity = checkoutDetail('qty');
		utag_data.product_list_price = checkoutDetail('Discprice');
		utag_data.product_name = checkoutDetail('name');
		utag_data.product_unit_price = checkoutDetail('price');

		//loadScript();
	} else if (pageContext.pageType == 'confirmation') { // Order Confirmation Page

		//var confimg1;
		//confimg1 = document.createElement('img');
		//confimg1.src = "//content.jellybelly.com/pixel/pixel.aspx?order_id=TBD&step=BUILDING_CONF_UTAG";

		confirmationModel = require.mozuData('order');
		userModel = require.mozuData('user');

		var logged_in = 'N';
		if (!userModel.isAnonymous) {
			logged_in = 'Y';
		}

		var order_has_digital = 'N';
		var i = 0;
		for (i = 0; i < confirmationModel.items.length; i += 1) {
			if (confirmationModel.items[i].product.goodsType === 'DigitalCredit') {
				order_has_digital = 'Y';
			}
		}

		// ESTIMATED SHIP AND DELIVERY DATE
		// var order_date = new Date(order_date_str + "T00:00:00");
		var orderDate = new Date();
		var daysToShip = 3;
		var daysToDeliver = 7;

		var shipDate = new Date();
		shipDate.setDate(orderDate.getDate() + daysToShip);

		// adjust shipDate and deliveryDate to advance beyond Saturdays and Sundays
		while (shipDate.getDay() === 6 || shipDate.getDay() === 0) {
			shipDate.setDate(shipDate.getDate() + 1);
		}

		var deliveryDate = new Date();
		deliveryDate.setDate(shipDate.getDate() + daysToDeliver);
		while (deliveryDate.getDay() === 6 || deliveryDate.getDay() === 0) {
			deliveryDate.setDate(deliveryDate.getDate() + 1);
		}

		var shipMonth = ('0' + (shipDate.getMonth() + 1)).slice(-2);
		var shipDay = ('0' + shipDate.getDate()).slice(-2);
		var estimatedShipDate = shipDate.getFullYear() + "-" + shipMonth + "-" + shipDay;

		var deliveryMonth = ('0' + (deliveryDate.getMonth() + 1)).slice(-2);
		var deliveryDay = ('0' + deliveryDate.getDate()).slice(-2);
		var estimatedDeliveryDate = deliveryDate.getFullYear() + "-" + deliveryMonth + "-" + deliveryDay;

		utag_data.site_name = "JellyBelly.com";
		utag_data.site_country = "US";
		utag_data.site_currency = "USD";
		utag_data.site_search_results = "";
		utag_data.site_search_keyword = "";

		utag_data.page_name = pageName(pageContext);
		utag_data.page_type = pageType(pageContext);
		utag_data.page_type_googleDynamicRemarketing = pageTypeGoogleDynamicRemarketing(pageContext);
		utag_data.page_section_name = "";
		utag_data.page_category_name = "";
		utag_data.page_subcategory_name = "";
		utag_data.page_referring_url = document.referrer;

		utag_data.product_id = confirmationDetail('id');
		utag_data.product_sku = confirmationDetail('id');
		utag_data.product_image = confirmationDetail('image');
		utag_data.product_quantity = confirmationDetail('qty');
		utag_data.product_list_price = confirmationDetail('Discprice');
		utag_data.product_name = confirmationDetail('name');
		utag_data.product_unit_price = confirmationDetail('price');

		utag_data.order_id = confirmationDetail('order_id').toString();
		utag_data.order_subtotal = confirmationDetail('subtotal').toString();
		utag_data.order_subtotalDisc = confirmationDetail('subtotalDiscount').toString();
		utag_data.order_shipping_amount = confirmationDetail('shippingTotal').toString();
		utag_data.order_payment_type = confirmationDetail('paymentType');
		utag_data.order_promotions = confirmationDetail('couponCode');
		utag_data.order_discount_amount = confirmationDetail('orderDiscount').toString();
		utag_data.order_total = confirmationDetail('total').toString();
		utag_data.order_currency = confirmationDetail('currency').toString();
		utag_data.order_shipping_method = confirmationDetail('shippingMethod').toString(); //need shipping method
		utag_data.order_shipping_company = confirmationDetail('company').toString();
		utag_data.order_shipping_first_name = confirmationDetail('fname').toString();
		utag_data.order_shipping_last_name = confirmationDetail('lname').toString();
		utag_data.order_shipping_street_1 = confirmationDetail('street1').toString();
		utag_data.order_shipping_street_2 = confirmationDetail('street2').toString();
		utag_data.order_shipping_city = confirmationDetail('city').toString();
		utag_data.order_shipping_state = confirmationDetail('state').toString();
		utag_data.order_shipping_zip = confirmationDetail('zip').toString();
		utag_data.order_shipping_msg = confirmationDetail('msg').toString();
		utag_data.order_billing_company = confirmationDetail('company').toString();
		utag_data.order_billing_first_name = confirmationDetail('billing_fname').toString();
		utag_data.order_billing_last_name = confirmationDetail('billing_lname').toString();
		utag_data.order_billing_street_1 = confirmationDetail('billing_street1').toString();
		utag_data.order_billing_street_2 = confirmationDetail('billing_street2').toString();
		utag_data.order_billing_city = confirmationDetail('billing_city').toString();
		utag_data.order_billing_state = confirmationDetail('billing_state').toString();
		utag_data.order_billing_zip = confirmationDetail('billing_zip').toString();
		utag_data.order_tax_amount = confirmationDetail('taxtotal').toString();
		utag_data.order_has_preorder = 'N';
		utag_data.order_has_digital = order_has_digital;
		utag_data.order_shipping_date_est = estimatedShipDate;
		utag_data.order_delivery_date_est = estimatedDeliveryDate;

		utag_data.customer_id = confirmationDetail('customer_id').toString();
		utag_data.customer_email = confirmationDetail('customer_email').toString();
		utag_data.customer_optin = confirmationDetail('customer_emailOpt').toString();
		utag_data.customer_phone = confirmationDetail('customer_phone').toString();
		utag_data.customer_country = "US";
		utag_data.customer_loggedin = logged_in;
		utag_data.google_conversion_language = "en";
		utag_data.google_conversion_format = "2";
		utag_data.google_conversion_color = "ffffff";
		utag_data.google_remarketing_only = false;
		// go ahead and concatenate info to form the "opt" parameter expected by Pepperjam
		// I suppose this could be concatenated at the Tealium level but it's okay to do it here too
		//var af_opt_amounts = "AMNT:" + utag_data.product_list_price.join('|');
		var af_opt_amounts = "AMNT:" + confirmationDetail('discountedLineItems_singleSkuPrice').join('|');
		var af_opt_skus = "IMID:" + utag_data.product_sku.join('|');
		var af_opt_qtys = "QNTY:" + utag_data.product_quantity.join('|');
		var af_isNewCustomer = "NWRT:" + ($.cookie("isNewCustomer") == "true" ? 1 : 0);
		utag_data.pepperjam_opt = [af_opt_amounts, af_opt_skus, af_opt_qtys, af_isNewCustomer].join(';');

	} else {

		utag_data.site_name = "JellyBelly.com";
		utag_data.site_country = "US";
		utag_data.site_currency = "USD";
		utag_data.site_search_results = "";
		utag_data.site_search_keyword = "";

		utag_data.page_name = pageContext.url;
		utag_data.page_type = "unknown";
		utag_data.page_type_googleDynamicRemarketing = "unknown";
		utag_data.page_section_name = "";
		utag_data.page_category_name = "";
		utag_data.page_subcategory_name = "";
		utag_data.page_referring_url = document.referrer;

		//loadScript();
	}

	function pageName(pcontext) { // Check Page name
		if (pcontext.pageType === 'cart')
			return 'cart';
		else if (pcontext.pageType === 'category')
			return 'product category';
		else if (pcontext.pageType === 'product')
			return 'product';
		else if (pcontext.pageType === 'search')
			return 'search';
		else if (pcontext.pageType === 'checkout') // && this.urlCheck1 != 'confirmation')
			return "checkout";
		else if (pcontext.pageType == 'confirmation')
			return 'confirmation';
		else if (pcontext.title.toLowerCase() == 'home2' || pcontext.title.toLowerCase() == 'home')
			return 'home';
		else if (pcontext.title.toLowerCase() == "shop our prodiucts")
			return 'shopmain';
		else if (pcontext.title.toLowerCase() == "our products - jelly belly candy company" || pcontext.title.toLowerCase() == "visit us" || pcontext.title.toLowerCase() == "entertainment" || pcontext.title.toLowerCase() == "sports sponsorships")
			return 'home';
		else if (pcontext.title.toLowerCase() == "jelly belly store locator")
			return 'Locator';
		else if (pcontext.title.toLowerCase() == "gift-cards")
			return 'gift_cards';
		else if (pcontext.url.indexOf('com/candy') != -1)
			return 'candy';
		else
			return pcontext.cmsContext.page.path;
	}
	function pageType(pcontext) { // Check Page Type
		if (pcontext.pageType === 'cart')
			return 'cart';
		else if (pcontext.pageType === 'category')
			return 'category';
		else if (pcontext.pageType === 'product')
			return 'product';
		else if (pcontext.pageType === 'search')
			return 'search';
		else if (pcontext.pageType === 'checkout')
			return 'Checkout';
		else if (pcontext.pageType == 'confirmation')
			return 'receipt';
		else if (pcontext.title.toLowerCase() == 'home2' || pcontext.title.toLowerCase() == 'home')
			return 'home';
		else if (pcontext.title.toLowerCase() == "shop our prodiucts")
			return 'Shop';
		else if (pcontext.title.toLowerCase() == "our products - jelly belly candy company" || pcontext.title.toLowerCase() == "visit us" || pcontext.title.toLowerCase() == "entertainment" || pcontext.title.toLowerCase() == "sports sponsorships" || pcontext.title.toLowerCase() == "gift-cards" || pcontext.title.toLowerCase() == "jelly belly store locator")
			return 'gateway';
		else if (pcontext.url.indexOf('com/candy') != -1)
			return 'candy';
		else
			return pcontext.cmsContext.page.path;
	}

	function pageTypeGoogleDynamicRemarketing(pcontext) { // Check Page Type
		if (pcontext.pageType === 'cart')
			return 'cart';
		else if (pcontext.pageType === 'category')
			return 'category';
		else if (pcontext.pageType === 'product')
			return 'product';
		else if (pcontext.pageType === 'search')
			return 'searchresults';
		else if (pcontext.pageType === 'checkout')
			return 'purchase';
		else if (pcontext.pageType == 'confirmation')
			return 'other';
		else if (pcontext.pageType == 'cart')
			return 'cart';
		else if (pcontext.title.toLowerCase() == 'home2' || pcontext.title.toLowerCase() == 'home')
			return 'home';
		else if (pcontext.title.toLowerCase() == "shop our prodiucts")
			return 'other';
		else if (pcontext.title.toLowerCase() == "our products - jelly belly candy company" || pcontext.title.toLowerCase() == "visit us" || pcontext.title.toLowerCase() == "entertainment" || pcontext.title.toLowerCase() == "sports sponsorships" || pcontext.title.toLowerCase() == "gift-cards" || pcontext.title.toLowerCase() == "jelly belly store locator")
			return 'other';
		else if (pcontext.url.indexOf('com/candy') != -1)
			return 'other';
		else
			//return this.page.toString();
			return 'other';
	}


	function checkoutDetail(type) {
		var details = [];

		if (type == 'id') {
			for (var i = 0; i < checkoutModel.items.length; i++) {
				details.push(checkoutModel.items[i].product.productCode);
			}
		}
		if (type == 'image') {
			for (var j = 0; j < checkoutModel.items.length; j++) {
				details.push(checkoutModel.items[j].product.imageUrl);
			}
		}
		if (type == 'qty') {
			for (var x = 0; x < checkoutModel.items.length; x++) {
				details.push(checkoutModel.items[x].quantity);
			}
		}
		if (type == 'name') {
			for (var z = 0; z < checkoutModel.items.length; z++) {
				details.push(checkoutModel.items[z].product.name);
			}
		}
		if (type == "Discprice") {
			var discPrice;
			for (var z1 = 0; z1 < checkoutModel.items.length; z1++) {
				discPrice = checkoutModel.items[z1].discountedTotal / checkoutModel.items[z1].quantity;
				details.push("" + discPrice.toFixed(2));
			}
		}
		if (type == 'price') {
			for (var y = 0; y < checkoutModel.items.length; y++) {
				details.push(checkoutModel.items[y].product.price.salePrice);
			}
		}

		return details;
	}

	function confirmationDetail(type) { // Get Details from Order Confirmation Model
		var details = [],
		detailsStr;
		if (type == 'id') {
			for (var i = 0; i < confirmationModel.items.length; i++) {
				details.push(confirmationModel.items[i].product.productCode);
			}
		}
		if (type == 'image') {
			for (var j = 0; j < confirmationModel.items.length; j++) {
				details.push(confirmationModel.items[j].product.imageUrl);
			}
		}
		if (type == 'qty') {
			for (var x = 0; x < confirmationModel.items.length; x++) {
				details.push(confirmationModel.items[x].quantity);
			}
		}
		if (type == "Discprice") {
			var discPrice;
			for (var z1 = 0; z1 < confirmationModel.items.length; z1++) {
				discPrice = confirmationModel.items[z1].discountedTotal / confirmationModel.items[z1].quantity;
				details.push("" + discPrice.toFixed(2));
			}
		}
		if (type == 'price') {
			for (var y = 0; y < confirmationModel.items.length; y++) {
				details.push(confirmationModel.items[y].product.price.salePrice);
			}
		}
		if (type == 'name') {
			for (var z = 0; z < confirmationModel.items.length; z++) {
				details.push(confirmationModel.items[z].product.name);
			}
		}
		if (type == 'order_id') {
			details.push(confirmationModel.orderNumber);
		}
		if (type == 'subtotal') {
			details.push((confirmationModel.total - confirmationModel.shippingTotal).toFixed(2));
		}
		if (type == 'total') {
			details.push(confirmationModel.total);
		}
		if (type == 'taxtotal') {
			details.push((confirmationModel.taxTotal).toFixed(2));
		}
		if (type == 'shippingTotal') {
			details.push(confirmationModel.shippingTotal.toFixed(2));
		}
		if (type == 'paymentType') {
			for (var q = 0; q < confirmationModel.payments.length; q++) {
				details.push(confirmationModel.payments[q].paymentType);
			}
		}
		if (type == 'subtotalDiscount') {
			details.push((confirmationModel.discountTotal === undefined || confirmationModel.discountTotal === null) ? "" : confirmationModel.discountTotal.toFixed(2));
		}
		if (type == 'orderDiscount') {
			for (var zp = 0; zp < confirmationModel.orderDiscounts.length; zp++) {
				details.push(confirmationModel.orderDiscounts[zp].impact);
			}
		}
		if (type == 'couponCode') {
			for (var p = 0; p < confirmationModel.orderDiscounts.length; p++) {
				details.push(confirmationModel.orderDiscounts[p].couponCode);
			}
		}
		if (type == 'currency') {
			details.push(confirmationModel.currencyCode);
		}
		if (type == 'shippingMethod') {
			details.push(confirmationModel.fulfillmentInfo.shippingMethodName);
		}
		if (type == 'fname') {
			details.push(confirmationModel.fulfillmentInfo.fulfillmentContact.firstName);
		}
		if (type == 'lname') {
			details.push(confirmationModel.fulfillmentInfo.fulfillmentContact.lastNameOrSurname);
		}
		if (type == 'street1') {
			details.push(confirmationModel.fulfillmentInfo.fulfillmentContact.address.address1);
		}
		if (type == 'street2') {
			details.push((confirmationModel.fulfillmentInfo.fulfillmentContact.address.address2 === null) ? "" : confirmationModel.fulfillmentInfo.fulfillmentContact.address.address2);
		}
		if (type == 'city') {
			details.push(confirmationModel.fulfillmentInfo.fulfillmentContact.address.cityOrTown);
		}
		if (type == 'state') {
			details.push(confirmationModel.fulfillmentInfo.fulfillmentContact.address.stateOrProvince);
		}
		if (type == 'zip') {
			details.push(confirmationModel.fulfillmentInfo.fulfillmentContact.address.postalOrZipCode);
		}
		if (type == 'billing_fname') {
			details.push(confirmationModel.billingInfo.billingContact.firstName);
		}
		if (type == 'billing_lname') {
			details.push(confirmationModel.billingInfo.billingContact.lastNameOrSurname);
		}
		if (type == 'billing_street1') {
			details.push(confirmationModel.billingInfo.billingContact.address.address1);
		}
		if (type == 'billing_street2') {
			details.push((confirmationModel.billingInfo.billingContact.address.address2 === null) ? "" : confirmationModel.billingInfo.billingContact.address.address2);
		}
		if (type == 'billing_city') {
			details.push(confirmationModel.billingInfo.billingContact.address.cityOrTown);
		}
		if (type == 'billing_state') {
			details.push(confirmationModel.billingInfo.billingContact.address.stateOrProvince);
		}
		if (type == 'billing_zip') {
			details.push(confirmationModel.billingInfo.billingContact.address.postalOrZipCode);
		}
		if (type == 'customer_id') {
			details.push(confirmationModel.customerAccountId);
		}
		if (type == 'customer_email') {
			//details.push((!confirmationModel.acceptsMarketing) ? "" : confirmationModel.email);
			details.push(confirmationModel.email);
		}
		if (type == 'customer_emailOpt') {
			details.push((!confirmationModel.acceptsMarketing) ? "N" : "Y");
		}
		if (type == 'customer_phone') {
			details.push((typeof confirmationModel.billingInfo.billingContact.phoneNumbers == "undefined" ? "" : confirmationModel.billingInfo.billingContact.phoneNumbers.home));
		}
		if (type == 'msg') {
			details.push((confirmationModel.shopperNotes.comments === null || confirmationModel.shopperNotes.comments === undefined) ? "" : confirmationModel.shopperNotes.comments);
		}
		if (type == 'company') {
			details.push((confirmationModel.fulfillmentInfo.fulfillmentContact.companyOrOrganization === null || confirmationModel.fulfillmentInfo.fulfillmentContact.companyOrOrganization === undefined) ? "" : confirmationModel.fulfillmentInfo.fulfillmentContact.companyOrOrganization);
		}
		if (type == 'discountedLineItems') {
			for (var dli = 0; dli < confirmationModel.items.length; dli++) {
					details.push(confirmationModel.items[dli].adjustedLineItemSubtotal.toFixed(2));
			}
		}
		if (type == 'discountedLineItems_singleSkuPrice') {
			for (var dlis = 0; dlis < confirmationModel.items.length; dlis++) {
					var tempPrice = confirmationModel.items[dlis].adjustedLineItemSubtotal / utag_data.product_quantity[dlis];
					details.push(tempPrice.toFixed(2));
			}
		}
		return details;
	}

	function loadScript() { // Build Tealium Tag
		utag_data.yotta_custom_dimension1 = "yottaa_control";
		var env = '';
		if (apiContext.headers["x-vol-tenant"] == '9046')
			env = 'prod';
		else if (apiContext.headers["x-vol-tenant"] == '12046')
			env = 'dev';
		
		
		// (function(a,b,c,d){
		// 	a='//tags.tiqcdn.com/utag/jellybelly/specialty/'+env +'/utag.js';
		// 	b=document;
		// 	c='script';
		// 	d=b.createElement(c);
		// 	d.src=a;
		// 	d.type='text/java'+c;
		// 	d.async=true;
		// 	a=b.getElementsByTagName(c)[0];a.parentNode.insertBefore(d,a);
		// })();
	}

	loadScript();
});

