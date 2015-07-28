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
            faostat_commons : "FAOSTATCommons",
            'q' : '{FENIX_CDN}/js/q/1.1.2/q',
            'SparkMD5' : '{FENIX_CDN}/js/spark-md5/spark-md5.min',
            //file upload
            'jquery.ui.widget' : '{FENIX_CDN}/js/jquery-file-upload/9.10.4/js/vendor/jquery.ui.widget',
            'jquery.fileupload' : '{FENIX_CDN}/js/jquery-file-upload/9.10.4/js/jquery.fileupload',
            'jquery.fileupload-ui' : '{FENIX_CDN}/js/jquery-file-upload/9.10.4/js/jquery.fileupload-ui',
            'jquery.iframe-transport' : '{FENIX_CDN}/js/jquery-file-upload/9.10.4/js/jquery.iframe-transport',
        },

        shim: {
             "amplify": {
                "deps": ["jquery"]
            },
            'jquery.fileupload': {
                deps: ["jquery", "jquery.ui.widget"]
            },
        }
    };

    return config;
});
