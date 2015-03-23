/* global ImageDetails */

var UI = (function () {
	"use strict";

	
	/*****************************************************************
	****************************COSNTANTS*****************************
	*****************************************************************/

	var NONUSABLEWIDTH = 163;

	// Colors
	var RED = 'rgb(211, 1, 1)';
	var GREEN = 'green';
	var AMBAR = 'rgb(239, 163, 0)';

	var statuses = {
		'active': {
			'class': 'glyphicon glyphicon-ok fa-inverse',
			'color': GREEN
		},
		'saving': {
			'class': 'fa fa-floppy-o ',
			'color': GREEN
		},

		'queued': {
			'class': 'fa fa-spinner fa-pulse fa-inverse',
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
	****************************VARIABLES*****************************
	*****************************************************************/

	var deleteImageSuccess, getImageDetailsSuccess, receiveImageId,
		onError, checkImageDetails, deleteImage, getDisplayableSize,
		refreshSuccess, initEvents, setNameMaxWidth;

	var delay, prevRefresh, error;



	/*****************************************************************
	***************************CONSTRUCTOR****************************
	*****************************************************************/  

	function UI () {

		delay = 10000;
		prevRefresh = false;
		error = false;

		initEvents.call(this);
		this.buildDefaultView();
	}


	/*****************************************************************
	*****************************PUBLIC*******************************
	*****************************************************************/

	UI.prototype = {

		buildDetailView: function buildDetailView (imageData) {

			var visibility = imageData.is_public ? 'Public' : 'Private';
			var displayableSize = getDisplayableSize(imageData.size);
			var statusTooltip = 'Status: ' + imageData.status;
			var deleteButtonClass;

			// Hide other views
			$('#error-view').addClass('hide');
			$('#default-view').addClass('hide');
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
			$('#image-status > div > i').addClass(statuses[imageData.status].class);
			$('#image-status').attr('title', statusTooltip).css('background-color', statuses[imageData.status].color);

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
			
		},

		buildDefaultView: function buildDefaultView () {

			// Hide other views
            $('#error-view').addClass('hide');
            $('#detail-view').addClass('hide');
            $('body').addClass('stripes angled-135');

            // Build
            $('#default-view').removeClass('hide');
			
		},

		deleteImage: function deleteImage () {
		
			if (!checkImageDetails.call(this)) {
				MashupPlatform.widget.log('Error: No image received yet.');
				return;
			}

			this.imageDetails.deleteImage(null, onError.bind(this));
		},

		refresh: function refresh () {

			if (!checkImageDetails.call(this)) {
				MashupPlatform.widget.log('Error: No image received yet.');
				return;
			}

			this.imageDetails.getImageDetails(refreshSuccess.bind(this), onError.bind(this));
		},

		buildErrorView: function buildErrorView (errorResponse) {
			
			// Hide other views
			$('#default-view').addClass('hide');
			$('#detail-view').addClass('hide');
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
	};


	/*****************************************************************
	***************************PRIVATE********************************
	*****************************************************************/

	checkImageDetails = function checkImageDetails () {
		
		if (!this.imageDetails) {
			return false;
		}

		return true;
	};

	getDisplayableSize = function getDisplayableSize (size) {
		
		var units = [
			"B",
			"kiB",
			"MiB",
			"GiB",
			"TiB",
			"PiB",
			"EiB",
			"ZiB",
			"YiB",
		];
		size = parseFloat(size);
		var displayableSize = size;
		var unit = 0;

		if (size < 1024) {
			return size + ' ' + units[0];
		}

		while (parseFloat(displayableSize/1024) > parseFloat(1) && unit < 9) {
			displayableSize /= 1024;
			unit += 1;
		}

		return displayableSize.toFixed(2) + ' ' + units[unit];
	
	};

    setNameMaxWidth = function setNameMaxWidth (nonUsableWidth) {

		var bodyWidth = $('body').attr('width');

		if (bodyWidth >= 360) {
			$('#image-name').css('max-width', bodyWidth - nonUsableWidth);
		}
		else {
			$('#image-name').css('max-width', 360 - nonUsableWidth);
		}
	};

	initEvents = function init () {

		// Init click events
		$('#refresh-button').click(function () {
			$('#refresh-button > i').addClass('fa-spin');
			this.refresh.call(this);
		}.bind(this));
		$('#delete-button').click(function () {
			this.deleteImage.call(this);
		}.bind(this));

		// Register callback for input endpoint
		MashupPlatform.wiring.registerCallback('image_id', receiveImageId.bind(this));


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

	};


	/*****************************************************************
	***************************HANDLERS*******************************
	*****************************************************************/

	getImageDetailsSuccess = function getImageDetailsSuccess (imageData) {
		imageData = JSON.parse(imageData);

		// Keep refreshing if no errors
		if (!error) {
			this.buildDetailView(imageData);

			setTimeout(function () {
			       this.imageDetails.getImageDetails(getImageDetailsSuccess.bind(this), onError.bind(this));
			}.bind(this), delay);
		}
		else {
			prevRefresh = false;
		}

	};

	refreshSuccess = function refreshSuccess (imageData) {
		imageData = JSON.parse(imageData);

		// Stop spin animation
		$('#refresh-button > i').removeClass('fa-spin');

		this.buildDetailView(imageData);
	};


	onError = function onError (errorResponse) {
		error = true;
		this.buildErrorView(errorResponse);
		MashupPlatform.widget.log('Error: ' + JSON.stringify(errorResponse));

	};

	receiveImageId = function receiveImageId (wiringData) {
		wiringData = JSON.parse(wiringData);

		JSTACK.Keystone.params.access = wiringData.access;
		JSTACK.Keystone.params.token = wiringData.access.token.id;
		JSTACK.Keystone.params.currentstate = 2;

		this.imageDetails = new ImageDetails(wiringData.id);

		error = false;

		if (!prevRefresh) {
			prevRefresh = true;
			this.imageDetails.getImageDetails(getImageDetailsSuccess.bind(this), onError.bind(this));
		}
		else {
			this.imageDetails.getImageDetails(refreshSuccess.bind(this), onError.bind(this));
		}
	};


	return UI;
})();