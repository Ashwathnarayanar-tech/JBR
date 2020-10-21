
var isLoaded = false;

    Ext.widget({
        xtype   : 'mz-form-widget',
        itemId: 'recipe',
        anchor: "100%",
        
        defaults: {
            xtype: 'textfield',
            listeners: {
                controller: '',
                change: function (cmp) {
                    controller = cmp;
                    cmp.up('#recipe').updatePreview();
                },
                filechange: function(filelist){
                    controller.up('#recipe').handleUploadFile(filelist,controller.up('#recipe'));
                }
            }
        },
        
        
        items: [
            {
              xtype         : "textfield",
              itemId        : "headerText",
              fieldLabel    : "Recipe Name",
              name          : "header",
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
                                            '<p style="color: #1AC21C;"><b style="color: #3D96D7;">How to add recipes?</b></br> Upload recipes images to add new recipes items. In default for each uploaded item one will be set as mix result and all other items as mixture.</p>'+
                                            '<p style="color: #1AC21C;"><b style="color: #3D96D7;">How to change name/link of recipes?</b></br> Click on edit link button, it will show currently assigned link. Replace it with new value. To change name of bean click on name and follow the same step followed to edit the link.</p>'+
                                            '<p style="color: #1AC21C;"><b style="color: #3D96D7;">How to add/remove recipes?</b></br> Upload recipes images to add new recipes items. By clicking the remove link can remove the item from list. If you remove a last item/item which is marked as result automatically the last item in the result will be assigned as recipe result. If you remove an item inbetween the order number will also get updated. </p>'+
                                            '<p style="color: #1AC21C;"><b style="color: #3D96D7;">How to change recipes order?</b></br> Click on the order number in of each item, and give a new value. Please note order number is starting from index value zero. New order number should be a valid integer and also below the number of total items present.</p>'
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
            var formValues = this.getForm().getValues();
            console.log("Update preview");
            var arr = formValues.data;
            this.createFlavourPreview(arr);
        },
        createFlavourPreview: function(array){
            var meThis = this;
            var data;
            var preview = this.down('#preview');
            var el =  preview.getEl();
            if(el && el.dom){
                el.dom.innerHTML = "";
            }
            for(index =0 ;index < array.length; index++ ){
                data = array[index];
                
                var parent = document.createElement('DIV');
                parent.style.float = 'left';
                parent.style.margin = '5px';
                parent.style.textAlign = 'center';
                parent.style.border = "1px solid #CFC3C3";
                parent.style.padding = "5px";
                parent.style.borderRadius = "4px";
                
                var order = document.createElement('SPAN');
                order.style.color = "#074e7c";
                order.style.cursor = "pointer";
                order.style.display = "block";
                order.style.border = "1px solid #CCC";
                order.style.padding = "3px";
                order.style.margin = "6px 0px";
                console.log(data.order);
                order.innerHTML  = data.order;
                order.setAttribute("editingItem",data.id);
                order.onclick = function(e){
                    meThis.editValue(e.target.getAttribute("editingItem"),"order",data.order);  
                };
                
                var img = document.createElement('IMG');
                img.src = data.imageUrl;
                img.width = 100;
                img.height = 85;
                
                var name = document.createElement('P');
                name.style.color = "#074e7c";
                name.style.cursor = "pointer";
                name.innerHTML  = data.name;
                name.setAttribute("editingItem",data.id);
                name.onclick = function(e){
                  meThis.editValue(e.target.getAttribute("editingItem"),"name",data.name);  
                };
                
                var type = document.createElement('select');
                // type.innerText  = data.type;
                console.log(data.recipeType);
                type.setAttribute("editingItem",data.id);
                var option1 = document.createElement("option");
                option1.value = "mix";
                option1.text = "Recipie Mix";
                var option2 = document.createElement("option");
                option2.value = "result";
                option2.text = "Recipie Result";
                data.recipeType === "result" ? option2.selected = true: option1.selected = true;
                type.appendChild(option1);
                type.appendChild(option2);
                type.style.display = "block";
                type.onchange = function(e){
                    console.log(e.target.getAttribute("editingItem"));
                    meThis.editValue(e.target.getAttribute("editingItem"),"recipeType",e.currentTarget.options.selectedIndex==0?"mix":"result");
                };
                
                var link = document.createElement('BUTTON');
                link.innerHTML  = "Edit Link";
                link.setAttribute("editingItem",data.id);
                link.style.background= "#CA1010";
                link.style.border= "1px solid #EEE";
                link.style.color= "#FFF";
                link.style.padding= "5px 8px";
                link.onclick = function(e){
                    meThis.editValue(e.target.getAttribute("editingItem"),"link");
                };
                
                
                var remove = document.createElement('BUTTON');
                remove.innerHTML  = "Remove";
                remove.setAttribute("editingItem",data.id);
                remove.style.background= "rgb(16, 117, 202)";
                remove.style.border= "1px solid #EEE";
                remove.style.color= "#FFF";
                remove.style.padding= "5px 8px";
                remove.onclick = function(e){
                    meThis.editValue(e.target.getAttribute("editingItem"),"remove");
                };
                parent.appendChild(order);
                parent.appendChild(img);
                parent.appendChild(name);
                parent.appendChild(type);
                parent.appendChild(link);
                parent.appendChild(remove);
                
                if(el && el.dom)
                    el.dom.appendChild(parent);
            }
        },
        
        editValue: function(id,property,oldVal){
            var meThis = this;
            var currentValue = meThis.getCurrentItem(id);
            if(property != "remove"){
                    //Show prompt
                    if(property === "order"){
                        Ext.Msg.prompt('Recipie Mix Position', 'Please enter new position for this recipie mix:', function(btn, newVal){
                            if (btn == 'ok'){
                                meThis.updateArrayDataWithNewValue(id,property,currentValue.order,newVal);
                            }
                        },this, false,currentValue[property]?currentValue[property]:'');
                    }
                   if(property === "recipeType"){
                       var newVal = oldVal;
                        // Ext.Msg.prompt('Recipie Mix Type', 'Please enter new position for this recipie mix:', function(btn, newVal){
                        //     if (btn == 'ok'){
                                meThis.updateArrayDataWithNewValue(id,property,newVal);
                        //     }
                        // },this, false,currentValue[property]?currentValue[property]:'');
                    }
                    if(property === "name"){
                        Ext.Msg.prompt('Recipie Mix Name', 'Please enter new name for this recipie mix:', function(btn, newVal){
                            if (btn == 'ok'){
                                meThis.updateArrayDataWithNewValue(id,property,newVal);
                            }
                        },this, false,currentValue[property]?currentValue[property]:'');
                    }
                    if(property === "link"){
                        Ext.Msg.prompt('Recipie Mix Link', 'Please enter url for this recipie mix:', function(btn, newVal){
                            if (btn == 'ok'){
                                meThis.updateArrayDataWithNewValue(id,property,newVal);
                            }
                        },this, false,currentValue[property]?currentValue[property]:'');
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
                    cmp.addRecipeIcons(h.document.data.url);
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
        addRecipeIcons : function(imgURL){
            var recipeObject  = new Object();
            recipeObject.id = "UUID0";
            recipeObject.imageUrl = imgURL;
            recipeObject.name = "Lorem Ipsum";
            recipeObject.recipeType = "mix";
            recipeObject.order = 0;
            recipeObject.link = "jellybelly.com";
            this.updateArrayData(recipeObject);
        },
        updateArrayData: function(flavourObject){
            var arrayData = Ext.getCmp('arraydata');
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                    flavourObject.id = "UUID"+arr.length;
                    flavourObject.order = arr.length;
                    flavourObject.recipeType = "mix";
                    arr.push(flavourObject);
                arr = this.sortDataToMakeResultLastItem(arr);
                arrayData.setValue(arr);
            }else{
                arrayData.setValue(flavourObject);
            }
            // isLoaded = true;
        },
        
        sortDataToMakeResultLastItem: function(arr){
            var resultPosition;
            console.log(arr);
            for(var i = 0 ; i<arr.length ; i++){
                if(arr[i].recipeType === "result"){
                    resultPosition = i;
                }
            }  
            if(typeof resultPosition != 'undefined'){
                var last = arr[arr.length-1];
                arr[arr.length-1] = arr[resultPosition];
                arr[arr.length-1].order = arr.length-1;
                last.order = resultPosition;
                arr[resultPosition] = last;
            }else{
                arr[arr.length-1].recipeType = "result";
            }
            console.log(arr);
            return arr;
        },
        updateArrayDataWithNewValue: function(id, property, oldVal, newVal){
            var arrayData = Ext.getCmp('arraydata');
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                if(property === "name"){
                        for( var i = 0; i<arr.length;i++)
                        {
                            if(arr[i].id === id){
                                arr[i][property] = oldVal;
                            }
                        }
                }else if(property === "link"){
                        for( var i = 0; i<arr.length;i++)
                        {
                            if(arr[i].id === id){
                                arr[i][property] = oldVal;
                            }
                        }
                }else if(property === "recipeType"){
                    var a;
                    for( var i = 0; i<arr.length;i++)
                    {
                        if(arr[i].id === id){
                            arr[i][property] = oldVal;
                            a = i ;
                        }else{
                            arr[i][property] = oldVal === "result"? "mix": arr[i][property];
                        }
                    }
                    if(oldVal === "mix"){
                        arr[arr.length-1].recipeType = "result";
                    }
                    arr[arr.length-1].order = a;
                    arr[a].order = arr.length -1;
                }else{
                    var a,b,temp;
                    if(newVal < arr.length && newVal > -1 ){
                        arr[oldVal][property] = newVal;
                        arr[newVal][property] = oldVal;
                        arr =  arr.sort(function(a,b) {return a.order - b.order});
                        if(newVal == arr.length-1){
                            arr[newVal].recipeType = "result";
                            for( var i = 0; i<arr.length-1; i++){
                                arr[i].recipeType = "mix";
                            }    
                        }
                    }else{
                        Ext.Msg.alert('SORY!', 'Please provide a order number less than the number of recipies added. Please note the order indexing is starting from zero.');
                    }
                }
                arr =  arr.sort(function(a,b) {return a.order - b.order});
                arrayData.setValue(arr);
                this.updatePreview();
            }
        },
        removeItem: function(id){
            var arrayData = Ext.getCmp('arraydata');
            var removedItem;
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                for( var i = 0; i<arr.length;i++){
                    if(arr[i].id === id){
                        removedItem = arr[i];
                        arr.splice(i,1);
                    }
                }
                if(removedItem.recipeType == "result"){
                    arr[arr.length-1].recipeType = "result"; 
                }else{
                    for(var i = removedItem.order; i<arr.length ; i++){
                        arr[i].order = i;
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











