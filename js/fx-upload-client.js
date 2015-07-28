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
            server_url: 'http://168.202.28.32:8080',
            context: "c",
            autoClose: true,
            chunkSize: 100000
        },
        s = {
            UPLOADER: '#fx-uploader',
            INPUT: '#fx-uploader-input',
            SUBMIT: '#fx-uploader-submit',
            DELETE: '#fx-uploader-delete'
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

    };

    /**
     * Init internal components
     * @return {undefined}
     */
    FxUploader.prototype._initUploader = function () {

        this.$uploader.fileupload({

            maxChunkSize: this.o.chunkSize,

            multipart: false,

            //autoUpload: false,

            //singleFileUploads: true,

            //sequentialUploads: true,

            done: _.bind(this._onTransferComplete, this)

            , progressall: _.bind(this._onProgressAll, this)

            /* ,add: function (e, data) {

             //reset current md5 file info
             self.current.md5 = undefined;

             self.createFileMD5().then(function (md5) {

             self.current.md5 = md5;

             data.url = self.o.server_url + '/v1/file/chunk/' + self.o.context + '/' + self.current.md5;

             self.$submit.prop('disabled', false);

             self.current.data = data;

             });
             }*/

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
     * Create the file metadata
     * @return {Promise}
     */
    FxUploader.prototype._createFileMetadata = function () {

        return Q($.ajax({
            type: "POST",
            url: this.o.server_url + "/v1/metadata/file",
            contentType: "application/json",
            data: JSON.stringify({
                "context": this.current.context,
                "md5": this.current.md5,
                "autoClose": this.current.autoClose
            })
        }));

    };

    /**
     * Create the file metadata
     * @return {Promise}
     */
    FxUploader.prototype._deleteFileMetadata = function () {

        return Q($.ajax({
            type: "DELETE",
            url: this.o.server_url + '/v1/file/' + this.o.context + '/' + this.current.md5,
            contentType: "application/json"
        }));

    };

    /**
     * Send sequentially file's chunks and update the progress bar
     * @return {undefined}
     */
    FxUploader.prototype._transferFile = function () {

        this.$uploader.fileupload('option', {
            url: this.o.server_url + '/v1/file/chunk/' + this.o.context + '/' + this.current.md5
        });

        this.$uploader.fileupload('add', {files: this.current.files});
    };

    /**
     * Handler for Transfer progress graphical feedback
     * @return {undefined}
     */
    FxUploader.prototype._onProgressAll = function (e, data) {

        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#progress .bar').css(
            'width',
            progress + '%'
        );

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

        //reset current md5 file info
        this.current.md5 = undefined;

        this.$delete.prop('disabled', true);

        this.createFileMD5().then(function (hash) {
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

    };

    return FxUploader;
});
