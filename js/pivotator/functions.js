define(["jstat"], function() {

var Aggregator={
	"VALUE0":{

		"default":function(cell,format,nbDec){
			//	console.log("AGG DEFAULT",cell)
			var a= jStat(cell);return format(a.sum(),nbDec)},
		"sum":function(cell,format,nbDec){
			var a= jStat(cell);return format(a.sum(),nbDec)},
		avg:function(cell,format,nbDec){var a= jStat(cell);return format(a.mean(),nbDec)},
		median:function(cell,format,nbDec){var a= jStat(cell);return format(a.median(),nbDec)},
		stdev:function(cell,format,nbDec){var a= jStat(cell);return format(a.stdev(),nbDec)},
		count:function(cell,format,nbDec){var a= cell;return format(a.length,nbDec)},
		concat:function(cell,format,nbDec){var a= cell;return a.join(" - ")}
	},
	"Value":{

		"default":function(cell,format,nbDec){
			//	console.log("AGG DEFAULT",cell)
			var a= jStat(cell);return format(a.sum(),nbDec)},
		"sum":function(cell,format,nbDec){
			var a= jStat(cell);return format(a.sum(),nbDec)},
		avg:function(cell,format,nbDec){var a= jStat(cell);return format(a.mean(),nbDec)},
		median:function(cell,format,nbDec){var a= jStat(cell);return format(a.median(),nbDec)},
		stdev:function(cell,format,nbDec){var a= jStat(cell);return format(a.stdev(),nbDec)},
		count:function(cell,format,nbDec){var a= cell;return format(a.length,nbDec)},
		concat:function(cell,format,nbDec){var a= cell;return a.join(" - ")}
	},"VALUE":{

		"default":function(cell,format,nbDec){
			//	console.log("AGG DEFAULT",cell)
			var a= jStat(cell);return format(a.sum(),nbDec)},
		"sum":function(cell,format,nbDec){
			var a= jStat(cell);return format(a.sum(),nbDec)},
		avg:function(cell,format,nbDec){var a= jStat(cell);return format(a.mean(),nbDec)},
		median:function(cell,format,nbDec){var a= jStat(cell);return format(a.median(),nbDec)},
		stdev:function(cell,format,nbDec){var a= jStat(cell);return format(a.stdev(),nbDec)},
		count:function(cell,format,nbDec){var a= cell;return format(a.length,nbDec)},
		concat:function(cell,format,nbDec){var a= cell;return a.join(" - ")}
	},
	"value":{
				
					"default":function(cell,format,nbDec){
				//	console.log("AGG DEFAULT",cell)
					var a= jStat(cell);return format(a.sum(),nbDec)},
					"sum":function(cell,format,nbDec){
					
					var a= jStat(cell);return format(a.sum(),nbDec)},
					avg:function(cell,format,nbDec){var a= jStat(cell);return format(a.mean(),nbDec)},
					median:function(cell,format,nbDec){var a= jStat(cell);return format(a.median(),nbDec)},
					stdev:function(cell,format,nbDec){var a= jStat(cell);return format(a.stdev(),nbDec)},
					count:function(cell,format,nbDec){var a= cell;return format(a.length,nbDec)},
					concat:function(cell,format,nbDec){var a= cell;return a.join(" - ")}
					},
				ObsValue:{
				
					"default":function(cell,format,nbDec){
					//console.log(cell.length)
					var cell2=[];
					for(var i in cell)
					{if(!Number.isNaN(cell[i]))
					cell2.push(cell[i]);	
					}
					
					var a= jStat(cell2);
					if(cell2.length==0){return NaN}
					return format(a.sum(),nbDec)},
					"sum":function(cell,format,nbDec){
					
					var a= jStat(cell);return format(a.sum(),nbDec)},
					avg:function(cell,format,nbDec){var a= jStat(cell);return format(a.mean(),nbDec)},
					median:function(cell,format,nbDec){var a= jStat(cell);return format(a.median(),nbDec)},
					stdev:function(cell,format,nbDec){var a= jStat(cell);return format(a.stdev(),nbDec)},
					count:function(cell,format,nbDec){var a= cell;return format(a.length,nbDec)},
					concat:function(cell,format,nbDec){var a= cell;return a.join(" - ")}
					},
				
				
				
	um:{	default:function(cell,format,nbDec){
						var ret=cell[0];
						for(var i in cell)
							{
							
							if(cell[i]!=ret){ret="_";}}
						return ret;
						},
						diff:function(cell,format,nbDec){
						var ret=cell[0];
						for(var i in cell)
							{
							
							if(cell[i]!=ret){ret="_";}}
						return ret;
						
						}
				},
	flag:{
					concat:function(cell,format,nbDec){var a= cell;return a.join(" - ")},
					default:function(cell,format,nbDec){var a= cell;return a.join(" - ")}
					},
	v1:{					
					count:function(cell,format,nbDec){var a= cell;return format(a.length,nbDec)},
					concat:function(cell,format,nbDec){var a= cell;return a.join(" - ")},
					default:function(cell,format,nbDec){var a= cell;return a.join(" - ")}
					},
	default:{default:function(cell,format,nbDec){var a=cell;return a.join(" ")},
	sum:function(cell,format,nbDec){var a= jStat(cell);return format(a.sum(),nbDec)},
	avg:function(cell,format,nbDec){var a= jStat(cell);return format(a.mean(),nbDec)},
	median:function(cell,format,nbDec){var a= jStat(cell);return format(a.median(),nbDec)},
	stdev:function(cell,format,nbDec){var a= jStat(cell);return format(a.stdev(),nbDec)},
	count:function(cell,format,nbDec){var a= cell;return format(a.length,nbDec)},
	concat:function(cell,format,nbDec){var a= cell;return a.join(" - ")}
	
	}
	};
			//	console.log("Aggregator",Aggregator.value)
			
			
var GetValue={
	default:function(rec,champ){return rec[champ];},
	value:{number:function(rec)
	{if(rec.value==null)
	{return null}
return parseFloat(rec.value)
	}
	,
	string:function(rec){return rec.value}
	},
	Value:{number:function(rec){if(rec.Value==null){return null}return parseFloat(rec.Value)},string:function(rec){return rec.Value}}
		
};



var Formater={
	localstring:function(e,nbdecimal){return (Math.floor(e*Math.pow(10,nbdecimal))/Math.pow(10,nbdecimal)).toLocaleString()},
	value:function(e,nbdecimal){return Math.floor(e*Math.pow(10,nbdecimal))/Math.pow(10,nbdecimal)},
	string:function(e,nbdecimal){return e}
	};

var getListAggregator=function(){//for toolbar
ret={};
for(var i in Aggregator)
{

ret[i]={};
for(var j in Aggregator[i])
	{
	ret[i][j]=Aggregator[i][j];
	}

}
return ret;
	}
	
var getAgg=function(champ,choix){
//console.log(champ,choix);
if(!Aggregator[champ]){if(!Aggregator.default[choix]){return Aggregator.default.default}
else{return Aggregator.default[choix]}
}

if(!choix){choix="default";}
return Aggregator[champ][choix];
}

var getGetValue=function(champ,choix){
if(!GetValue[champ]){return GetValue["default"]}
else if(!GetValue[champ][choix]){return GetValue["default"]}
else{return GetValue[champ][choix]}
}

var getFormater=function(choix){return Formater[choix]}

return function(){
	return {
		getListAggregator:getListAggregator,
		getAgg:getAgg,
		getGetValue:getGetValue,
		getFormater:getFormater
		}
	}

}
);