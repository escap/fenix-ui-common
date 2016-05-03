/*global requirejs, define*/
define([
    'loglevel',
    'fx-common/pivotator/start',
    'fx-common/pivotator/functions',
    'test/models/data',
	'test/js/toolbar',
	'fenixtool'
], function (log, Pivotator, PivotatorFunctions, Model,ToolBar,fenixTool) {

    'use strict';

    function Test() { }

    Test.prototype.start = function () {

        log.trace("Test started");

        this._printDependencies();

    };

    Test.prototype._printDependencies = function () {

       var myPivot=new Pivotator();
	/*var ft=new fenixTool();
	 ft.initFX();
	 alert('ij')
*/
/*toolbar*/
	  var myToolbar=new ToolBar();
	   
	    myToolbar.init("toolbar", Model.metadata.dsd, {
            onchange: function () {
                var optGr = myToolbar.getConfigCOLROW(Model);
                console.log("optGr",optGr);
				optGr["fulldataformat"]=false;
				optGr["showunit"]=false;
				optGr["showAtt"]=false;
				optGr["showCode"]=false;
                //console.log("toPivotData",myPivot.toPivotData(Model,optGr));
                //console.log("ToFX",myPivot.toFX(Model,optGr));

                console.log("toFXJson",myPivot.toFXJson(Model,optGr));
            }
            , lang: "EN", nbDecimal: 2
        });
        myToolbar.display();
		/**/
		console.log("Model",Model)
		 var optGr = myToolbar.getConfigCOLROW(Model);
		optGr["fulldataformat"]=false;
				optGr["showunit"]=false;
				optGr["showAtt"]=false;
				optGr["showCode"]=false;	
				console.log("optGr",optGr);

		 console.log("MODEL : FX initial",Model);
		  //console.log("toPivotData",myPivot.toPivotData(Model,optGr));
        //console.log("ToFX",myPivot.toFX(Model,optGr));
		 
		  console.log("toFXJson",optGr,myPivot.toFXJson(Model,optGr));
		
      //  log.info(Pivotator);
        //log.info(PivotatorFunctions);
        //log.info(Model);
    };

    return new Test();
});
