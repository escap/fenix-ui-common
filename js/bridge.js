/*global define*/
define([
    'fx-common/config/errors',
    'fx-common/config/events',
    'fx-common/config/config',
    'fx-common/config/config-default',
    'jquery',
    'underscore',
    'q',
    'loglevel'
], function (ERR, EVT, C, DC, $, _, Q, log) {

    'use strict';

    function Bridge() {

    }

    Bridge.prototype.find = function (obj) {

        var serviceProvider = obj.SERVICE_PROVIDER || C.SERVICE_PROVIDER || DC.SERVICE_PROVIDER,
            filterService = obj.FIND_SERVICE || C.FIND_SERVICE || DC.FIND_SERVICE,
            body = obj.body;

        return Q($.ajax({
            url: serviceProvider + filterService + this._parseQueryParams(obj.params),
            type: obj.type || "POST",
            contentType: obj.dataType || "application/json",
            data: JSON.stringify(body),
            dataType: obj.dataType || 'json'
        }));

    };

    Bridge.prototype.getEnumerationPromise = function (obj) {

        var serviceProvider = obj.serviceProvider || C.SERVICE_PROVIDER || DC.SERVICE_PROVIDER,
            enumerationService = obj.enumerationService || C.ENUMERATION_SERVICE || DC.ENUMERATION_SERVICE;

        return Q($.ajax({
            url: serviceProvider + enumerationService + obj.uid,
            type: obj.type || "GET",
            dataType: obj.dataType || 'json'
        }));
    };

    Bridge.prototype.getCodeListPromise = function (obj) {

        var serviceProvider = obj.serviceProvider || C.SERVICE_PROVIDER || DC.SERVICE_PROVIDER,
            codeListService = obj.codeListService || C.CODELIST_SERVICE || DC.CODELIST_SERVICE;

        return Q($.ajax({
            url: serviceProvider + codeListService + this._parseQueryParams(obj.params),
            type: obj.type || "POST",
            dataType: obj.dataType || 'json',
            contentType: obj.contentType || "application/json",
            data: JSON.stringify(obj.body)
        }));

    };

    Bridge.prototype.getProcessedResourcePromise = function (obj) {

        var serviceProvider = obj.serviceProvider || C.SERVICE_PROVIDER || DC.SERVICE_PROVIDER,
            processesService = obj.processesService || C.PROCESSES_SERVICE || DC.PROCESSES_SERVICE;

        return Q($.ajax({
            url: serviceProvider + processesService + this._parseUidAndVersion(obj) + this._parseQueryParams(obj.params),
            type: obj.type || "POST",
            dataType: obj.dataType || 'json',
            contentType: obj.contentType || "application/json",
            data: JSON.stringify(obj.body)
        }));

    };

    Bridge.prototype.all = function (promises) {

        return Q.all(promises);
    };

    Bridge.prototype._parseQueryParams = function (params) {

        if (!params) {
            return '';
        }

        var result = '?';

        _.each(params, function (value, key) {
            result += key + '=' + value + '&'
        });

        return result.substring(0, result.length - 1);

    };

    Bridge.prototype._parseUidAndVersion = function (params) {

        var result = '';

        if (!params.uid) {
            log.warn("Impossible to find uid")
        }

        result = result.concat(params.uid);

        if (params.version) {
            result = result.concat("/").concat(params.version);
        }

        return result;

    };

    return new Bridge();

});