Ext.widget({
    xtype: 'mz-form-widget',
    itemId: 'news',
     defaults: {
          xtype: 'textfield',
            listeners: {
                controller: '',
                meThis : this,
                change : function(cmp){
                    controller = cmp;
                },
                filechange: function(filelist){
                    
                    this.up('#news').handleUploadFile(filelist,this.up('#news'));
                }
                
            }
 },
    
    items: [
            {
                    xtype: 'textfield',
                    width: 700,
                    allowBlank: true,
                    fieldLabel: 'Headline Text',
                    name: 'Headline',
                    
            },
            {
                    xtype: 'htmleditor',
                    width: 700,
                    allowBlank: false,
                    fieldLabel: 'Display Text',
                    name: 'displayText'
            },
            {
                    xtype: "tacofilefield",
                    itemId: "imageUploadButton",
                    text: "Upload image",
                    width: 500
            },
            {
                    xtype: 'textfield',
                    width: 500,
                    itemId: "imagefileid",
                    name: 'imgpath',
                    allowBlank: true
            }
            
            ],
             handleUploadFile: function(a,cmp) {
                 
            cmp.onUploadFile(a, this.down("#imagefileid"),this, cmp);
    },

    onUploadFile: function(a, ImagNameField, meThis, cmp){
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




