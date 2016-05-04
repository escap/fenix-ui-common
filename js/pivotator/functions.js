define(["jstat"], function() {
	/*
ret=
	{
		CUMULATIVE:{median:{
getValue:function(rec){
				//console.log(rec);
				return rec.value;},
aggregator:function(cell){
				var a= jStat(cell);
				return this.formater(a.median());},
cumulative:false,
formater:function(e){return (Math.floor(e*100)/100).toLocaleString()}
}

		}

,



		NONCUMULATIVE:{sum:{
getValue:function(entry,rec){

				if(entry === undefined){entry={sum:rec.value,num:1}}
				else{entry.sum+=rec.value;entry.num++;}
				return entry;},
aggregator:function(cell){
				return this.formater(cell.sum)},
cumulative:true,
formater:function(e){return Math.floor(e*100)/100}
		}}
		
	};



var fonctionsNoCum={
getValue:function(rec){
				//console.log(rec);
				return rec.value;},
aggregator:function(cell){
				var a= jStat(cell);
				return this.formater(a.sum());},
cumulative:false,
formater:function(e){return Math.floor(e*100)/100}
		}



		//cumulative sum function
		var fonctionsCum={
getValue:function(entry,rec){

				if(entry === undefined){entry={sum:rec.value,num:1}}
				else{entry.sum+=rec.value;entry.num++;}
				return entry;},
aggregator:function(cell){
				return this.formater(cell.sum)},
cumulative:true,
formater:function(e){return Math.floor(e*100)/100}

		}
		return function()
		{
			return{
			fonctionsCum:fonctionsCum,
			fonctionsNoCum:fonctionsNoCum,
			list:ret
			}
		}
		
}
*/
var Aggregator={
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
				default:function(cell,format,nbDec){var a=cell;return a.join(" ")}
			};
			//	console.log("Aggregator",Aggregator.value)
			
			
var GetValue={
	default:function(rec,champ){return rec[champ];},
	value:{number:function(rec)
	{if(rec.value==null)
	{return null}return parseFloat(rec.value)
	}
	,
	string:function(rec){return rec.value}
	},
	Value:{number:function(rec){if(rec.Value==null){return null}return parseFloat(rec.Value)},string:function(rec){return rec.Value}}
		
};

/*Classic:function(rec){return rec.Value},
	classic:function(rec){return rec.value},
	ClassicToNumber:function(rec){if(rec.Value==null){return null}return parseFloat(rec.Value)},
	classicToNumber:function(rec){if(rec.value==null){return null}return parseFloat(rec.value)},
	customToString:function(rec,args){ret=[];for(var i in args){ret.push(rec[args[i]])}},
	customToNumber:function(rec,args){ret=[];for(var i in args){ret.push( parseFloat(rec[args[i]]) )}}*/




var Formater={
	localstring:function(e,nbdecimal){return (Math.floor(e*Math.pow(10,nbdecimal))/Math.pow(10,nbdecimal)).toLocaleString()},
	value:function(e,nbdecimal){return Math.floor(e*Math.pow(10,nbdecimal))/Math.pow(10,nbdecimal)},
	string:function(e,nbdecimal){return e}

	};

var getListAggregator=function(){//for toolbar
ret={};
for(var i in Aggregator)
{
console.log(i,Aggregator[i])
ret[i]={};
for(var j in Aggregator[i])
	{
	ret[i][j]=Aggregator[i][j];
	}

}console.log("ret",ret);
return ret;
	}
	
var getAgg=function(champ,choix){

if(!Aggregator[champ]){return Aggregator.default}
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