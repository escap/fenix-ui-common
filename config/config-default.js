/*global define*/

define(function () {

    'use strict';

    var SERVER = 'http://fenix.fao.org/';

    return {

        SERVER: SERVER,
        SERVICE_PROVIDER : SERVER + "d3s_dev/",
        FIND_SERVICE : "msd/resources/find",
        CODELIST_SERVICE: 'msd/codes/filter',
        ENUMERATION_SERVICE: 'msd/choices/',
        PROCESSES_SERVICE : "processes/"

    }

});