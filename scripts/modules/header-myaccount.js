require([
    "modules/jquery-mozu",
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    'modules/api'
], function($, _, Hypr, Backbone, Api) {
    $(document).ready(function() {

        /** Sign up form **/
        $('.mz-signup-password').focusin(function() {
            $('.pwd-message').show();
        });
        $('.mz-signup-password').focusout(function() {
            $('.pwd-message').hide();
        });


        var SignupForm = function($el) {
            var self = this;
            this.$el = $el;
            this.$messagebar = this.$el.find('[data-mz-role="mz-signup-register-message"]');
            this.$el.on('click', '#signup-submit', function(e) {
                e.preventDefault();
                self.signup();
                return false;
            });

            $.each(this.boundMethods, function(ix, method) {
                self[method] = $.proxy(self[method], self);
            });
        };


        $.extend(SignupForm.prototype, {
            boundMethods: ['displayMessage', 'displayApiMessage', 'signup'],
            signup: function() {
                var self = this,
                    data = {
                        signupemail: this.$el.find('.mz-signup-email')[0].value,
                        confirmpassword: this.$el.find('.mz-signup-password')[0].value,
                        signuppassword: this.$el.find('.mz-signup-confirmpassword')[0].value
                    },
                    payload = {
                        account: {
                            emailAddress: this.$el.find('.mz-signup-email')[0].value,
                            userName: this.$el.find('.mz-signup-email')[0].value,
                            firstName: this.$el.find('.mz-signup-firstname')[0].value,
                            lastName: this.$el.find('.mz-signup-lastname')[0].value,
                            contacts: [{
                                email: this.$el.find('.mz-signup-email')[0].value,
                                firstName: this.$el.find('.mz-signup-firstname')[0].value,
                                lastNameOrSurname: this.$el.find('.mz-signup-lastname')[0].value
                            }]
                        },
                        password: this.$el.find('.mz-signup-password')[0].value
                    };
                if (this.validate(data)) {
                    return Api.action('customer', 'createStorefront', payload).then(function() {
                        window.location = '/myaccount';
                    }, self.displayApiMessage);
                }

            },
            validate: function(data) {
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                var strongRegex = new RegExp(re);
                if (this.$el.find('[data-mz-signup-firstname]').val().length === 0) {
                    this.$el.find('[data-mz-signup-firstname]').css({
                        'border': '1px solid #e9000f'
                    });
                    return this.displayMessage('Provide first name.'), false;
                } else {
                    this.$el.find('[data-mz-signup-firstname]').css({
                        'border': '1px solid #c2c2c2'
                    });
                }
                if (this.$el.find('[data-mz-signup-lastname]').val().length === 0) {
                    this.$el.find('[data-mz-signup-lastname]').css({
                        'border': '1px solid #e9000f'
                    });
                    return this.displayMessage('Provide last name.'), false;
                } else {
                    this.$el.find('[data-mz-signup-lastname]').css({
                        'border': '1px solid #c2c2c2'
                    });
                }

                if (strongRegex.test(data.signupemail)) {
                    this.$el.find('[data-mz-signup-emailaddress]').css({
                        'border': '1px solid #c2c2c2'
                    });
                } else {
                    this.$el.find('[data-mz-signup-emailaddress]').css({
                        'border': '1px solid #e9000f'
                    });
                    return this.displayMessage('Invalid email address.'), false;
                }

                if (!data.signuppassword || !data.confirmpassword) return this.displayMessage('Provide both password.'), false;
                if (data.signuppassword !== data.confirmpassword) return this.displayMessage('Password dosn\'t match.'), false;
                // if(!strongRegex.test(data.signuppassword)){ return this.displayMessage(Hypr.getLabel('passwordStrong')), false; }


                return true;
            },
            displayMessage: function(msg) {
                this.$messagebar.html(this.messageTemplate.render({
                    model: [{
                        message: msg
                    }]
                }));
                this.$el.find('.mz-signup-password').val('');
                this.$el.find('.mz-signup-confirmpassword').val('');
            },
            displayApiMessage: function(xhr) {
                var err;
                if (xhr.errorCode == "MISSING_OR_INVALID_PARAMETER") {
                    var errorMessage = xhr.message;
                    var msgArray = errorMessage.split("Missing or invalid parameter:"); // filter out only the message
                    var trimMsg = msgArray[1].trim();
                    var errArray = trimMsg.replace(/^\S+/g, '');
                    // set the error message
                    err = errArray; // filter out the 
                } else if (xhr.errorCode == "VALIDATION_CONFLICT") {
                    this.$el.find('[data-mz-signup-email]').val('');
                    this.$el.find('[data-mz-signup-confirmemail]').val('');
                    err = 'Username already registered';
                }
                this.displayMessage(err);
            },
            hideMessage: function() {
                this.$messageBar.html('');
            },
            messageTemplate: Hypr.getTemplate('modules/common/message-bar')
        });

        /** Reset password functionality **/


        var user = require.mozuData('user');
        if (user.isAnonymous) {
            var signupForm = new SignupForm($('#jb-signup'));
        } else {
            if (window.location.pathname == "/signup") {
                window.location = 'https://t12046-s16686.sandbox.mozu.com/logout?returnurl=/signup';      
            }
        }
    });
});

