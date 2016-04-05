/*global requirejs, define*/
define([
    'loglevel',
    'fx-common/pivotator/start',
    'fx-common/pivotator/functions',
    'test/models/data'
], function (log, Pivotator, PivotatorFunctions, Model) {

    'use strict';

    function Test() { }

    Test.prototype.start = function () {

        log.trace("Test started");

        this._printDependencies();

    };

    Test.prototype._printDependencies = function () {

       var myPivot=new Pivotator();
        console.log(myPivot);
        log.info(Pivotator);
        log.info(PivotatorFunctions);
        log.info(Model);
    };

    return new Test();
});
