define([
    'loglevel',
    'underscore',
    'jquery',
    'fx-common/fx-upload-client'
], function (log, _, $, Uploader) {

    'use strict';

    var DEV_URL = 'http://168.202.28.32:8080/v1',
        DEV_CONTEXT = "test",
        s = {
            UPLOADER_CONTAINER: "#uploader-container",
            UPLOADER_AMIS: "#uploader-amis",
            SECTION: "section",
            DETAILS: "[data-details]"
        };

    function Test() {

    }

    Test.prototype.start = function () {

        log.trace("Test started");

        this._render();

        this._renderPolicy();

    };

    Test.prototype._render = function () {

        var config = {
            container: s.UPLOADER_CONTAINER,
            context: DEV_CONTEXT,
            server_url: DEV_URL,
            body_post_process : { key : "value"}
        };

        this._renderUploader(config);

    };

    Test.prototype._renderPolicy = function () {

        var config = {
            container: s.UPLOADER_AMIS,
            context: "policy",
            server_url: DEV_URL,
            body_post_process : { policy : 11}
        };

        this._renderUploader(config);

    };


    Test.prototype._renderUploader = function (config) {
        console.log("Before render 2")
        console.log(config)

        var uploader = new Uploader();

        uploader.render(config);

        this._printDetails(config);

        return uploader;
    };

    Test.prototype._printDetails = function (opts) {

        var $container =  $(opts.container).closest(s.SECTION).find(s.DETAILS);

        _.each(opts, function (obj, name) {

            $container.append("<dt>"+name+"</dt>");
            $container.append("<dd>"+JSON.stringify(obj)+"</dd>");

        });

    };

    return new Test();

});