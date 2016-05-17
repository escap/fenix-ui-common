define(function () {

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

		
		 
		 
		 function parseInut(FX,opt)// FX.metadata.dsd,options
		 {
			 var ret=$.extend(true,{},opt);
			 if(opt.inputFormat=="fenixtool"){
				var FXmod=convertFX(FX,opt);
				  var lang = "EN";
					if (opt.lang) {lang = opt.lang;}
				var aggregations=[],
					hidden=[],
					columns=[],
					rows=[],
					values=[];
					
					function getListDim(arr,opt,FXmod){
						var showCode=opt.showCode;
						var ret=[];
						for (var i in arr){
								if(showCode && FXmod.dimensions[arr[i]].label)
									{ret.push(FXmod.dimensions[arr[i]].code)}
								ret.push(FXmod.dimensions[arr[i]].label|| FXmod.dimensions[arr[i]].code)
							}
							return ret
					}
				
				ret={"inputFormat":"fenixTool",
				"aggregationFn":opt.aggregationFn|| {"value":"sum"},
				"aggregations":getListDim(opt.aggregations,opt,FXmod),
				"hidden":getListDim(opt.hidden,opt,FXmod),
				"columns":getListDim(opt.columns,opt,FXmod),
				"values":opt.values,
				"rows":getListDim(opt.rows,opt,FXmod),
				"formatter":opt.formatter || "value",
				"showRowHeaders":opt.showRowHeaders || false,
				"decimals":opt.decimals || 2,
				"showCode":opt.showCode || false,
				"showFlag":opt.showFlag || false,
				"showUnit":opt.showUnit || false
				};
				
				
			}
			return ret
		 }
		 
        function convertFX(FX, opt) {
            var lang = "EN";
            if (opt.lang) {lang = opt.lang;}
            var structInter = {dimensions: {}, values: {}}

            function setDimension(id, att, val, subject) {
                if (!structInter.dimensions[id]) {structInter.dimensions[id] = {};}
                structInter.dimensions[id][att] = val;
                if (subject) {structInter.dimensions[id]["subject"] = subject;}
            }

            function setValue(id, att, val) {
                if (!structInter.values[id]) {structInter.values[id] = {};}
                if (att != "attribute") {structInter.values[id][att] = val;}
                else {
                    if (!structInter.values[id]["attributes"]) {structInter.values[id]["attributes"] = [];}
                    structInter.values[id]["attributes"].push(val);
                }
            }

            for (var i in FX.columns) {
                var myColumns = FX.columns[i];
                if (myColumns.key == true){//c est le code
                    setDimension(myColumns.id, "title", myColumns.title[lang]||myColumns.id);
                    setDimension(myColumns.id, "code", myColumns.id, myColumns.subject);
                }
                else if (myColumns.id.split("_" + lang).length == 2){//label
                    setDimension(myColumns.id.split("_" + lang)[0], "label", myColumns.id)
                }
				else if (myColumns.dataType == "number" && myColumns.subject == "value") {
                    setValue(myColumns.id, "value", myColumns.id);
                    setValue(myColumns.id, "label", myColumns.id);
                    setValue(myColumns.id, "subject", myColumns.subject);
                }
                else if (myColumns.id.split("|*").length == 2) {//attribut d une valeur X
                    if (myColumns.subject == "um") {setValue(myColumns.id.split("|*")[0], "unit", myColumns.id)} 
					else if (myColumns.subject == "flag") {setValue(myColumns.id.split("|*")[0], "flag", myColumns.id);}
                    else {setValue(myColumns.id.split("|*")[0], "attributes", myColumns.id);}
                }
                else{//attribut de value
                    if (myColumns.subject == "um") {setValue("value", "unit", myColumns.id);}
                    else if (myColumns.subject == "flag") {setValue("value", "flag", myColumns.id);}
                    else {
                        //setDimension(myColumns.id, "label", myColumns.title[lang]||myColumns.id);
                        //setDimension(myColumns.id, "code", myColumns.id, myColumns.subject);
                        setValue("value", "attribute", myColumns.id)
                    }
                }
            }
			return structInter;
        }

        function initFXT(FX, opt){//for Toolbar
            var FXmod = convertFX(FX, opt);
            var hidden = [];
            var columns = [];
            var rows = [];
            var aggregations = [];
            var values = [];

            for (var i in FXmod.dimensions) {
                if (FXmod.dimensions[i].subject == "time") {columns.push({value: FXmod.dimensions[i].code, label: FXmod.dimensions[i].title});}
                else {rows.push({value: FXmod.dimensions[i].code, label: FXmod.dimensions[i].title});}
            }

            for (var i in FXmod.values) {values.push({value: FXmod.values[i].value, label: FXmod.values[i].label});}

            var retObj = {
                hidden: hidden,
                rows: rows,
                columns: columns,
                aggregations: aggregations,
                values: values
            }
            return retObj;
        }

        function initFXD(FX, opt){//for Data
            var FXmod = convertFX(FX, opt);
            var hidden = [];
            var columns = [];
            var rows = [];
            var aggregations = [];
            var values = [];
            for (var i in FXmod.dimensions) {
                if (opt.rows[FXmod.dimensions[i].code]) {
                    rows.push(FXmod.dimensions[i].label || FXmod.dimensions[i].code)
                    if (opt.showCode == true && FXmod.dimensions[i].title != FXmod.dimensions[i].code && FXmod.dimensions[i].title != null) {
                        rows.push(FXmod.dimensions[i].code)
                    }
                }
                if (opt.columns[FXmod.dimensions[i].code]) {
                    columns.push(FXmod.dimensions[i].label || FXmod.dimensions[i].code)
                    if (opt.showCode == true && FXmod.dimensions[i].title != FXmod.dimensions[i].code && FXmod.dimensions[i].title != null) {
                        columns.push(FXmod.dimensions[i].code)
                    }
                }
            }
            for (var i in FXmod.values) {
                if (opt.values[FXmod.values[i].value]) {
                    values.push(FXmod.values[i].value)
                    if (opt.showUnit == true && FXmod.values[i].unit) {values.push(FXmod.values[i].unit);}
                    if (opt.showFlag == true && FXmod.values[i].flag) {values.push(FXmod.values[i].flag);}
                    for (var h in FXmod.values[i].attribute){hidden.push(FXmod.values[i].attribute[h])}
                   
                }
            }
            var retObj = {
                hidden: hidden,
                rows: rows,
                columns: columns,
                aggregations: aggregations,
                values: values
            }
            return retObj;
        }
		
 function initFXDgraph(FX, opt)//for Data for chart
        {
            var FXmod = convertFX(FX, opt);
            var hidden = [];
            var x = [];
            var series = [];
            var aggregations = [];
            var y = [];
            for (var i in FXmod.dimensions) {
                if (opt.series[FXmod.dimensions[i].code]) {
                    series.push(FXmod.dimensions[i].label || FXmod.dimensions[i].code)
                    if (opt.showCode == true && FXmod.dimensions[i].label != FXmod.dimensions[i].code && FXmod.dimensions[i].label != null) {
                        series.push(FXmod.dimensions[i].code)
                    }
                }
                if (opt.x[FXmod.dimensions[i].code]) {
                    x.push(FXmod.dimensions[i].label || FXmod.dimensions[i].code)
                    if (opt.showCode == true && FXmod.dimensions[i].label != FXmod.dimensions[i].code && FXmod.dimensions[i].label != null) {x.push(FXmod.dimensions[i].code);}
                }
            }
            for (var i in FXmod.values) {
                if (opt.y[FXmod.values[i].value]) {

                    y.push(FXmod.values[i].value)
                    if (opt.showUnit == true && FXmod.values[i].unit) {
                        y.push(FXmod.values[i].unit)
                    }

                    if (opt.showFlag == true && FXmod.values[i].flag) {
                        y.push(FXmod.values[i].flag)
                    }
                    for (var h in FXmod.values[i].attribute)
                    {hidden.push(FXmod.values[i].attribute[h])}
                
                }


            }


            var retObj = {
                hidden: hidden,
                series: series,
                x: x,
                aggregations: aggregations,
                y: y
            }
            return retObj;
        }

   
        return function () {
            return {
                convertFX: convertFX,
                initFXT: initFXT,
                initFXD: initFXD,
				initFXDgraph:initFXDgraph,
				parseInut:parseInut
            }
        };
    }
);