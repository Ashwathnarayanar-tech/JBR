
var isLoaded = false;

    Ext.widget({
        xtype   : 'mz-form-widget',
        itemId: 'flavourguide',
        anchor: "100%",
        
        defaults: {
            xtype: 'textfield',
            listeners: {
                controller: '',
                change: function (cmp) {
                    controller = cmp;
                    cmp.up('#flavourguide').updatePreview();
                },
                filechange: function(filelist){
                    controller.up('#flavourguide').handleUploadFile(filelist,controller.up('#flavourguide'));
                }
            }
        },
        
        
        items: [
            {
              xtype         : "textfield",
              itemId        : "headerText",
              fieldLabel    : "Header Text",
              name          : "header",
              width         : '97%'
            },
            {
                xtype       : 'textarea',
                itemId      : 'descriptionText',
                fieldLabel  : "Description Text",
                name        : 'description',
                width         : '97%'
            },
            {
                xtype   : "tacofilefield",
                itemId  : "imageUploadButton",
                text    : "Upload images"
            },
            {
                xtype   : 'progressbar',
                text    : 'Upload status',
                id      : 'progressbar',
                itemId  : 'progressbar',
                width   :  '97%'
            },
            {
                xtype       : 'container',
                width       : '100%',
                height      : 300,
                autoScroll  : true,
                padding     : '20 0 20 0',
                itemId      : 'preview-container',
                style: {
                    background: "#EEE",
                    color: "#FFF",
                    "text-decoration": "none"
                },
                items: [
                    {
                        xtype: 'component',
                        itemId: 'preview',
                        autoEl: {
                                    html  : ''
                                }
                    }
                ]
            },
            {
              xtype         : "textfield",
              itemId        : "shopText",
              fieldLabel    : "Shop Text",
              name          : "shoplabel",
              width         : '97%'
            },
            {
              xtype         : "textfield",
              itemId        : "shopLink",
              fieldLabel    : "Shop Link",
              name          : "shoplink",
              width         : '97%'
            },
            {
              xtype         : "textfield",
              itemId        : "findstorelink",
              fieldLabel    : "Find a Store Link",
              name          : "findstorelink",
              width         : '97%'
            },
            {
                xtype       : "taco-arrayField",
                name        : "data",
                itemId      : "arraydata",
                id          : "arraydata",
                width       : '97%',
                hidden      : true
            },
            {
                xtype       : 'container',
                width       : '100%',
                style: {
                    "text-decoration": "none"
                },
                items: [
                    {
                        xtype: 'component',
                        autoEl: {
                                    html  : '<h2>Guidelines for using widget</h2>'+
                                            '<p style="color: #1AC21C;"><b style="color: #3D96D7;">How to add flavour beans?</b></br> Upload flavour beans images to add new flavour bean items.</p>'+
                                            '<p style="color: #1AC21C;"><b style="color: #3D96D7;">How to change name/link of flavour beans?</b></br> Click on edit link button, it will show currently assigned link. Replace it with new value. TO change name of bean click on name and follow the same step followed to edit the link.</p>'+
                                            '<p style="color: #1AC21C;"><b style="color: #3D96D7;">How to add/remove flavour beans?</b></br> Upload flavour beans images to add new flavour bean items. By clicking the remove link can remove the item from list.</p>'
                                }
                    }
                ]
            }
        ],
        
        handleUploadFile: function(a,cmp) {
            cmp.onUploadFile(a, this, cmp);
        },
        
        listeners: {
            afterrender: function (cmp) {
                this.updatePreview();
            }
        },
        updatePreview: function () {
            console.log("Preview Updating");
            var formValues = this.getForm().getValues();
            this.createFlavourPreview(formValues.data);
        },
        createFlavourPreview: function(array){
            var meThis = this;
            var data;
            var preview = this.down('#preview');
            console.log(preview);
            var el =  preview.getEl();
            console.log(el);
            if(el && el.dom){
                el.dom.innerHTML = "";
                console.log(el.dom);
            }
            for(index =0 ;index < array.length; index++ ){
                data = array[index];
                console.log(data.id);
                
                var parent = document.createElement('DIV');
                parent.style.float = 'left';
                parent.style.margin = '5px';
                parent.style.textAlign = 'center';
                parent.style.border = "1px solid #CFC3C3";
                parent.style.padding = "5px";
                parent.style.borderRadius = "4px";
                
                var order = document.createElement('BUTTON');
                order.innerHTML  = "Order"+data.order;
                order.setAttribute("editingItem",data.id);
                order.style.background= "rgb(39, 207, 183)";
                order.style.border= "1px solid #EEE";
                order.style.color= "#FFF";
                order.style.width= "100%";
                order.style.display= "block";
                order.style.padding= "5px 8px";
                order.onclick = function(e){
                    meThis.editValue(e.target.getAttribute("editingItem"),"order",data.order);
                };
                
                
                var img = document.createElement('IMG');
                img.src = data.imageUrl;
                
                var para = document.createElement('P');
                para.style.color = "#074e7c";
                para.style.cursor = "pointer";  
                para.innerHTML  = data.name;
                para.setAttribute("editingItem",data.id);
                para.onclick = function(e){
                   meThis.editValue(e.target.getAttribute("editingItem"),"name",data.name);  
                };
                
                var link = document.createElement('BUTTON');
                link.innerHTML  = "Edit Link";
                link.setAttribute("editingItem",data.id);
                link.style.background= "#CA1010";
                link.style.border= "1px solid #EEE";
                link.style.color= "#FFF";
                link.style.padding= "5px 8px";
                link.onclick = function(e){
                    meThis.editValue(e.target.getAttribute("editingItem"),"link",data.link);
                };
                
                var remove = document.createElement('BUTTON');
                remove.innerHTML  = "Remove";
                remove.setAttribute("editingItem",data.id);
                remove.style.background= "#CA1010";
                remove.style.border= "1px solid #EEE";
                remove.style.color= "#FFF";
                remove.style.padding= "5px 8px";
                remove.onclick = function(e){
                    meThis.editValue(e.target.getAttribute("editingItem"));
                };
                parent.appendChild(order);
                parent.appendChild(img);
                parent.appendChild(para);
                parent.appendChild(link);
                parent.appendChild(remove);
                
                if(el && el.dom)
                    el.dom.appendChild(parent);
            }
        },
        
        editValue: function(id,name,currentValue){
            var meThis = this;
            var currentValue = meThis.getCurrentItem(id);
            if(name){
                    //Show prompt
                if(name === "order"){
                    Ext.Msg.prompt('Order', 'Please enter a order number:', function(btn, text){
                        if (btn == 'ok'){
                            meThis.updateArrayDataWithNewValue(id,"order",currentValue.order,text);
                        }
                    },this, false,currentValue?currentValue.order:'');
                    // var newName = prompt("Please enter label for this flavour", "Lorem Ipsum");
                    
                }    
                    
                if(name === "name"){
                    Ext.Msg.prompt('Flavout Lable', 'Please enter a label value:', function(btn, text){
                        if (btn == 'ok'){
                            meThis.updateArrayDataWithNewValue(id,"name",text);
                        }
                    },this, false,currentValue?currentValue.name:'');
                    // var newName = prompt("Please enter label for this flavour", "Lorem Ipsum");
                    
                }
                if(name === "link"){
                    Ext.Msg.prompt('Flavour Link', 'Please enter link to flavour:', function(btn, text){
                        if (btn == 'ok'){
                            meThis.updateArrayDataWithNewValue(id,"link",text);
                        }
                    },this, false,currentValue?currentValue.link:'');
                    // var newLink = prompt("Please enter url link for this flavour", "//sample");
                    
                }
            }else{
                //remove Item
                meThis.removeItem(id);
            }
        },
        
        onUploadFile: function(a, meThis, cmp){
            var g = meThis,
                k = /image.*/,
                b = false,
                h = [],
                d = [],
                kkk = 0;
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
                //UPLOAD PROGRESS FUNCTION
                var x = Taco.core.util.UploadManager.events.progress.listeners[1];
                x.fireFn = function(h){ 
                    kkk++;
                    if(kkk != d.length && h.percentUploaded < 1){
                        Ext.getCmp('progressbar').updateProgress( (kkk/d.length) + (h.percentUploaded*100), kkk+'.'+h.percentUploaded*100+' out of '+d.length, true );
                    }else{
                        Ext.getCmp('progressbar').updateProgress( 1, 'Upload Compleated', true );
                    }
                }
                //ON UPLOAD COMPLETE
                var y = Taco.core.util.UploadManager.events.complete.listeners[0];
                y.fireFn = function(h){
                    cmp.addFlavour(h.document.data.url);
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
        },
        
        /**
         * This function will create a object with properties and push it into array field
         * id           - unique Id based on time
         * imgUrl       -
         * linkName     - 
         * linkValue    -
         **/
        addFlavour : function(imgURL){
            var flavourObject  = new Object();
            flavourObject.id = "UUID0";
            flavourObject.imageUrl = imgURL;
            flavourObject.name = "Lorem Ipsum";
            flavourObject.link = "//sample";
            flavourObject.order = 0;
            this.updateArrayData(flavourObject);
        },
        updateArrayData: function(flavourObject){
            var arrayData = Ext.getCmp('arraydata');
            console.log(arrayData.getValue());
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                flavourObject.id = "UUID0"+arr.length;
                flavourObject.order = arr.length;;
                arr.push(flavourObject);
                arrayData.setValue(arr);
            }else{
                arrayData.setValue(flavourObject);
            }
        },
        updateArrayDataWithNewValue: function(id, type, value, newVal){
            // alert("id : "+id+"    type : "+type+"  value : "+value);
            var arrayData = Ext.getCmp('arraydata');
            var arr = arrayData.getValue();    
            if(type !== "order"){
                if(arrayData.getValue().length > 0){
                    for( var i = 0; i<arr.length;i++)
                        if(arr[i].id === id){
                            arr[i][type] = value;
                        }
                    arrayData.setValue(arr);
                }
            }else{
                if(newVal > -1 && newVal < arr.length){
                    arr[value].order = newVal;
                    arr[newVal].order = value;
                }else{
                   Ext.Msg.alert('INVALID', 'Please provide a order number less than the number of flavours added. Please note the order indexing is starting from zero.'); 
                }
            }
            arr =  arr.sort(function(a,b) {return a.order - b.order});
            arrayData.setValue(arr);
            this.updatePreview();
        },
        removeItem: function(id){
            var arrayData = Ext.getCmp('arraydata');
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                for( var i = 0; i<arr.length;i++){
                    if(arr[i].id === id){
                        var removedI = arr[i].order;
                        arr.splice(i,1);
                        for(var j = removedI ; j< arr.length ; j++){
                            arr[j].order = j;
                        }
                    }
                }    
                
                arrayData.setValue(arr);
            }
        },
        getCurrentItem: function(id){
            var arrayData = Ext.getCmp('arraydata');
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                for( var i = 0; i<arr.length;i++)
                    if(arr[i].id === id){
                        return arr[i];
                    }
                arrayData.setValue(arr);
            }
            return '';
        }
    });






