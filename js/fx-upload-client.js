/*global define*/
define([
    'jquery',
    'underscore',
    'handlebars',
    'text!fx-common/html/fenix-uploader-template.hbs',
    'text!fx-common/html/fenix-uploader-item.hbs',
    'q',
    'SparkMD5',
    'jquery.fileupload'
], function ($, _, Handlebars, uploadTemplate, itemTemplate, Q, SparkMD5) {

    'use strict';

    var defaultOpts = {
            upload_accept: '.csv',
            server_url: 'http://fenixservices.fao.org/upload',
            context: "c",
            autoClose: false,
            chunkSize: 100000,
            maxRetry: 100,
            retryTimeout: 500,
            callTimeout: 500
        },
        s = {
            UPLOADER: '#fx-uploader',
            INPUT: '#fx-uploader-input',
            SUBMIT: '#fx-uploader-submit',
            DELETE: '#fx-uploader-delete',
            PROGRESS_BAR: '#progress .bar',
            EXTENDED_INFO: '#fx-uploader-extended-info',
            INPUT_OPENER: '#fx-uploader-input-opener',
            LIST: '#fx-uploader-list',
            ITEM_REMOVE: '.fx-uploader-item-remove',
            ITEM_LIST: '.fx-uploader-item-list',
            ITEM_STEP_ICON: 'i',
            ITEM_TICKER : '.fx-uploader-item-list-container',
            STEP_INFO : '[data-role="info"]'
        }, step = {
            PRE_PROCESS: 'pre_process',
            UPLOAD: 'upload',
            CLOSE: 'close',
            POST_PROCESS: 'post_process',
            METADATA: 'metadata'
        }, status = {
            WAITING: 'waiting',
            DOING: 'doing',
            DONE: 'done',
            ERROR: 'error'
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

        this.$inputOpener = this.$el.find(s.INPUT_OPENER);

        this.$input = this.$el.find(s.INPUT);

        this.$submit = this.$el.find(s.SUBMIT);

        this.$delete = this.$el.find(s.DELETE);

        this.$uploader = this.$el.find(s.UPLOADER);

        this.$progressBar = this.$el.find(s.PROGRESS_BAR);

        this.$list = this.$el.find(s.LIST);


    };

    /**
     * Init internal components
     * @return {undefined}
     */
    FxUploader.prototype._initUploader = function ( item ) {

        console.log(this.o.server_url + '/file/chunk/' + this.o.context + '/' + item.details.md5)

        var self = this;

        item.template.fileupload({

            url: this.o.server_url + '/file/chunk/' + this.o.context + '/' + item.details.md5,

            maxChunkSize: this.o.chunkSize,

            multipart: false,

            //autoUpload: false,

            singleFileUploads: true,

            sequentialUploads: true,

            done: _.bind(this._onTransferComplete, this, item),

            //progressall: _.bind(this._onProgressAll, this, item),

            progress: _.bind(this._onUploadProgress, this, item),

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
    FxUploader.prototype._uploadFile = function (item) {

        var self = this;

        this._startItemStep(step.PRE_PROCESS, item);

        this._setStepStatus(status.DOING, item);

        this._setItemStatus(status.DOING, item);

        this.createFileMD5(item.file)
            .then(function (md5) {
                self._setStepStatus(status.DONE, item);

                if (!item.details) {
                    item.details = { };
                }

                item.details.md5 = md5;

                return self._createFileMetadata(item);

            }, function () {
                self._setStepStatus(status.ERROR, item);
            })
            .then(function () {

                console.log("File Metadata: created.");

                self._setStepStatus(status.DONE, item);

                return self._transferFile(item);

            },  function () {
                self._setStepStatus(status.ERROR, item);
            });

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
    FxUploader.prototype._createFileMetadata = function (item) {

        this._startItemStep(step.METADATA, item);

        this._setStepStatus(status.DOING, item);

        return Q($.ajax({
            type: "POST",
            url: this.o.server_url + "/metadata/file",
            contentType: "application/json",
            data: JSON.stringify({
                "context": this.o.context,
                "md5": item.details.md5,
                "autoClose": this.o.autoClose
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
    FxUploader.prototype._transferFile = function (item) {

        this._startItemStep(step.UPLOAD, item);

        this._setStepStatus(status.DOING, item);

        this._initUploader(item);

        item.template.fileupload('add', {files: item.file});
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
    FxUploader.prototype._onUploadProgress = function (item, e, data ) {

        item.current.el.find(s.STEP_INFO).html(this._renderExtendedProgress(data))
    };

    /**
     * Close the transferred file
     * @return {Promise}
     */
    FxUploader.prototype._closeFile = function () {

        return Q($.ajax({
            type: "POST",
            url: this.o.server_url + '/file/closure/' + this.o.context + '/' + this.current.md5 + '?process=false',
            contentType: "application/json"
        }));

    };

    /**
     * Start post-process
     * @return {Promise}
     */
    FxUploader.prototype._startPostProcess = function (item) {

        this._startItemStep(step.POST_PROCESS, item);

        this._setStepStatus(status.DOING, item);

        return Q($.ajax({
            type: "POST",
            url: this.o.server_url + '/file/process/' + this.o.context + '/' + item.details.md5,
            contentType: "application/json"
        }));

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

    FxUploader.prototype._getFileInfo = function (item) {

        var model = {},
            f = item.file;

        model.name = f.name;
        model.type = f.type || 'n/a';
        model.size = this._formatFileSize(f.size) || 'n/a';
        model.lastModifiedDate = f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a';

        item.model = model;

    };

    /**
     * Handler for Transfer end
     * @return {undefined}
     */
    FxUploader.prototype._onTransferComplete = function (item) {

        this._setStepStatus(status.DONE, item);

        console.log("Trans complete")

        var self = this;

        this._startItemStep(step.CLOSE, item);

        this._setStepStatus(status.DOING, item);

        this._closeFile().then(function () {
            console.log("File Closed")

            self._setStepStatus(status.DONE, item);
            return self._startPostProcess(item);

        }, function () {
            self._setStepStatus(status.ERROR, item);
            throw new Error("Impossible to close the file");
        }).then(function () {
            console.log("Post process completed")
            self._setStepStatus(status.DONE, item);
        }, function () {

            self._setStepStatus(status.ERROR, item);
            throw new Error("Impossible to complete the postprocess");
        })

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
                //console.log('read chunk nr', currentChunk + 1, 'of', chunks);
                spark.append(e.target.result);                   // Append array buffer
                currentChunk++;

                if (currentChunk < chunks) {
                    loadNext();
                } else {

                    var hash = spark.end();
                    //console.log('finished loading');
                    console.info('computed hash', hash);  // Compute hash
                    resolve(hash);
                }
            }

            function onError() {
                reject(new Error('MD5 file: oops, something went wrong.'));
            }

            function onprogress(event) {
                //self._onProgressAll(event, {loaded: event.loaded, total: event.total})
            }
        });

    };

    /* ===================================================================== Events and handlers*/

    /**
     * Contains all the events binding
     * @return {undefined}
     */
    FxUploader.prototype._bindEventListeners = function () {

        this.$inputOpener.on('click', _.bind(this._onInputOpenerClick, this));

        this.$input.on('change', _.bind(this._onInputChange, this));

        this.$delete.on('click', _.bind(this._onDelete, this))

    };

    /**
     * Handler invoked on opener click.
     * @return {undefined}
     */
    FxUploader.prototype._onInputOpenerClick = function (e) {

        e.preventDefault();

        this.$input.trigger('click');
    };

    /**
     * Handler invoked on file selection.
     * Reset current file information and start the MD5 calculation
     * @return {undefined}
     */
    FxUploader.prototype._onInputChange = function (e) {

        var f = e.target.files || [{name: this.value}];

        this._addItem({
            file: f[0],
            steps: []
        });

    };

    FxUploader.prototype._addItem = function (item) {

        this._injectItemTemplate(item);

        this._bindItemEventListeners(item);

        this._uploadFile(item);

    };

    FxUploader.prototype._injectItemTemplate = function (item) {

        this._getFileInfo(item);

        var template = Handlebars.compile(itemTemplate),
            result = template({model: item.model});

        item.template = $(result);
        item.list = item.template.find(s.ITEM_LIST);

        return this.$list.prepend(item.template);
    };

    FxUploader.prototype._bindItemEventListeners = function (item) {

        var self = this;

        item.buttons = {};
        item.buttons.remove = item.template.find(s.ITEM_REMOVE);

        item.buttons.remove.on('click', function () {
            self._unbindItemEventListeners(item);
            item.template.remove();
        });


    };

    FxUploader.prototype._startItemStep = function (step, item) {

        console.log('------------- start step ' + step)

        if (!item.steps) {
            item.steps = [];
        }

        var step = {
            id: step,
            el: item.list.find('[data-step=' + step + ']')
        };

        item.steps.push(step);
        item.current = step;

        this._scrollToStep(item);
        this._setStepStatus(status.WAITING, item);

    };

    FxUploader.prototype._scrollToStep = function (item) {

        var top = item.list.find("li").index(item.current.el) * item.current.el.height(),
            string = '-' + top.toString() + 'px';

        item.list.css({'top': string})

    };

    FxUploader.prototype._scrollToStep = function (item) {

        var top = item.list.find("li").index(item.current.el) * item.current.el.height(),
            string = '-' + top.toString() + 'px';

        item.list.css({'top': string})

    };

    FxUploader.prototype._setStepStatus = function (stat, item) {

        console.log('set status ' + stat)

        var icon =  item.current.el.find(s.ITEM_STEP_ICON);

        item.current.status = stat;

        switch (item.current.status) {
            case 'doing' :
                icon.removeClass().addClass('fa fa-refresh fa-spin step-icon');
                break;
            case 'done' :
                icon.removeClass().addClass('fa fa-check step-icon');
                break;
            case 'error' :
                icon.removeClass().addClass('fa fa-times step-icon');
                this._setItemStatus(status.ERROR, item);
                break;
            default :
                icon.removeClass().addClass('fa fa-clock');
        }

    };

    FxUploader.prototype._setItemStatus = function (stat, item) {

        var ticker =  item.template.find(s.ITEM_TICKER);

        ticker.attr('data-status', status[stat.toUpperCase()]);

    };

    FxUploader.prototype._unbindItemEventListeners = function (item) {

        var btns = Object.keys(item.buttons);

        for (var i = 0; i < btns.length; i++) {

            if (btns.hasOwnProperty(btns[i])) {
                btns[i].off();
            }
        }

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
