Ext.widget({
    xtype: 'mz-form-widget',
    itemId: 'brandbanner',
     defaults: {
          xtype: 'textfield',
            listeners: {
                controller: '',
                meThis : this,
                change : function(cmp){
                    controller = cmp;
                },
                filechange: function(filelist,cmp){
                    
                    this.up('#brandbanner').handleUploadFile(filelist,this.up('#brandbanner'),this.itemId);
                }
                
            }
 },
    
    items: [
            {
                    xtype: "tacofilefield",
                    itemId: "backgroundimageUploadButton",
                    text: "Upload Background Image",
                    width: 500
            },
            {
                    xtype: 'textfield',
                    width: 500,
                    itemId: "imagefileid",
                    name: 'backgroundImagePath',
                    allowBlank: false
            },
            { 
                    xtype: "tacofilefield",
                    itemId: "logoimageUploadButton",
                    text: "Upload Brand Logo",
                    width: 500
            },
            {
                    xtype: 'textfield',
                    width: 500,
                    itemId: "imagefileid1", 
                    name: 'logoPath',
                    allowBlank: false
            },
            {
                    xtype: 'textfield',
                    width: 500,
                    itemId: "imagecaption", 
                    fieldLabel: 'Image Caption',
                    name: 'imageCaption',
                    allowBlank: false
            },
            {
                    xtype: 'textareafield',
                    width: 500,
                    itemId: "branddetails", 
                    name: 'brandDetails',
                    fieldLabel: 'Brand Details',
                    allowBlank: false
            },
            {
                    xtype: 'textfield',
                    width: 500,
                    itemId: "Link", 
                    name: 'URL',
                    fieldLabel: 'URL',
                    allowBlank: false
            }
            
            ],
             handleUploadFile: function(a,cmp,itemdetails) {
                 
             cmp.onUploadFile(a, this.down("#imagefileid"),this.down('#imagefileid1') ,this, cmp,itemdetails);
             //cmp.onUploadFile(a, this.down("#imagefileid1"),this, cmp);
    },

    onUploadFile: function(a, ImagNameField, imagenamefield1,meThis, cmp,itmdetails){
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
                   
                    if(itmdetails == "backgroundimageUploadButton"){
                    ImagNameField.setValue(h.document.data.url);
                    }else{
                    if(itmdetails == "logoimageUploadButton"){
                    imagenamefield1.setValue(h.document.data.url);
                    }
                    }
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
                            // ImagNameField.setValue(p.data.name);
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



