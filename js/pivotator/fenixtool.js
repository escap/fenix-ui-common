define([
        "underscore"
    ], function (_) {


        var FXmod;

        function parseInput(FX, opt) {// FX.metadata.dsd,options
            var ret = $.extend(true, {}, opt);
			  var FXmod = convertFXDirty(FX, opt);
			  
			  function getDimension()
			  {var ret=[];
			  for(var i in FXmod.dimensions)
				{
					ret.push(i)
				}
				return ret
			  }
			  
			      function getListDim(arr, opt, FXmod) {
                    var showCode = opt.showCode;
                    var ret = [];
                    for (var i in arr) {
                        if (showCode && FXmod.dimensions[arr[i]].label) {ret.push(FXmod.dimensions[arr[i]].code);}
                    //    console.log(arr[i],FXmod.dimensions,FXmod.dimensions[arr[i]]);
						
						ret.push(FXmod.dimensions[arr[i]].label || FXmod.dimensions[arr[i]].code)
                    }
                    return ret
                }
			  
            if (opt.inputFormat == "fenixtool") {
              
                var lang = "EN";
                if (opt.lang) {lang = opt.lang;}
                var aggregations = [],
                    hidden = [],
                    columns = [],
                    rows = [],
                    values = [];

            
				
				console.log("initRow",opt)
				
                ret = {
                    "inputFormat": "fenixTool",
                    "aggregationFn": opt.aggregationFn || {"value": "sum"},
                    "aggregations": getListDim(opt.aggregations, opt, FXmod),
                    "hidden": getListDim(opt.hidden, opt, FXmod),
                    "columns": getListDim(opt.columns, opt, FXmod),
                    "values": opt.values||"value",
					"groupedRow": opt.groupedRow,
                    "rows":getListDim(opt.rows, opt, FXmod) ,
                    "formatter": opt.formatter || "value",
                    "showRowHeaders": opt.showRowHeaders || false,
                    "decimals": opt.decimals || 2,
                    "showCode": opt.showCode || false,
                    "showFlag": opt.showFlag || false,
                    "showUnit": opt.showUnit || false
                };


            }
			if(ret.columns.length+ret.rows.length==0)
			{
					//console.log("FXmod",getDimension())
				ret.rows=getListDim(getDimension(),opt,FXmod)
				
			}
            return ret
        }

        function convertFX(FX, opt) {
            //console.log("FX", FX)
            var lang = "EN";
            if (opt && opt.hasOwnProperty("lang")) {
                lang = opt.lang;
            }
            var structInter = {dimensions: {}, values: {}}

            function setDimension(id, att, val, subject) {
                if (!structInter.dimensions[id]) {
                    structInter.dimensions[id] = {};
                }
                structInter.dimensions[id][att] = val;
                if (subject) {structInter.dimensions[id]["subject"] = subject;}
            }

            function setAttribute(id, att, val, subject) {
                if (!structInter.attribute[id]) {
                    structInter.attribute[id] = {};
                }
                structInter.attribute[id][att] = val;
                if (subject) {
                    structInter.attribute[id]["subject"] = subject;
                }
            }

            function setValue(id, att, val) {
                if (!structInter.values[id]) {
                    structInter.values[id] = {};
                }
                if (att != "attribute") {
                    structInter.values[id][att] = val;
                }
                else {
                    if (!structInter.values[id]["attributes"]) {
                        structInter.values[id]["attributes"] = [];
                    }
                    structInter.values[id]["attributes"].push(val);
                }
            }

            for (var i in FX.columns) {
                var myColumns = FX.columns[i];
                if (myColumns.key == true) {//c est le code
                    setDimension(myColumns.id, "title", myColumns.title[lang] || myColumns.id);
                    setDimension(myColumns.id, "code", myColumns.id, myColumns.subject);
                }
                else if (myColumns.id.split("_" + lang).length == 2) {//label
                    setDimension(myColumns.id.split("_" + lang)[0], "label", myColumns.id)
                    /*	if(!structInter.dimensions[myColumns.id.split("_" + lang)[0]]){
                     setDimension(myColumns.id, "title", myColumns.id.split("_" + lang)[0]);
                     setDimension(myColumns.id, "code",myColumns.id.split("_" + lang)[0]);}*/
                }
                else if (myColumns.dataType == "number" && myColumns.subject == "value") {
                    setValue(myColumns.id, "value", myColumns.id);
                    setValue(myColumns.id, "label", myColumns.id);
                    setValue(myColumns.id, "subject", myColumns.subject);
                }
                else if (myColumns.id.split("|*").length == 2) {//attribut d une valeur X
                    if (myColumns.subject == "um") {
                        setValue(myColumns.id.split("|*")[0], "unit", myColumns.id)
                    }
                    else if (myColumns.subject == "flag") {
                        setValue(myColumns.id.split("|*")[0], "flag", myColumns.id);
                    }
                    else {
                        setValue(myColumns.id.split("|*")[0], "attributes", myColumns.id);
                    }
                }
                else {//attribut de value
                    if (myColumns.subject == "um") {
                        setValue("value", "unit", myColumns.id);
                    }
                    else if (myColumns.subject == "flag") {
                        setValue("value", "flag", myColumns.id);
                    }
                    else {
                        // setDimension(myColumns.id, "label", myColumns.title[lang]||myColumns.id);
                        //  setDimension(myColumns.id, "code", myColumns.id, myColumns.subject);

                        //setAttribute(myColumns.id, "id", myColumns.id)

                        setValue("value", "attribute", myColumns.id)
                    }
                }
            }
//			for()
            //console.log("structInter", structInter)
            return structInter;
        }

        function convertFXDirty(FX, opt) {
            //console.log("FXDIRTY ",FX);
            var structInter = {dimensions: {}, values: {}, attributes: {}}
            var structDirty = {};

            var lang = "EN";
            if (opt && opt.lang) {
                lang = opt.lang;
            }

            function setDirty(id, field, val) {
                if (!structDirty[id]) {
                    structDirty[id] = {};
                }
                if (field == "attributes") {
                    if (structDirty[id][field]) {
                        structDirty[id][field].push(val);
                    }
                    else {
                        structDirty[id][field] = [val];
                    }

                }
                else {
                    structDirty[id][field] = val;
                }
            }

            for (var i in FX.columns) {
                var myColumns = FX.columns[i];
                if (myColumns.key == true) {//c est le code
                    setDirty(myColumns.id, "code", myColumns.id);
                    setDirty(myColumns.id, "title", myColumns.title[lang] || myColumns.id);
                    setDirty(myColumns.id, "type", "dimension");
                    if (myColumns.subject) {
                        setDirty(myColumns.id, "subject", myColumns.subject);
                    }

                    /*setDimension(myColumns.id, "title", myColumns.title[lang]||myColumns.id);
                     setDimension(myColumns.id, "code", myColumns.id, myColumns.subject);*/
                }
                else if (myColumns.id.split("_" + lang).length == 2) {//label
                    setDirty(myColumns.id.split("_" + lang)[0], "label", myColumns.id);

                    //setDimension(myColumns.id.split("_" + lang)[0], "label", myColumns.id)

                }
                else if (myColumns.dataType == "number" && myColumns.subject == "value") {

                    setDirty(myColumns.id.toLowerCase(), "type", "value");
                    setDirty(myColumns.id.toLowerCase(), "value", myColumns.id);
                    setDirty(myColumns.id.toLowerCase(), "title", myColumns.id);
                    if (myColumns.subject) {
                        setDirty(myColumns.id.toLowerCase(), "subject", myColumns.subject);
                    }
                }
                else if (myColumns.id.split("|*").length == 2) {//attribut d une valeur X
                    if (myColumns.subject == "um") {
                        setDirty(myColumns.id.split("|*")[0], "unit", myColumns.id);
                    }
                    else if (myColumns.subject == "flag") {
                        setDirty(myColumns.id.split("|*")[0], "flag", myColumns.id);
                    }
                    else {
                        setDirty(myColumns.id.split("|*")[0], "attributes", myColumns.id);
                    }
                }
                else {//attribut de value
                    if (myColumns.subject == "um") {
                        //setValue("value", "unit", myColumns.id);
                        setDirty(myColumns.id, "type", "attribute");
                        setDirty(myColumns.id, "value", myColumns.id);
                        setDirty(myColumns.id, "title", myColumns.title[lang] || myColumns.id);
                        if (myColumns.subject) {
                            setDirty(myColumns.id, "subject", myColumns.subject);
                        }


                        //
                        setDirty("value", "unit", myColumns.id)
                    }
                    else if (myColumns.subject == "flag") {
                        //setValue("value", "flag", myColumns.id);
                        setDirty("value", "flag", myColumns.id)

                    }
                    else {
                        //// setDimension(myColumns.id, "label", myColumns.title[lang]||myColumns.id);
                        ////  setDimension(myColumns.id, "code", myColumns.id, myColumns.subject);
                        ////setAttribute(myColumns.id, "id", myColumns.id)

                        //setValue("value", "attribute", myColumns.id)
                        setDirty(myColumns.id, "type", "attribute");
                        setDirty(myColumns.id, "value", myColumns.id);
                        setDirty(myColumns.id, "title", myColumns.title[lang] || myColumns.id);
                        if (myColumns.subject) {
                            setDirty(myColumns.id, "subject", myColumns.subject);
                        }

                    }
                }
            }
            //console.log("FXDIRTY interm ",JSON.stringify(structDirty));
            for (var i in structDirty) {
                if (structDirty[i].type == "dimension") {
                    structInter.dimensions[i] = structDirty[i];
                }
                else if (structDirty[i].type == "value") {
                    structInter.values[i] = structDirty[i];
                }
                else {
                    structInter.attributes[i] = structDirty[i];
                }

            }	//console.log("structInterDirty",structDirty,"structInter",structInter);
            //console.log("FXDIRTY return ",structInter);

            return structInter;
        }


        function initFXT(FX, opt) {//for Toolbar

            // var FXmodold = convertFX(FX, opt);
            var FXmodnew = convertFXDirty(FX, opt);

            FXmod = FXmodnew;

            var hidden = [];
            var columns = [];
            var rows = [];
            var aggregations = [];
            var values = [];

            for (var i in FXmod.dimensions) {
                if (FXmod.dimensions[i].subject == "time") {
                    columns.push({value: FXmod.dimensions[i].code, label: FXmod.dimensions[i].title});
					
					
                }
                else {
                    rows.push({value: FXmod.dimensions[i].code, label: FXmod.dimensions[i].title});
                }
            }

            for (var i in FXmod.values) {
                values.push({value: FXmod.values[i].value, label: FXmod.values[i].title});
            }
            for (var i in FXmod.attributes) {

                aggregations.push({value: FXmod.attributes[i].value, label: FXmod.attributes[i].title});
            }

            var retObj = {
                hidden: hidden,
                rows: rows,
                columns: columns,
                aggregations: aggregations,
                values: values
            }
 //           console.log(retObj)
            return retObj;
        }

        function initFXD(FX, opt) {//for Data
          /*  var FXmod = convertFX(FX, opt);
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
                    if (opt.showUnit == true && FXmod.values[i].unit) {
                        values.push(FXmod.values[i].unit);
                    }
                    if (opt.showFlag == true && FXmod.values[i].flag) {
                        values.push(FXmod.values[i].flag);
                    }
                    for (var h in FXmod.values[i].attribute) {
                        hidden.push(FXmod.values[i].attribute[h])
                    }

                }
            }
            var retObj = {
                hidden: hidden,
                rows: rows,
                columns: columns,
                aggregations: aggregations,
                values: values
            }
            return retObj;*/
        }

        function initFXDgraph(FX, opt) {//for Data for chart
          /*  var FXmod = convertFX(FX, opt);
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
                    if (opt.showCode == true && FXmod.dimensions[i].label != FXmod.dimensions[i].code && FXmod.dimensions[i].label != null) {
                        x.push(FXmod.dimensions[i].code);
                    }
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
                    for (var h in FXmod.values[i].attribute) {
                        hidden.push(FXmod.values[i].attribute[h])
                    }

                }


            }


            var retObj = {
                hidden: hidden,
                series: series,
                x: x,
                aggregations: aggregations,
                y: y
            }
            return retObj;*/
        }

        function toFilter(model,opt) {

            var fxt = initFXT(model.metadata.dsd);

			
			var groupName= {
                                rows: "Rows",
                                columns: "Columns",
                                hidden :"Hidden",
                                aggregations: "Aggregation",
                                values: "Values"
                            }
							if(opt){ groupName= {
                                rows: opt.rowLabel||"Rows",
                                columns:opt.columnsLabel|| "Columns",
                                hidden:opt.hiddenLabel|| "Hidden",
                                aggregations:opt.aggregationsLabel|| "Aggregation",
                                values:opt.valuesLabel|| "Values"
                            }}
			
			
			
            var configuration = {

                dimension_sort: {
                    selector: {
                        id: "sortable",
                        source: [],
                        config: { //SortableJS configuration
                            //disabled: true
                            groups: groupName
                        }
                    },

                    template: {
                        //"hideHeader": true,
                        hideSwitch: true,
                        hideRemoveButton: true,
                        title: "Sort dimension"
                    }
                },
                aggregator_value: {
                    selector: {
                        id: 'dropdown',
                        source: [
                            {value: "sum", label: "Sum"},
                            {value: "avg", label: "avg"},
                            {value: "median", label: "median"},
                            {value: "stdev", label: "stdev"},
                            {value: "count", label: "count"},
                            {value: "concat", label: "concat"},
                            /*
                             avg:function(cell,format,nbDec){var a= jStat(cell);return format(a.mean(),nbDec)},
                             median:function(cell,format,nbDec){var a= jStat(cell);return format(a.median(),nbDec)},
                             stdev:function(cell,format,nbDec){var a= jStat(cell);return format(a.stdev(),nbDec)},
                             count:function(cell,format,nbDec){var a= cell;return format(a.length,nbDec)},
                             concat

                             */
                        ],
                        config: {maxItems: 1},
                        default: ['sum']
                    },

                    template: {
                        title: "Aggregator for Value"
                    }
                }
            };

            var aggregations = _.map(fxt.aggregations, function (item) {
                    item.parent = "aggregations";
                    return item
                }),
                columns = _.map(fxt.columns, function (item) {
                    item.parent = "columns";
                    return item
                }),
                rows = _.map(fxt.rows, function (item) {
                    item.parent = "rows";
                    return item
                }),
                hidden = _.map(fxt.hidden, function (item) {

                    item.parent = "hidden";
                    return item
                }),
                values = _.map(fxt.values, function (item) {
                    item.parent = "values";
                    return item
                });

            configuration.dimension_sort.selector.source = _.union(aggregations, hidden, columns, rows, values);

            return configuration

        }

        function toChartConfig(values) {
            var hidden = [];
            var x = [];
            var series = [];
            var aggregations = [];
            var y = [];
            var type = Array.isArray(values.values.typeOfChart) ? values.values.typeOfChart[0] : "line";
            var aggValue = {
                value: values.values.aggregator_value[0],
                Value: values.values.aggregator_value[0],
                VALUE: values.values.aggregator_value[0]
            };

            //convert to chart creator configuration here
            var opt = {x: {}, y: {}, series: {}, showUnit: false, showCode: false, showFlag: false};
            for (var i in values.values.show) {
                var t = values.values.show[i];
                if (t == "code") {
                    opt.showCode = true;
                }
                else if (t == "unit") {
                    opt.showUnit = true;
                }
                else if (t == "flag") {
                    opt.showFlag = true;
                }
            }
            for (var i in values.values.dimension_sort) {
                var t = values.values.dimension_sort[i];
                if (t.parent == "rows") {
                    opt.series[t.value] = true
                }
                else if (t.parent == "columns") {
                    opt.x[t.value] = true
                }
                else if (t.parent == "values") {
                    opt.y[t.value] = true
                }
                else if (t.parent == "hidden") {/* to decide what we want to do*/
                }
            }


           // for (var i in FXmod.dimensions) {
 for (var ii in values.values.dimension_sort) {
			   var i=values.values.dimension_sort[ii].value;
			           
			 if (FXmod.dimensions[i] && opt.series[FXmod.dimensions[i].code]) {
                    series.push(FXmod.dimensions[i].label || FXmod.dimensions[i].code)
                    if (opt.showCode == true && FXmod.dimensions[i].label != FXmod.dimensions[i].code && FXmod.dimensions[i].label != null) {
                        series.push(FXmod.dimensions[i].code)
                    }
                }
                if (FXmod.dimensions[i] && opt.x[FXmod.dimensions[i].code]) {
                    x.push(FXmod.dimensions[i].label || FXmod.dimensions[i].code)
                    if (opt.showCode == true && FXmod.dimensions[i].label != FXmod.dimensions[i].code && FXmod.dimensions[i].label != null) {
                        x.push(FXmod.dimensions[i].code);
                    }
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
                    for (var h in FXmod.values[i].attribute) {
                        hidden.push(FXmod.values[i].attribute[h])
                    }
                }
            }
            for (var i in FXmod.attributes) {

                if (opt.y[FXmod.attributes[i].value]) {
                    y.push(FXmod.attributes[i].value);
                }
                else if (opt.x[FXmod.attributes[i].value]) {
                    x.push(FXmod.attributes[i].value);
                }
                else if (opt.series[FXmod.attributes[i].value]) {
                    series.push(FXmod.attributes[i].value);
                }
            }


            var retObj = {
                aggregationFn: aggValue,
                formatter: "value",
                decimals: 2,
                hidden: hidden,
                series: series,
                x: x,
                aggregations: aggregations,
                y: y,
                type: type
            };

            return retObj;


        }

        function toTableConfig(values) {
			//console.log("toTableValue",values)
            var hidden = [];
            var x = [];
            var series = [];
            var aggregations = [];
            var y = [];
            var formatter = values.values.format[0];
			//console.log("values",values)
			var groupedRow = true;
		if(values.values.hasOwnProperty("groupedRow")) { values.values.groupedRow.length>0?groupedRow=true:groupedRow=false}
//console.log("values",values)
            var aggValue = {value: values.values.aggregator_value[0], Value: values.values.aggregator_value[0]}
            //convert to chart creator configuration here
            var opt = {x: {}, y: {}, series: {}, showUnit: false, showCode: false, showFlag: false};
            for (var i in values.values.show) {
                var t = values.values.show[i];
                if (t == "code") {opt.showCode = true;}
                else if (t == "unit") {opt.showUnit = true;}
                else if (t == "flag") {opt.showFlag = true;}
            }

//console.log(" values.values.dimension_sort", values.values.dimension_sort)
            for (var i in values.values.dimension_sort) {
                var t = values.values.dimension_sort[i];
                if (t.parent == "rows") {opt.series[t.value] = true;}
                else if (t.parent == "columns") {opt.x[t.value] = true;}
                else if (t.parent == "values") {opt.y[t.value] = true;}
                else if (t.parent == "hidden") {/* to decide what we want to do*/
                }
            }

            //console.log("FXmod", FXmod)
           // for (var i in FXmod.dimensions) { 
		   for (var ii in values.values.dimension_sort) {
			   var i=values.values.dimension_sort[ii].value;
                if (FXmod.dimensions[i] && opt.series[FXmod.dimensions[i].code]) { 
				series.push(FXmod.dimensions[i].label || FXmod.dimensions[i].code)
                  
                    if (/*opt.showCode == true &&*/ FXmod.dimensions[i].label != FXmod.dimensions[i].code && FXmod.dimensions[i].label != null) {
                        series.push(FXmod.dimensions[i].code);
						if (opt.showCode == false){ hidden.push(FXmod.dimensions[i].code);}
                    }
					else{}
                }
                if (FXmod.dimensions[i] && opt.x[FXmod.dimensions[i].code]) {
                    x.push(FXmod.dimensions[i].label || FXmod.dimensions[i].code)
                    if (/*opt.showCode == true &&*/ FXmod.dimensions[i].label != FXmod.dimensions[i].code && FXmod.dimensions[i].label != null) {
                        x.push(FXmod.dimensions[i].code);
						if (opt.showCode == false){ hidden.push(FXmod.dimensions[i].code);}
                    }else{}
                }
                if (FXmod.dimensions[i] && opt.y[FXmod.dimensions[i].code]) {
                    y.push(FXmod.dimensions[i].code);
                }else{ 
				
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
                    for (var h in FXmod.values[i].attribute) {
                        hidden.push(FXmod.values[i].attribute[h])
                    }
                }
            }

            for (var i in FXmod.attributes) {

                if (opt.y[FXmod.attributes[i].value]) {
                    y.push(FXmod.attributes[i].label || FXmod.attributes[i].value);
                }
                else if (opt.x[FXmod.attributes[i].value]) {
                    x.push(FXmod.attributes[i].label || FXmod.attributes[i].value);
                }
                else if (opt.series[FXmod.attributes[i].value]) {
                    series.push(FXmod.attributes[i].label || FXmod.attributes[i].value);
                }
            }


            var retObj = {groupedRow:groupedRow,
                aggregationFn: aggValue,
                formatter: formatter,
                decimals: values.values.decimal_digit||2,
                showRowHeaders: true,
                hidden: hidden,
                rows: series,
                columns: x,
                aggregations: aggregations,
                values: y
            }
			//console.log("rest",retObj)
            return retObj;


        }

        return function () {
            return {
                convertFX: convertFX,
                initFXT: initFXT,
                initFXD: initFXD,
                initFXDgraph: initFXDgraph,
                parseInput: parseInput,
                toFilter: toFilter,
                toChartConfig: toChartConfig,
                toTableConfig: toTableConfig
            }
        };
    }
);