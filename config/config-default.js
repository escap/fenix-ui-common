/*global define*/

define(function () {

    'use strict';

    var SERVER = 'http://fenix.fao.org/';

    //http://fenixservices.fao.org/d3s/

    return {

        //Bridge
        SERVER: SERVER,
        SERVICE_PROVIDER : SERVER + "d3s_dev/",
        EXPORT_ACCESS_POINT :"/fenix/export",
        FIND_SERVICE : "msd/resources/find",
        CODELIST_SERVICE: 'msd/codes/filter',
        ENUMERATION_SERVICE: 'msd/choices/',
        PROCESSES_SERVICE : "processes/",
        METADATA_SERVICE : "msd/resources/metadata/",
        RESOURCES_SERVICE : "msd/resources/",

        //Grid
        FLUID_GRID_CONFIG : {
            drag: {
                handle: '[data-grid="fx-grid-item-handle"]'
            },
            config: {
                itemSelector: '[data-role="fx-grid-item"]',
                percentPosition: true,
                rowHeight: '[data-role="fx-grid-item"]'
            }
        },

        //Utils
        DEFAULT_PERIOD_FROM: 1960,
        DEFAULT_PERIOD_TO: 2016
    }
});