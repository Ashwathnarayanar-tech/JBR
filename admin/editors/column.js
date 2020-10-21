Ext.widget({
    xtype: 'mz-form-widget',
    itemId: 'column',
    id: 'column',
    defaults: {
            xtype: 'textfield',
            listeners: {
                controller: '',
                
                
                
            }
        },
    
    items: [
            
            {
                    xtype: 'textfield',
                    width: 700,
                    allowBlank: false,
                    fieldLabel: 'Column Headline',
                    name: 'headLine'
            },
            {
                    xtype: 'textfield',
                    width: 700,
                    allowBlank: true,
                    fieldLabel: 'Column Headline Link',
                    name: 'headLinelink'
            },
            {
                    xtype: 'textfield',
                    width: 200,
                    allowBlank: true,
                    fieldLabel: 'Label Text',
                    id : 'labeltxt',
                    name: 'labelText'
            },
            {
                    xtype: 'textfield',
                    width: 200,
                    allowBlank: true,
                    fieldLabel: 'Label Link',
                    id : 'labellnk',
                    name: 'labelLink'
            },
            {
                    xtype: 'button',
                    text : 'Add',
                    allowBlank: false,
                    name: 'addbtn',
                    handler : function(cmp){
                        var rootData = Ext.getCmp('column');
                        rootData.getLinkData(Ext.getCmp('column'));
                    }
                    
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
                    xtype: 'taco-arrayField',
                    itemId : 'arraydata',
                    width: 200,
                    fieldLabel: 'Label Array',
                    name: 'data', 
                    hidden : true
            }
            
            
            ],
            getLinkData : function(cmp){
                var linkdetails = {}
                linkdetails.labeltxt = Ext.getCmp('labeltxt').getValue();
                linkdetails.labellnk = Ext.getCmp('labellnk').getValue();
                
                this.updateArrayData(linkdetails,cmp);
                
                //var lbltxt = Ext.getCmp('labeltxt').lastValue;
                 // alert(lbltxt);
                //var lblLnk = Ext.getCmp('labellnk').lastValue;
                //alert(lblLnk);
            },
            updateArrayData : function(lnkdetails,cmp){
                var tocoarrdata = Ext.getCmp('column').down('#arraydata');
                //console.log(tocoarrdata);
                gettacoarrdata = tocoarrdata.getValue()
                //console.log(gettacoarrdata);
                lnkdetails.lblId = gettacoarrdata.length+1; 
                console.log(lnkdetails);
                if(lnkdetails.labeltxt != '' && lnkdetails.labellnk != '' ){
                    
                    gettacoarrdata.push(lnkdetails);
                    /*console.log(lnkdetails);*/
                    tocoarrdata.setValue(gettacoarrdata);
                    Ext.getCmp('labeltxt').setValue('');
                    Ext.getCmp('labellnk').setValue('');
                } else {
                    Ext.Msg.alert('ERROR!!!', 'Please provide values.');
                }
                 this.updatePreview();
            },
            listeners: {
                afterrender: function (cmp) {
                    this.updatePreview();
                }
            },
            updatePreview: function () {
                //console.log("Preview Updating");
                var formValues = this.getForm().getValues();
               //console.log(formValues)
                this.createLinkPreview(formValues.data);
            },
            createLinkPreview : function(tacodata){
                //console.log(tacodata);
                var meThis = this;
                var data;
                var preview = this.down('#preview');
                //console.log(preview);
                var el =  preview.getEl();
                //console.log(el);
                if(el && el.dom){
                    el.dom.innerHTML = "";
                    //console.log(el.dom);
                }
                var parentElem = document.createElement('div');
                /*var headlinediv = document.createElement('div');
                var headlinespan = document.createElement('h1');
                var headlineText = document.createTextNode(headlinedata);
                headlinespan.appendChild(headlineText);
                headlinediv.appendChild(headlinespan);
                parentElem.appendChild(headlinediv);*/
                var linktable = document.createElement('table');
                linktable.setAttribute('border','1');
                linktable.style.color = '#000';
                linktable.style.margin = '0px auto';
                linktable.style.width = '500px';
                
                var tableHeadingrow = document.createElement('tr');
                var tableHeading1 = document.createElement('th');
                var tableText1 = document.createTextNode('Text');
                var tableHeading2 = document.createElement('th');
                var tableText2 = document.createTextNode('Link');
                var tableHeading3 = document.createElement('th');
                tableHeading1.appendChild(tableText1);
                tableHeading2.appendChild(tableText2);
                tableHeadingrow.appendChild(tableHeading1);
                tableHeadingrow.appendChild(tableHeading2);
                tableHeadingrow.appendChild(tableHeading3);
                linktable.appendChild(tableHeadingrow);
                for(var i = 0; i < tacodata.length ; i++){
                    var linkdiv = document.createElement('tr');
                    linkdiv.setAttribute('border','1');
                    linkdiv.style.textAlign = 'center';
                    //var linktablerow = document.createElement('tr')
                    var linklabel = document.createElement('td');
                    //linklabel.style.padding = '0 30px';
                    linklabel.setAttribute('rowId',tacodata[i].lblId);
                    linklabel.onclick = function(e){
                        console.log(e);
                        console.log(e.target.getAttribute("rowId"),tacodata[(e.target.getAttribute("rowId"))-1].labeltxt)
                        meThis.editValue(e.target.getAttribute("rowId"),'linktext',tacodata[(e.target.getAttribute("rowId"))-1].labeltxt);
                    }
                    //console.log(tacodata);
                    var linkText = document.createTextNode(tacodata[i].labeltxt);
                    
                    var linklabelA = document.createElement('td');
                    //linklabelA.style.padding = '0 30px';
                    linklabelA.setAttribute('rowId',tacodata[i].lblId);
                    linklabelA.onclick = function(e){
                        console.log(e);
                        meThis.editValue(e.target.getAttribute("rowId"),'link',tacodata[(e.target.getAttribute("rowId"))-1].labellnk);
                    }
                    var linkTextA = document.createTextNode(tacodata[i].labellnk);
                    var linkbtncol = document.createElement('td');
                    var linkbnt = document.createElement('input');
                    linkbnt.setAttribute('type','button');
                    linkbnt.setAttribute('rowId',tacodata[i].lblId);
                    linkbnt.setAttribute('value','Remove');
                    linkbnt.style.background= "#CA1010";
                    linkbnt.style.border= "1px solid #EEE";
                    linkbnt.style.color= "#FFF";
                    linkbnt.style.padding= "5px 8px";
                    linkbnt.onclick = function(e){ 
                        //alert(1);
                        //console.log(e.target.getAttribute("rowId"),tacodata[(e.target.getAttribute("rowId"))-1].labeltxt)
                        meThis.editValue(e.target.getAttribute("rowId"));
                        //alert(1);
                    };
                    linklabelA.appendChild(linkTextA); 
                    linklabel.appendChild(linkText);
                    linkbtncol.appendChild(linkbnt);
                    linkdiv.appendChild(linklabel);
                    linkdiv.appendChild(linklabelA);
                    linkdiv.appendChild(linkbtncol);
                    linktable.appendChild(linkdiv);
                    /*linkdiv.appendChild(linklabelA);
                    linkdiv.appendChild(linkbnt);*/
                    
                    parentElem.appendChild(linktable);
                }
                if(el && el.dom)
                    el.dom.appendChild(parentElem);
                
                
                
            },
            editValue : function(id,name,value){
                var meThis = this;
                var currentValue = meThis.getCurrentItem(id);
                
                if(name){
                    if(name === 'linktext'){
                         Ext.Msg.prompt('Column Lable', 'Please enter a label text:', function(btn, text){
                        if (btn == 'ok'){
                            meThis.updateArrayDataWithNewValue(id,"labeltxt",text);
                        }
                    },this, false,currentValue?currentValue.name:'');
                    }
                    if(name === 'link'){
                         Ext.Msg.prompt('Column Link', 'Please enter a label link:', function(btn, text){
                        if (btn == 'ok'){
                            meThis.updateArrayDataWithNewValue(id,"labellnk",text);
                        }
                    },this, false,currentValue?currentValue.name:'');
                    }
                }else{
                    meThis.removeColumn(id);
                }
            },
            getCurrentItem: function(id){
                console.log(id);
            var arrayData = Ext.getCmp('column').down('#arraydata');
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                console.log(arr);
                for( var i = 0; i<arr.length;i++)
                    if(arr[i].lblId == id){
                        console.log(arr[i].lblId);
                        return arr[i];
                    }
                arrayData.setValue(arr);
            }
            return '';
        },
        updateArrayDataWithNewValue : function(id,name,newname){
            meThis = this;
            var arrayData = Ext.getCmp('column').down('#arraydata');
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                if(name === "labeltxt"){
                    if(arr[id-1].lblId == id){
                            arr[id-1].labeltxt = newname;
                    } 
                    //arrayData.setValue(arr);
                }else if(name == "labellnk"){
                    if(arr[id-1].lblId == id){
                            arr[id-1].labellnk = newname;
                    }
                }
            }
            arrayData.setValue(arr);
            this.updatePreview();
            
            
        },
        removeColumn : function(id){
            meThis = this;
            var arrayData = Ext.getCmp('column').down('#arraydata');
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                arr.splice(id-1,1);
            }
            arrayData.setValue(arr);
            this.updatePreview();
        }
});
   




