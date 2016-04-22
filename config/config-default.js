/*global define*/

define(function () {

    'use strict';

    var SERVER = 'http://fenix.fao.org/';

    return {

        //Bridge
        SERVER: SERVER,
        SERVICE_PROVIDER : SERVER + "d3s_dev/",
        FIND_SERVICE : "msd/resources/find",
        CODELIST_SERVICE: 'msd/codes/filter',
        ENUMERATION_SERVICE: 'msd/choices/',
        PROCESSES_SERVICE : "processes/",
        
        //Grid
        FLUID_GRID_CONFIG : {
            drag: {
                handle: '[data-role="fx-grid-item-handle"]'
            },
            config: {
                itemSelector: '[data-role="fx-grid-item"]',
                percentPosition: true,
                rowHeight: '[data-role="fx-grid-item"]'
            }
        }
    }
});