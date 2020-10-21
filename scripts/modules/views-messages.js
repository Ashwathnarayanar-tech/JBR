define(['modules/jquery-mozu','underscore','backbone','hyprlive'], function($, _, Backbone, Hypr) {
    // because mozuviews need mozumessageviews and mozumessageviews extend mozuviews, we're risking circular reference problems.
    // we fix this by making a factory method that extends the mozu message view only when asked.
    // this avoids the circular reference problem by not asking for backbone-mozuview until we know it's been provided.
    var MozuMessagesView,
        offset = parseInt(Hypr.getThemeSetting('gutterWidth'),10) || 10;
    return function(opts) {
        if (!MozuMessagesView) MozuMessagesView = Backbone.MozuView.extend({
            templateName: 'modules/common/message-bar',
            initialize: function() {
                this.model.on('reset', this.render, this);
            },
            render: function() {
                if(this.model.length > 0){
                    if(this.model.models[0].get('name') !== "ADD_CUSTOMER_FAILED"){
                        if(this.model.models){
                            if(this.model.models[0].get("errorCode") === "ITEM_NOT_FOUND" ){
                                this.model.models[0].set("message",Hypr.getLabel('myAccountGiftCertificateItemNotFound'));
                            }
                        }
                        console.log(this.model.toJSON());
                        Backbone.MozuView.prototype.render.apply(this, arguments);
                        var self = this;
                        self.$el.css('display','block');
                        if (this.model.length > 0) {
                            this.$el.ScrollTo({
                                onlyIfOutside: true,
                                offsetTop: offset,
                                offsetLeft: offset * 1.5,
                                axis: 'y'
                            });
                            if(window.location.pathname != "/checkout"){
                                setTimeout(function(){
                                    self.$el.css('display','none');
                                },8000);
                            }
                        }
                    }
                }
            }
        });
        return new MozuMessagesView(opts);
    };

});



