/*global define*/
define(function () {

    var config = {

        paths : {
            'fx-common' : './',
            // third party libs
            jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
            amplify: "//fenixapps.fao.org/repository/js/amplify/1.1.2/amplify.min"
        },

        shim: {
             "amplify": {
                "deps": ["jquery"]
            }
        }
    };

    return config;
});
