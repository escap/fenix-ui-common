define(['jquery'], function ($) {

    'use strict';

    var defaultOpts = {
        serviceUrl: 'http://fenixapps2.fao.org/wds_5.1/rest/crud',
        datasource: 'demo_fenix',
		queryTmpl: '',
		queryVars: null,
		outputType: 'array',
		error: null,
		always: null,
		success: null
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
           //,wds_schema: $.parseJSON(wds_schema),
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
                error: conf.error || $.noop,
                always: conf.always || $.noop,
                success: conf.success || $.noop
            });
        } else {

            $.ajax({
                async: false,
                url: this.opts.serviceUrl,
                data: data,
                type: 'POST',
                dataType: 'JSON',
                error: conf.error || $.noop,                
                always: conf.always || $.noop,
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

    wdsClient.prototype.wdsclient = function(rest_service_name, parameters, callback, url_root) {

        /* Root URL. */
        var url = url_root != null ? url_root : this.CONFIG.wds_root;
        url += '/' + rest_service_name + '/';

        /* Load REST definition. */
        var rest_parameters = this.opts.wds_schema.properties[rest_service_name].properties;

        try {

            /* Check whether the CONFIG object contains all the required parameters for the REST. */
            this.check_parameters(parameters, rest_parameters);

            /* Create the URL by taking the parameters from the CONFIG object according to the JSON Schema definition. */
            for (var i = 0 ; i < Object.keys(rest_parameters).length ; i++)
                url += parameters[Object.keys(rest_parameters)[i]] + '/';

            /* Define the HTTP method, GET by default, */
            var method = this.opts.wds_schema.properties[rest_service_name].method;
            method = method != null ? method : 'GET';

            /* Call WDS. */
            $.ajax({

                type: method,
                url: url,

                success: function (response) {

                    /* Cast response to JSON, if needed. */
                    var json = response;
                    if (typeof json == 'string')
                        json = $.parseJSON(response);

                    /* Invoke user's callback. */
                    if (callback != null)
                        callback(json);

                },

                /* Default error handling. */
                error: function(a) {
                    alert(a.responseText);
                }

            });

        } catch (e) {

            alert(e);

        }

    };

    wdsClient.prototype.check_parameters = function(parameters, rest_parameters) {
        for (var i = 0 ; i < Object.keys(rest_parameters).length ; i++)
            if (parameters[Object.keys(rest_parameters)[i]] == undefined)
                throw translate.missing_parameter + Object.keys(rest_parameters)[i];
    };

    return wdsClient;

});