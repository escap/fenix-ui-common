define(function(){

/*exemple DSD

{
	dimensions:{
		country:{title:'country',code:"country",label:"country_EN"},
		indicator:{title:'indicator',code:"indicator",label:"indicator_EN"},
		year:{title:'year',code:"year",label:"year"}
		},
	values:{
		value:{label:"value",
		value:"value",
		attribute:["flag","um"]
		},
		poplation:{
			label:"population",
			value:"population",
			attribute:[]
	}
	]
}
*/



function convertFX(FX,opt){


var lang="EN";if (opt.lang){lang=opt.lang;}
var structInter={dimensions:{},values:{}}


function setDimension(id,att,val,subject){
	if(!structInter.dimensions[id]){structInter.dimensions[id]={};}
	structInter.dimensions[id][att]=val;
if(subject){structInter.dimensions[id]["subject"]=subject;}
}

function setValue(id,att,val){
//	console.log("setDim",id,att,val);
	if(!structInter.values[id]){structInter.values[id]={};}
if(att!="attribute"){structInter.values[id][att]=val}
else{if(!structInter.values[id]["attributes"]){structInter.values[id]["attributes"]=[]}
		structInter.values[id]["attributes"].push(val)
	}
}
//console.log('inside convertFX',FX);
for (var i in FX.columns)
{
	var myColumns=FX.columns[i];
	if(myColumns.key==true)//c est le code
	{setDimension(myColumns.id,"label",myColumns.title[lang]);
	setDimension(myColumns.id,"code",myColumns.id,myColumns.subject);	
	}
	else if(myColumns.id.split("_"+lang).length==2)//label
		{setDimension(myColumns.id.split("_"+lang)[0],"title",myColumns.id)}
	
	
	else if(myColumns.dataType=="number" && myColumns.subject=="value"){
		setValue(myColumns.id,"value",myColumns.id);
		setValue(myColumns.id,"label",myColumns.id);
		setValue(myColumns.id,"subject",myColumns.subject);
		}
	else if(myColumns.id.split("|*").length==2){//attribut d une valeur X
		if(myColumns.subject=="um"){setValue(myColumns.id.split("|*")[0],"unit",myColumns.id)} else
		if(myColumns.subject=="flag"){setValue(myColumns.id.split("|*")[0],"flag",myColumns.id)} 
		else{setValue(myColumns.id.split("|*")[0],"attributes",myColumns.id);}
		}
	else//attribut de value 
	{if(myColumns.subject=="um"){setValue("value","unit",myColumns.id)}
	else if(myColumns.subject=="flag"){setValue("value","flag",myColumns.id)}
		else{
		setValue("value","attribute",myColumns.id)
		}
	}
}
//console.log("structInter",JSON.stringify(structInter))
/*
	for(var i in FX.columns)
		{
			if(FX.columns[i].dataType=="number"){HIDDEN.push({value:FX.columns[i].id,label:FX.columns[i].title[lang]})}
			else if(FX.columns[i].subject=="time"){COLS.push({value:FX.columns[i].id,label:FX.columns[i].title[lang]})}

			else if (FX.columns[i].subject!="time" && FX.columns[i].key==true ){ROWS.push({value:FX.columns[i].id,label:FX.columns[i].title[lang]});}
			else {AGG.push({value:FX.columns[i].id,label:FX.columns[i].title[lang]})}
		}*/
		
		
		
		return structInter;
		
		
}
 
 function initFXT(FX,opt)//for Toolbar
 {
	//console.log("initFX",opt)
var 	 FXmod=convertFX(FX,opt);
	 var HIDDEN=[];
var COLS=[];
var ROWS=[];
var AGG=[];
var VALS=[];

for(var i in FXmod.dimensions){
		if(FXmod.dimensions[i].subject=="time"){COLS.push({value:FXmod.dimensions[i].code,label:FXmod.dimensions[i].label});}
		else{ROWS.push({value:FXmod.dimensions[i].code,label:FXmod.dimensions[i].label});}
	}
	
for(var i in FXmod.values){
//console.log(FXmod.values[i].label)
	VALS.push({value:FXmod.values[i].value,label:FXmod.values[i].label});	
	}

var retObj={
		HIDDEN:HIDDEN,
		ROWS:ROWS,
		COLS:COLS,
		AGG:AGG,
		VALS:VALS}
	//	console.log(retObj)
	return retObj;
}
  function initFXD(FX,opt)//for Data
 {
	//console.log("initFX",opt)
var FXmod=convertFX(FX,opt);
console.log("FXmod",FXmod)
	 var HIDDEN=[];
	var COLS=[];
	var ROWS=[];
	var AGG=[];
	var VALS=[];
	for(var i in FXmod.dimensions){
	
	//console.log("ici",opt.ROWS,opt.COLS,FXmod.dimensions[i],"test",FXmod.dimensions[i].title||FXmod.dimensions[i].code);
	if(opt.ROWS[	FXmod.dimensions[i].code	]){
		ROWS.push(FXmod.dimensions[i].title||FXmod.dimensions[i].code)
		if(opt.showCode==true && FXmod.dimensions[i].label!=FXmod.dimensions[i].code && FXmod.dimensions[i].label!=null )
			{
			//console.log("add CODE")
			ROWS.push(FXmod.dimensions[i].code)}
	}
	if(opt.COLS[FXmod.dimensions[i].code	]){
		COLS.push(FXmod.dimensions[i].title||FXmod.dimensions[i].code)
		if(opt.showCode==true && FXmod.dimensions[i].title!=FXmod.dimensions[i].code && FXmod.dimensions[i].title!=null )
			{COLS.push(FXmod.dimensions[i].code)}
	}
}
//console.log("opt FXMOD",opt)
for(var i in FXmod.values){
	//console.log(FXmod.values[i])
	if(opt.VALS[FXmod.values[i].value]){
		
		VALS.push(FXmod.values[i].value)
		if(opt.showUnit==true && FXmod.values[i].unit){VALS.push(FXmod.values[i].unit)}
		
		if(opt.showFlag==true && FXmod.values[i].flag){VALS.push(FXmod.values[i].flag)}
		/*if(opt.showUnit==true &&
			FXmod.values[i].title!=FXmod.values[i].code &&
			FXmod.values[i].title!=null )
			{VALS.push(FXmod.dimensions[i].code)}*/
	}
	

}




var retObj={
		HIDDEN:HIDDEN,
		ROWS:ROWS,
		COLS:COLS,
		AGG:AGG,
		VALS:VALS}
		console.log("FIN initFXD",retObj)
	return retObj;
}
 
 return function() {
        return{
      convertFX:convertFX,
	  initFXT:initFXT,
	  initFXD:initFXD
		}
    };
}
);