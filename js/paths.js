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
            jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
            amplify: "//fenixapps.fao.org/repository/js/amplify/1.1.2/amplify.min",
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
