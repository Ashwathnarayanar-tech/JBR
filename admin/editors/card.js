
Ext.widget({
    xtype: 'mz-form-widget',
    itemId: 'cardRule',
    anchor: "100%",
    defaults: {
        xtype: 'textfield',
        editable: false,
        listeners: {
            controller: '',
            change: function (cmp) {
                controller = cmp;
                cmp.up('#cardRule').updatePreview();
            },
            filechange: function(filelist){
                controller.up('#cardRule').handleUploadFile(filelist,controller.up('#cardRule'));
            }
        }
    },
    
    items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'Heading',
                    name: 'head',
                    width: 500,
                    allowBlank: false
                },
                {
                    xtype: 'colorfield',
                    fieldLabel: 'Heading Color',
                    name: 'headColor'
                },
                {
                    xtype: "tacofilefield",
                    itemId: "imageUploadButton",
                    text: "Upload new image",
                    width: 500
                },
                {
                    xtype: 'textfield',
                    itemId: "imagefileid",
                    name: 'img',
                    hidden: true
                },{
                    xtype: 'htmleditor',
                    fieldLabel: 'Contetnt',
                    name: 'content',
                    width: 500,
                    allowBlank: false
                },{
                    xtype: 'textfield',
                    fieldLabel: 'Image Link url',
                    name: 'link',
                    width: 500
                },
                {
                    xtype: 'container',
                    width: '100%',
                    padding: '20 0 20 0',
                    itemId: 'preview-container',
                    items: [
                        {
                            xtype: 'component',
                            itemId: 'preview',
                            autoEl: {
                                        html  : '<div>'+
                                                '<h3 class="heading" >Jelly Belly Cycling Team</h3>'+
                                                    '<figure style="float:left;">'+
                                                    '<a class="imiageLInk" href="/pro-cycling-team">'+
                                                    '<img class="imgSrcValue" src="//cdn-sb.mozu.com/7919-10212/cms/10212/files/athletes_thumb.jpg" width="133" border="0">'+
                                                    '</a>'+
                                                    '</figure>'+
                                                '<p class="description" style="line-height: 21px;margin: 12px 10px 0 20px;">'+
                                                    'This energetic and dedicated team of top athletes race in the elite and highly-competitive Pro-Am divisions, where the best cyclists from around the world battle for the gold in road and track courses all over the world. '+
                                                    '<a href="/pro-cycling-team">More Info ►</a>'+
                                                '</p>'+
                                                '</div>'
                                    }
                        }
                    ]
                }
    ],
    

    updatePreview: function(){
        var previewEl = this.down('#preview').getEl(),
            formValues = this.getForm().getValues(),
            newStyles = {};
        if (previewEl) {
            previewEl.dom.getElementsByClassName('heading')[0].innerHTML = formValues.head;
            previewEl.dom.getElementsByClassName('heading')[0].style.color = formValues.headColor; 
            previewEl.dom.getElementsByClassName('imiageLInk')[0].setAttribute('href',formValues.link);
            if(formValues.img == "1079.jpg"){
                previewEl.dom.getElementsByClassName('imgSrcValue')[0].setAttribute('src',formValues.img);
            }
            previewEl.dom.getElementsByClassName('description')[0].innerHTML = formValues.content;
            previewEl.applyStyles(newStyles);
        }
    },
    listeners: {
        afterrender: function (cmp) {
            var previewEl = this.down('#preview').getEl(), formValues = this.getForm().getValues();
            previewEl.dom.getElementsByClassName('imgSrcValue')[0].setAttribute('src',formValues.img);
            cmp.updatePreview();
        }
    },
    handleUploadFile: function(a,cmp) {
            cmp.onUploadFile(a, this.down("#imagefileid"),this.down('#preview').getEl(),this, cmp);
    },
 
    onUploadFile: function(a, ImagNameField,previewEl, meThis, cmp){
            var g = meThis,
                k = /image.*/,
                b = false,
                h = [],
                d = [];
        
        Ext.each(a, function(e) {
            d.push(e)
        });
        Ext.each(d, function(o) {
            var e, p, n;
            e = new FileReader();
            p = Ext.create("Taco.shared.model.File", {
                name: o.name,
                fileType: o.type,
                isUploaded: false,
                file: o
            });
            var x = Taco.core.util.UploadManager.events.complete.listeners[0]
            x.fireFn = function(h){ 
                console.log(h.document.data.thumbnail);
                ImagNameField.setValue(h.document.data.url);
                previewEl.dom.getElementsByClassName('imgSrcValue')[0].setAttribute('src',h.document.data.thumbnail);
            }
            //ON UPLOAD ERROR
            var z = Taco.core.util.UploadManager.events.uploaderror.listeners[0];
            z.fireFn = function(h){
                Ext.Msg.alert('ERROR!!!', 'Error in uploading file, please try again.');
            }
            e.onload = function(r) {
                var q;
                if (o.type.match(k)) {
                    p.set("fileType", "image");
                    p.set("localthumbnail", r.target.result);
                    q = new Image();
                    q.onload = function() {
                        p.set("width", q.width);
                        p.set("height", q.height);
                        n.execute();SS
                    };
                    q.src = r.target.result
                } else {
                    n.execute();
                }
                };
            e.readAsDataURL(o);
            n = Taco.core.util.UploadManager.requestUpload({
                document: p,
                file: o,
                url: "/admin/app/fileManagement/file/upload/{docid}"
            });
            h.push(p)
        });
    }


});



