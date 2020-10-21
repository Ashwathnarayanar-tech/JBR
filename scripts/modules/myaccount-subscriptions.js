require(["modules/jquery-mozu", "underscore", "modules/api", "hyprlive", "modules/backbone-mozu", 'hyprlivecontext', "vendor/jquery-ui.min", "vendor/bootstrap/js/bootstrap-3.3.2.min", "vendor/bootstrap/js/bootstrap-multiselect"],
    function($, _, Api, Hypr, Backbone, HyprLiveContext) {

         var myaccountSubSummary = Backbone.MozuView.extend({
            templateName: "modules/my-account/subscription-history-list",
            
            render: function() {   
                Backbone.MozuView.prototype.render.call(this);
                console.log(this.model);
            }
        });

        $(document).ready(function() {
            console.log("subscription my account");

            var flag = false;
            var customerId = require.mozuData("user").userId;
            var myaccountsubSummary = {};
            var existingEntityData = [];
            try {
                Api.request('GET', '/api/platform/entitylists/createsubscription@jbellyretailer/entities?filter=CustomerID eq ' + customerId).then(function(res) {
                    console.log(res.items);
                    
                    if (res.items.length > 0) {
                        existingEntityData = res.items[0].orderDetails;
                    }
                    
                    flag = true;
                });
            } catch (e) {
                flag = false;
                console.error(e);
            }

            var testset = setInterval(function(){
                if(flag){  
                    var AssortModel = Backbone.MozuModel.extend({});
                    myaccountsubSummary = new myaccountSubSummary({
                        el: $("[data-mz-subscriptionlist]"),
                        model: new AssortModel(existingEntityData)
                    });                   
                    alert("rendering");
                    clearInterval(testset);
                    console.log(myaccountsubSummary);    
                    myaccountsubSummary.render();                    
                }
            },500);

            // var SubsModel = Backbone.MozuModel.extend({});

            // var SubscriptionHistoryView = Backbone.MozuView.extend({
            //     templateName: "modules/my-account/my-subscriptions",

            //     render: function() {
            //         Backbone.MozuView.prototype.render.call(this);
            //         console.log(this.model);
            //     }
            // });
            
            // var customerId = require.mozuData("user").userId;
            // var subscriptionHistory = "",
            //     existingEntityData = "";
            // try {
            //     Api.request('GET', '/api/platform/entitylists/createsubscription@jbellyretailer/entities?filter=CustomerID eq ' + customerId).then(function(res) {
            //         console.log(res.items);
            //         var subscrModel = "";
            //         if (res.items.length > 0) {
            //             existingEntityData = res.items[0].orderDetails;
            //             subscrModel = new SubsModel(existingEntityData);
            //         } else {
            //             existingEntityData = [];
            //             subscrModel = new SubsModel(existingEntityData);
            //         }
            //         console.log(subscrModel);

            //         var subscriptionHistoryView = window.subscriptionHistoryView = new SubscriptionHistoryView({
            //             el: $('#x-account-subscriptionhistory'),
            //             model: subscrModel
            //         });

            //         //subscriptionHistory = accountModel.get('subscriptions');
            //         subscriptionHistoryView.render();
            //     });
            // } catch (e) {
            //     console.error(e);
            // }

            
            // $('#skip-subscription').multiselect({
            //     includeSelectAllOption: true
            // });

            // $('#confirm-skip').click(function() {
            //     alert($('#skip-subscription').val());
            // });

        });

    });