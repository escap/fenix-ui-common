define(['jquery'], function($) {

    'use strict';

    var defaultOpts = {
    	serviceUrl: 'http://faostat3.fao.org/wds/rest/table/json',
    	datasource: 'demo_fenix'
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

    wdsClient.prototype.query = function(queryTmpl, queryVars, callback) {

		var ret,
			sql = $.isPlainObject(queryVars) ? _template(queryTmpl, queryVars) : queryTmpl,
			data = $.extend(this.opts, {
				json: JSON.stringify({query: sql})
			});

		if($.isFunction(callback))
			ret = $.ajax({
				url: this.opts.serviceUrl,
				data: data,
				type: 'POST',
				dataType: 'JSON',
				success: callback
			});
		else
			$.ajax({
				async: false,
				url: this.opts.serviceUrl,
				data: data,
				type: 'POST',
				dataType: 'JSON',
				success: function(resp) {
					ret = resp;
				}
			});

		return ret;
	};

	return wdsClient;
});