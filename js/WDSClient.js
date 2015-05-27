/*global define*/
define([
    'jquery'
], function ($) {

    'use strict';

    var defaultOpts = {
        serviceUrl: 'http://faostat3.fao.org/wds/rest/table/json',
        datasource: 'demo_fenix',
		queryTmpl: '',
		queryVars: null,
		outputType: 'array'	//array | object
    };

    function _template(str, data) {
        return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
            return data[key] || '';
        });
    }

    function wdsClient(config) {

        this.opts = $.extend({
            serviceUrl: defaultOpts.serviceUrl,
            datasource: defaultOpts.datasource,
            thousandSeparator: ',',
            decimalSeparator: '.',
            decimalNumbers: 2,
            cssFilename: '',
            nowrap: false,
            valuesIndex: 0,
            json: JSON.stringify({query: ''})
        }, config);

        return this;
    }

    wdsClient.prototype.query = function ( conf ) {

        var ret,
            data = this.prepareDataForRequest(conf);

        if ($.isFunction(conf.success)) {
            ret = $.ajax({
                url: this.opts.serviceUrl,
                data: data,
                type: 'POST',
                dataType: 'JSON',
                success: conf.success,
                error: conf.error,
                always: conf.always
            });
        } else {

            $.ajax({
                async: false,
                url: this.opts.serviceUrl,
                data: data,
                type: 'POST',
                dataType: 'JSON',
                success: function (resp) {
                    ret = resp;
                }
            });
        }

        return ret;
    };

    wdsClient.prototype.prepareDataForRequest = function (conf) {

        var sql = $.isPlainObject(conf.queryVars) ? _template(conf.queryTmpl, conf.queryVars) : conf.queryTmpl;

        if (this.opts.outputType === 'object'){

            return {
                datasource : this.opts.datasource,
                outputType : this.opts.outputType,
                query : sql
            };

        } else {

            return $.extend(true, this.opts, {
                json: JSON.stringify({query: sql})
            });
        }


    };

    wdsClient.prototype.create = function(config) {
        this.crud('POST', config);
    };

    wdsClient.prototype.retrieve = function(config) {
        this.crud('GET', config);
    };

    wdsClient.prototype.update = function(config) {
        this.crud('PUT', config);
    };

    wdsClient.prototype.delete = function(config) {
        this.crud('DELETE', config);
    };

    wdsClient.prototype.crud = function(http_method, config) {
        try {
            this.isValidConfiguration(config);
            $.ajax({
                type: http_method,
                url: this.opts.serviceUrl,
                data: {
                    payload: JSON.stringify(config.payload),
                    datasource: (config.datasource != undefined && config.datasource != null) ? config.datasource : this.opts.datasource,
                    collection: config.collection,
                    outputType: config.outputType
                },
                success: config.success,
                error: config.error,
                always: config.always
            });
        } catch (e) {
            config.error(e);
        }
    };

    wdsClient.prototype.isValidConfiguration = function(config) {
        if (config.payload == undefined || config.payload == null)
            throw 'Missing parameter "payload" in the configuration object.';
        if (config.datasource == undefined || config.datasource == null) {
            if (this.opts.datasource == undefined || this.opts.datasource == null)
                throw 'Missing parameter "datasource" in the default configuration and in the configuration object.';
        }
    };

    return wdsClient;

});