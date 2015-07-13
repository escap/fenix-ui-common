/*global define*/
define(function () {

    'use strict';

    var config = {

        paths : {
            'fx-common' : './',
            'fx-common/html' : '../html',
            'fx-common/config' : '../config',

            'fx-common/config/auth_users' : '../config/auth_users.json',

            // third party libs
            jquery:  "//fenixrepo.fao.org/cdn/js/jquery/2.1.1/jquery.min",
            amplify: "//fenixrepo.fao.org/cdn/js/amplify/1.1.2/amplify.min",
            faostat_commons : "FAOSTATCommons"
        },

        shim: {
             "amplify": {
                "deps": ["jquery"]
            }
        }
    };

    return config;
});
