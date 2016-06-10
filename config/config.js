/*global define*/
define(function () {

    'use strict';

    var serverDevelop = '//fenix.fao.org/',
        serverProduction = '//fenixservices.fao.org/';

    return {

        //Bridge
        serviceProviderProduction : serverProduction + "d3s/",
        serviceProviderDevelop : serverDevelop + "d3s_dev/",
        exportService :"/fenix/export",
        findService : "msd/resources/find",
        codelistService: 'msd/codes/filter',
        enumerationService: 'msd/choices/',
        processesService : "processes/",
        metadataService : "msd/resources/metadata/",
        resourcesService : "msd/resources/",

        //Grid
        fluidGridConfig : {
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
        defaultPeriodFrom: 2000,
        defaultPeriodTo: 2016,

        cache : true
    }
});