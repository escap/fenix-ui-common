/*global define*/
define([
    'jquery',
    'underscore',
    'handlebars',
    'text!fx-common/html/fenix-uploader-template.hbs',
    'q',
    'SparkMD5',
    'jquery.fileupload'
], function ($, _, Handlebars, uploadTemplate, Q, SparkMD5) {

    'use strict';

    var defaultOpts = {
            upload_accept: '.csv',
            server_url: 'http://fenixservices.fao.org/upload',
            context: "c",
            autoClose: true,
            chunkSize: 100000,
            maxRetry: 100,
            retryTimeout: 500
        },
        s = {
            UPLOADER: '#fx-uploader',
            INPUT: '#fx-uploader-input',
            SUBMIT: '#fx-uploader-submit',
            DELETE: '#fx-uploader-delete',
            PROGRESS_BAR: '#progress .bar',
            EXTENDED_INFO: '#fx-uploader-extended-info'
        };

    /**
     * Fenix Uploader Client constructor
     * @param {Object} opts Initialization options
     * @return {Object} Fenix Uploader instance
     */
    function FxUploader(opts) {

        this.o = $.extend(true, {}, defaultOpts, opts);

        this.current = {};

        return this;
    }

    /**
     * Compile and inject the Fenix Upload Client HTML template
     * @return {JQuery} Fenix Upload Client container
     */
    FxUploader.prototype._injectTemplate = function () {

        var template = Handlebars.compile(uploadTemplate),
            result = template(this.o);

        return this.$el.html(result);
    };

    /**
     * Cache jQuery selectors
     * @return {undefined}
     */
    FxUploader.prototype._initVariables = function () {

        this.$input = this.$el.find(s.INPUT);

        this.$submit = this.$el.find(s.SUBMIT);

        this.$delete = this.$el.find(s.DELETE);

        this.$uploader = this.$el.find(s.UPLOADER);

        this.$progressBar = this.$el.find(s.PROGRESS_BAR);

        this.$extendedInfo = this.$el.find(s.EXTENDED_INFO);

    };

    /**
     * Init internal components
     * @return {undefined}
     */
    FxUploader.prototype._initUploader = function () {

        var self = this;

        this.$uploader.fileupload({

            maxChunkSize: this.o.chunkSize,

            multipart: false,

            //autoUpload: false,

            singleFileUploads: true,

            sequentialUploads: true,

            done: _.bind(this._onTransferComplete, this),

            progressall: _.bind(this._onProgressAll, this),

            progress: _.bind(this._onProgress, this),

            /*
             maxRetries: this.o.maxRetries,

             retryTimeout: this.o.retryTimeout,

             add: function (e, data) {

             self._getFileMetadata().then(function (result) {
             var file = result.file;
             console.log(file)
             data.uploadedBytes = file && file.size;
             $.blueimp.fileupload.prototype.options.add.call(that, e, data);
             });
             },

             fail: function (e, data) {

             // jQuery Widget Factory uses "namespace-widgetname" since version 1.10.0:
             var fu = $(this).data('blueimp-fileupload') || $(this).data('fileupload'),
             retries = data.context.data('retries') || 0,
             retry = function () {

             self._getFileMetadata().then(function (result) {
             var file = result.file;
             data.uploadedBytes = file && file.size;
             // clear the previous data:
             data.data = null;
             data.submit();
             }, function () {
             fu._trigger('fail', e, data);
             });
             };

             if (data.errorThrown !== 'abort' &&
             data.uploadedBytes < data.files[0].size &&
             retries < fu.options.maxRetries) {
             retries += 1;
             data.context.data('retries', retries);
             window.setTimeout(retry, retries * fu.options.retryTimeout);
             return;
             }
             data.context.removeData('retries');
             $.blueimp.fileupload.prototype.options.fail.call(this, e, data);
             }
             */


        });

    };

    /**
     * Render the Fenix Upload Client
     * @param {Object} opts Initialization options
     * @return {Object} Fenix Uploader instance
     */
    FxUploader.prototype.render = function (opts) {

        $.extend(true, this.o, opts);

        this._validate();

        this.$el = $(this.o.container);

        this._injectTemplate();

        this._initVariables();

        this._initUploader();

        this._bindEventListeners();

        return this;

    };

    /**
     * Input validation function.
     * TODO to be implemented
     * @return {Object} errors
     */
    FxUploader.prototype._validate = function () {

        var errors;

        return errors;

    };

    /**
     * Contains the sequence of operations to perform
     * to transfer a file
     * @return {undefined}
     */
    FxUploader.prototype._uploadFile = function () {

        var self = this;

        this._createCurrentFileInfo();

        this._createFileMetadata()
            .then(function () {

                console.log("File Metadata: created.");

                self.$delete.prop('disabled', false);

                return self._transferFile();

            });
    };

    /**
     * Create current file info as 'context' and 'autoClose'.
     * MD5 is already calculated.
     * @return {Object} The current file info
     */
    FxUploader.prototype._createCurrentFileInfo = function () {

        this.current.context = this.o.context;

        this.current.autoClose = this.o.autoClose;

        return this.current;
    };

    /**
     * Get file metadata
     * @return {Promise}
     */
    FxUploader.prototype._getFileMetadata = function () {

        return Q($.ajax({
            type: "GET",
            url: this.o.server_url + '/metadata/file/' + this.o.context + '/' + this.current.md5,
            contentType: "application/json"
        }));

    };

    /**
     * Create file metadata
     * @return {Promise}
     */
    FxUploader.prototype._createFileMetadata = function () {

        return Q($.ajax({
            type: "POST",
            url: this.o.server_url + "/metadata/file",
            contentType: "application/json",
            data: JSON.stringify({
                "context": this.current.context,
                "md5": this.current.md5,
                "autoClose": this.current.autoClose
            })
        }));

    };

    /**
     * Delete file metadata
     * @return {Promise}
     */
    FxUploader.prototype._deleteFileMetadata = function () {

        return Q($.ajax({
            type: "DELETE",
            url: this.o.server_url + '/file/' + this.o.context + '/' + this.current.md5,
            contentType: "application/json"
        }));

    };

    /**
     * Send sequentially file's chunks and update the progress bar
     * @return {undefined}
     */
    FxUploader.prototype._transferFile = function () {

        this.$uploader.fileupload('option', {
            url: this.o.server_url + '/file/chunk/' + this.o.context + '/' + this.current.md5
        });

        this.$uploader.fileupload('add', {files: this.current.files});
    };

    /**
     * Handler for global progress Transfer graphical feedback
     * @return {Number} progress
     */
    FxUploader.prototype._onProgressAll = function (e, data) {

        var progress = parseInt(data.loaded / data.total * 100, 10);

        this.$progressBar.css('width', progress + '%');

        return progress;
    };

    /**
     * Handler for progress Transfer graphical extended progress information
     * @return {undefined}
     */
    FxUploader.prototype._onProgress = function (e, data) {

        this.$extendedInfo.html(this._renderExtendedProgress(data))

    };

    FxUploader.prototype._renderExtendedProgress = function (data) {
        return this._formatBitrate(data.bitrate) + ' | ' +
            this._formatTime(
                (data.total - data.loaded) * 8 / data.bitrate
            ) + ' | ' +
            this._formatPercentage(
                data.loaded / data.total
            ) + ' | ' +
            this._formatFileSize(data.loaded) + ' / ' +
            this._formatFileSize(data.total);
    };

    FxUploader.prototype._formatBitrate = function (bits) {
        if (typeof bits !== 'number') {
            return '';
        }
        if (bits >= 1000000000) {
            return (bits / 1000000000).toFixed(2) + ' Gbit/s';
        }
        if (bits >= 1000000) {
            return (bits / 1000000).toFixed(2) + ' Mbit/s';
        }
        if (bits >= 1000) {
            return (bits / 1000).toFixed(2) + ' kbit/s';
        }
        return bits.toFixed(2) + ' bit/s';
    };

    FxUploader.prototype._formatTime = function (seconds) {
        var date = new Date(seconds * 1000),
            days = Math.floor(seconds / 86400);
        days = days ? days + 'd ' : '';
        return days +
            ('0' + date.getUTCHours()).slice(-2) + ':' +
            ('0' + date.getUTCMinutes()).slice(-2) + ':' +
            ('0' + date.getUTCSeconds()).slice(-2);
    };

    FxUploader.prototype._formatPercentage = function (floatValue) {
        return (floatValue * 100).toFixed(2) + ' %';
    };

    FxUploader.prototype._formatFileSize = function (bytes) {
        if (typeof bytes !== 'number') {
            return '';
        }
        if (bytes >= 1000000000) {
            return (bytes / 1000000000).toFixed(2) + ' GB';
        }
        if (bytes >= 1000000) {
            return (bytes / 1000000).toFixed(2) + ' MB';
        }
        return (bytes / 1000).toFixed(2) + ' KB';
    };

    FxUploader.prototype._formatFileInfo = function (file) {
        if (typeof bytes !== 'number') {
            return '';
        }
        if (bytes >= 1000000000) {
            return (bytes / 1000000000).toFixed(2) + ' GB';
        }
        if (bytes >= 1000000) {
            return (bytes / 1000000).toFixed(2) + ' MB';
        }
        return (bytes / 1000).toFixed(2) + ' KB';
    };

    /**
     * Handler for Transfer end
     * @return {undefined}
     */
    FxUploader.prototype._onTransferComplete = function () {

        console.log("Trans complete")

        this.$submit.prop('disabled', true);

    };

    /**
     * Create MD5 of
     * @param {File} [f] File whose calculate the MD5
     * @return {Promise}
     */
    FxUploader.prototype.createFileMD5 = function (f) {

        var self = this,
            blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
            file = f || this.current.files[0],
            chunkSize = this.o.chunkSize,
            chunks = Math.ceil(file.size / chunkSize),
            currentChunk = 0,
            spark = new SparkMD5.ArrayBuffer(),
            fileReader = new FileReader();

        return Q.Promise(function (resolve, reject, notify) {

            fileReader.onload = onLoad;

            fileReader.onerror = onError;

            fileReader.onprogress = onprogress;

            loadNext();

            function loadNext() {
                var start = currentChunk * chunkSize,
                    end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

                fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
            }

            function onLoad(e) {
                console.log('read chunk nr', currentChunk + 1, 'of', chunks);
                spark.append(e.target.result);                   // Append array buffer
                currentChunk++;

                if (currentChunk < chunks) {
                    loadNext();
                } else {

                    var hash = spark.end();
                    console.log('finished loading');
                    console.info('computed hash', hash);  // Compute hash
                    resolve(hash);
                }
            }

            function onError() {
                reject(new Error('MD5 file: oops, something went wrong.'));
            }

            function onprogress(event) {
                self._onProgressAll(event, {loaded: event.loaded, total: event.total})
            }
        });

    };

    /* ===================================================================== Events and handlers*/

    /**
     * Contains all the events binding
     * @return {undefined}
     */
    FxUploader.prototype._bindEventListeners = function () {

        this.$input.on('change', _.bind(this._onInputChange, this));

        this.$submit.on('click', _.bind(this._onSubmit, this));

        this.$delete.on('click', _.bind(this._onDelete, this))

    };

    /**
     * Handler invoked on file selection.
     * Reset current file information and start the MD5 calculation
     * @return {undefined}
     */
    FxUploader.prototype._onInputChange = function (e) {

        var self = this,
            f = e.target.files || [{name: this.value}];

        this.current.files = [];
        this.current.files.push(f[0]);
        this._formatFileInfo(f[0]);

        //reset current md5 file info
        this.current.md5 = undefined;

        this.$delete.prop('disabled', true);
        this.createFileMD5()
            .then(function (hash) {
                self.current.md5 = hash;
                self.$submit.prop('disabled', false);
            });
    };

    /**
     * Handler invoked to start upload process.
     * The file is already loaded and the MD5 hash already calculated.
     * @return {undefined}
     */
    FxUploader.prototype._onSubmit = function () {

        this._uploadFile();
    };

    /**
     * Handler invoked to delete a file.
     * The file is already loaded and the MD5 hash already calculated.
     * @return {undefined}
     */
    FxUploader.prototype._onDelete = function () {

        var self = this;

        this._deleteFileMetadata().then(function () {
            self.$delete.prop('disabled', true);
        });
    };

    /**
     * Invoked during {@link destroy} to unbind event listeners
     * @return {undefined}
     */
    FxUploader.prototype._unbindEventListeners = function () {

        this.$input.off();

        this.$submit.off();

        this.$delete.off();
    };

    /**
     * Destroy function
     * @return {undefined}
     */
    FxUploader.prototype.destroy = function () {

        this._unbindEventListeners();

        this.$uploader.fileupload('destroy');

    };

    return FxUploader;
});
