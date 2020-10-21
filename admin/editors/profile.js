
var isLoaded = false;

    Ext.widget({
        xtype   : 'mz-form-widget',
        itemId: 'hrRuleForm',
        anchor: "100%",
        
        defaults: {
            xtype: 'textfield',
            listeners: {
                controller: '',
                change: function (cmp) {
                    controller = cmp;
                    cmp.up('#hrRuleForm').updatePreview();
                },
                filechange: function(filelist){
                    controller.up('#hrRuleForm').handleUploadFile(filelist,controller.up('#hrRuleForm'));
                }
            }
        },
        
        
        items: [
            {
                xtype: "textfield",
                itemId: "imagefileid",
                name: "imageFileId",
                anchor: "100%",
                hidden: false
                
            },
            {
                xtype: "tacofilefield",
                itemId: "imageUploadButton",
                text: "Upload profile picture"
            },
            {   
                xtype:'image',
                src: '',
                name: 'imgpreviewname',
                itemId: 'imgpreview',
                region: 'south',
                width: 133,
                height: 133
            },
            {
                xtype: "textfield",
                fieldLabel: "Full name",
                width: 500,
                anchor: "100%",
                name: "name"
            },
            {
                xtype: 'htmleditor',
                fieldLabel: 'Contetnt',
                name: 'content',
                anchor: "100%",
                width: 500,
                enableFont : true,
                fontFamilies : [
                    'Arial',
                    'Courier New',
                    'Tahoma',
                    'Times New Roman',
                    'Verdana'
                ]
            },
            {
                xtype: "textfield",
                fieldLabel: "Quotes/Wording",
                width: 500,
                anchor: "100%",
                name: "quote"
            },
            {
                xtype: "checkboxfield",
                name: "showBorder",
                fieldLabel: "Show border"
            }
        ],
        
        handleUploadFile: function(a,cmp) {
            cmp.onUploadFile(a, this.down("#imagefileid"),this.down('#imgpreview').getEl(),this, cmp);
        },
        
        listeners: {
            afterrender: function (cmp) {
                var formValues = this.getForm().getValues();
                if(!isLoaded && this.down("#imagefileid").getValue() !== ""){
                    var imgpreview = this.down('#imgpreview').getEl();
                    imgpreview.dom.src = this.down("#imagefileid").getValue();
                    isLoaded = true;
                }
            }
        },
        updatePreview: function () {
        },
        
        onUploadFile: function(a, ImagNameField,imgpreview, meThis, cmp){
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
                    ImagNameField.setValue(h.document.data.url);
                    imgpreview.dom.src = h.document.data.thumbnail;
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
                            n.execute();
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


