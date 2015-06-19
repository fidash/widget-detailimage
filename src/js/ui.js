/* global Utils */

var UI = (function () {
    "use strict";

    
    /*****************************************************************
    *                        C O N S T A N T S                       *
    *****************************************************************/

    var NONUSABLEWIDTH = 163;

    // Colors
    var RED = 'rgb(211, 1, 1)';
    var GREEN = 'green';
    var AMBAR = 'rgb(239, 163, 0)';

    var STATES = {
        'active': {
            'class': 'glyphicon glyphicon-ok fa-inverse',
            'color': GREEN
        },
        'saving': {
            'class': 'fa fa-floppy-o ',
            'color': GREEN
        },

        'queued': {
            'class': 'glyphicon glyphicon-hourglass fa-inverse',
            'color': AMBAR
        },
        'pending_delete': {
            'class': 'fa fa-trash fa-inverse',
            'color': AMBAR
        },

        'killed': {
            'class': 'glyphicon glyphicon-remove fa-inverse',
            'color': RED
        },
        'deleted': {
            'class': 'fa fa-trash fa-inverse',
            'color': RED
        }
    };


    /*****************************************************************
    *                          P R I V A T E                         *
    *****************************************************************/

    function setNameMaxWidth (nonUsableWidth) {

        var bodyWidth = $('body').attr('width');

        if (bodyWidth >= 360) {
            $('#image-name').css('max-width', bodyWidth - nonUsableWidth);
        }
        else {
            $('#image-name').css('max-width', 360 - nonUsableWidth);
        }
    }


    /*****************************************************************
    *                           P U B L I C                          *
    *****************************************************************/

    function init (callbacks, currentImage) {
        
        // Init click events
        $('#refresh-button').click(function () {
            callbacks.refresh();
        }.bind(this));
        $('#edit-button').click(function () {
            this.buildEditView(currentImage);
        }.bind(this));
        $('#delete-button').click(function () {
            callbacks.delete();
        }.bind(this));
        $('#update-image').click(function (e) {
            callbacks.update();
            $('#edit-view').addClass('hide');
            e.preventDefault();
        }.bind(this));
        $('#close-edit').click(function (e) {
            // Hide other views
            $('#error-view').addClass('hide');
            $('#default-view').addClass('hide');
            $('#edit-view').addClass('hide');
            $('body').removeClass('stripes angled-135');

            // Build
            callbacks.refresh();
            $('#detail-view').removeClass('hide');

            e.preventDefault();
        });


        /* Context */
        MashupPlatform.widget.context.registerCallback(function (newValues) {
            if ("heightInPixels" in newValues || "widthInPixels" in newValues) {

                // Set Body size
                $('body').attr('height', newValues.heightInPixels);
                $('body').attr('width', newValues.widthInPixels);

                // Set name max-width
                setNameMaxWidth(NONUSABLEWIDTH);
            }
        });

        // Build default view
        buildDefaultView();

    }

    function buildDetailView (imageData) {

        // Prevent overwriting the edit view
        if (!$('#edit-view').hasClass('hide')) {
            return;
        }

        var visibility = imageData.is_public ? 'Public' : 'Private';
        var displayableSize = Utils.getDisplayableSize(imageData.size);
        var statusTooltip = 'Status: ' + imageData.status;
        var deleteButtonClass;

        // Hide other views
        $('#error-view').addClass('hide');
        $('#default-view').addClass('hide');
        $('#edit-view').addClass('hide');
        $('body').removeClass('stripes angled-135');

        // Fields
        $('#image-name').text(imageData.name);
        $('#image-name').attr('title', imageData.name);
        $('#image-id > span').text(imageData.id);
        $('#image-visibility > span').text(visibility);
        $('#image-size > span').text(displayableSize);
        $('#image-checksum > span').text(imageData.checksum)
            .attr('title', imageData.checksum);
        $('#image-container-format > span').text(imageData.container_format);
        $('#image-disk-format > span').text(imageData.disk_format);
        $('#image-created > span').text(imageData.created_at);
        $('#image-updated > span').text(imageData.updated_at);

        // Status
        $('#image-status > div > i').removeClass();
        $('#image-status > div > i').addClass(STATES[imageData.status].class);
        $('#image-status').attr('title', statusTooltip).css('background-color', STATES[imageData.status].color);

        // Set name max-width
        setNameMaxWidth(NONUSABLEWIDTH);

        // Fix tooltips
        $('#image-status').attr('data-original-title', $('#image-status').attr('title'));
        $('#image-status').attr('title', '');

        $('#image-name').attr('data-original-title', $('#image-name').attr('title'));
        $('#image-name').attr('title', '');

        $('#image-checksum > span').attr('data-original-title', $('#image-checksum > span').attr('title'));
        $('#image-checksum > span').attr('title', '');

        // Initialize tooltips
        $('[data-toggle="tooltip"]').tooltip();

        // Disable delete button if protected
        if (imageData.protected) {
            $('#delete-button').attr('disabled', 'disabled');
        }
        else {
            $('#delete-button').removeAttr('disabled');
        }           

        // Build
        $('#detail-view').removeClass('hide');
        
    }

    function buildDefaultView () {

        // Hide other views
        $('#error-view').addClass('hide');
        $('#detail-view').addClass('hide');
        $('#edit-view').addClass('hide');
        $('body').addClass('stripes angled-135');

        // Build
        $('#default-view').removeClass('hide');
            
    }

    function buildErrorView (errorResponse) {
            
        // Hide other views
        $('#default-view').addClass('hide');
        $('#detail-view').addClass('hide');
        $('#edit-view').addClass('hide');
        $('body').addClass('stripes angled-135');

        // Build
        if (errorResponse.message) {
               $('#error-view').text(errorResponse.message);
        }
        else {
               $('#error-view').text(errorResponse);
        }

        $('#error-view').removeClass('hide');

    }

    function buildEditView (currentImage) {

        // Hide other views
        $('#error-view').addClass('hide');
        $('#default-view').addClass('hide');
        $('#detail-view').addClass('hide');
        $('body').removeClass('stripes angled-135');

        // Fill the fields with current image values

        $('#image-name-form').val(currentImage.name);
        $('#image-disk-format-form').val(currentImage.disk_format);
        $('#image-container-format-form').val(currentImage.container_format);
        $('#image-min-disk-form').val(currentImage.min_disk);
        $('#image-min-ram-form').val(currentImage.min_ram);
        $('#image-is_public-form').val(currentImage.is_public);
        $('#image-protected-form').val(currentImage.protected);

        // Build
        $('#edit-view').removeClass('hide');
    }


    return {
        init: init,
        buildDefaultView: buildDefaultView,
        buildDetailView: buildDetailView,
        buildErrorView: buildErrorView,
        buildEditView: buildEditView
    };

})();