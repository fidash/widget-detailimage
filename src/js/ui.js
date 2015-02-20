/* global ImageDetails */

var UI = (function () {
	"use strict";


	/*****************************************************************
	****************************VARIABLES*****************************
	*****************************************************************/

	var refreshButton, deleteButton, borderLayout, emptyLayout;

	var deleteImageSuccess, getImageDetailsSuccess, receiveImageId,
		onError, checkImageDetails, deleteImage;


	/*****************************************************************
	***************************CONSTRUCTOR****************************
	*****************************************************************/  

	function UI () {

		borderLayout = new StyledElements.BorderLayout();
		borderLayout.insertInto(document.body);
		

		// Register callback for input endpoint
		MashupPlatform.wiring.registerCallback('image_id', receiveImageId.bind(this));


		/* Context */
		MashupPlatform.widget.context.registerCallback(function (newValues) {
			if ("heightInPixels" in newValues || "widthInPixels" in newValues) {
				borderLayout.repaint();
			}
		});

		this.buildDefaultView();
	}


	/*****************************************************************
	*****************************PUBLIC*******************************
	*****************************************************************/

	UI.prototype = {
		buildDetailView: function buildDetailView (imageData) {

			// Delete previous
			borderLayout.getNorthContainer().clear();
			borderLayout.getCenterContainer().clear();
			borderLayout.getSouthContainer().clear();

			// Border layout
			var centerContainer = borderLayout.getCenterContainer();


			// Headers
			var header = document.createElement('h2'),
				headerInfo = document.createElement('h3'),
				headerStatus = document.createElement('h3'),
				headerSpecs = document.createElement('h3');

			header.textContent = 'Image Details';
			headerInfo.textContent = 'Info';
			headerStatus.textContent = 'Status';
			headerSpecs.textContent = 'Specs';


			// Fields
			var fields = [
				'ID',
				'Name',
				'Status',
				'Visibility',
				'Checksum',
				'Created',
				'Updated',
				'Size',
				'Container format',
				'Disk format'];


			// Data
			var infoList    = document.createElement('ul'),
				statusList  = document.createElement('ul'),
				specsList   = document.createElement('ul');

			var visibility = imageData.is_public ? 'Public' : 'Private';

			infoList.innerHTML = '<li><strong>' + fields[0] + ':</strong> ' + imageData.id + '</li>' +
								 '<li><strong>' + fields[1] + ':</strong> ' + imageData.name + '</li>';

			statusList.innerHTML = '<li><strong>' + fields[2] + ':</strong> ' + imageData.status + '</li>' +
								   '<li><strong>' + fields[3] + ':</strong> ' + visibility + '</li>' +
								   '<li><strong>' + fields[4] + ':</strong> ' + imageData.checksum + '</li>' +
								   '<li><strong>' + fields[5] + ':</strong> ' + imageData.created_at + '</li>' +
								   '<li><strong>' + fields[6] + ':</strong> ' + imageData.updated_at + '</li>';

			specsList.innerHTML = '<li><strong>' + fields[7] + ':</strong> ' + imageData.size + '</li>' +
								  '<li><strong>' + fields[8] + ':</strong> ' + imageData.container_format + '</li>' +
								  '<li><strong>' + fields[9] + ':</strong> ' + imageData.disk_format + '</li>';


			// Buttons
			var deleteButtonClass = imageData.protected ? 'btn-danger pull-right disabled' : 'btn-danger pull-right';
			
			refreshButton = new StyledElements.StyledButton({text:'Refresh', 'class': 'pull-right clear'});
			deleteButton = new StyledElements.StyledButton({text:'Delete', 'class': deleteButtonClass});
			

			refreshButton.addEventListener('click', this.refresh.bind(this), false);
			deleteButton.addEventListener('click', this.deleteImage.bind(this), false);


			// Header and footer
			borderLayout.getNorthContainer().appendChild(header);
			borderLayout.getSouthContainer().appendChild(refreshButton);
			borderLayout.getSouthContainer().appendChild(deleteButton);


			// Info {id, name}
			centerContainer.appendChild(headerInfo);
			centerContainer.appendChild(new StyledElements.Separator());
			centerContainer.appendChild(infoList);


			// Status {status, visibility, checksum, created, updated}
			centerContainer.appendChild(headerStatus);
			centerContainer.appendChild(new StyledElements.Separator());
			centerContainer.appendChild(statusList);


			// Specs {size, container_format, disk_format}
			centerContainer.appendChild(headerSpecs);
			centerContainer.appendChild(new StyledElements.Separator());
			centerContainer.appendChild(specsList);


			// Insert and repaint
			borderLayout.repaint();
		},

		buildDefaultView: function buildDefaultView () {

			// Delete previous
			borderLayout.getNorthContainer().clear();
			borderLayout.getCenterContainer().clear();
			borderLayout.getSouthContainer().clear();

			// Build
			var background = document.createElement('div');
			var message = document.createElement('div');

			background.className = 'empty-layout';
			message.clasName = 'info';
			background.appendChild(message);
			borderLayout.getCenterContainer().appendChild(background);
						
			// Insert and repaint
			borderLayout.repaint();

		},

		deleteImage: function deleteImage () {
		
			if (!checkImageDetails.call(this)) {
				MashupPlatform.widget.log('Error: No image received yet.');
				return;
			}

			this.imageDetails.deleteImage(deleteImageSuccess.bind(this), onError);
		},

		refresh: function refresh () {

			if (!checkImageDetails.call(this)) {
				MashupPlatform.widget.log('Error: No image received yet.');
				return;
			}

			this.imageDetails.getImageDetails(getImageDetailsSuccess.bind(this), onError);
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


	/*****************************************************************
	***************************HANDLERS*******************************
	*****************************************************************/

	getImageDetailsSuccess = function getImageDetailsSuccess (imageData) {
		imageData = JSON.parse(imageData);
		this.buildDetailView(imageData);
	};

	deleteImageSuccess = function deleteImageSuccess (response) {
		this.buildDefaultView();
	};

	onError = function onError (error) {
		MashupPlatform.widget.log('Error: ' + JSON.stringify(error));
	};

	receiveImageId = function receiveImageId (wiringData) {
		wiringData = JSON.parse(wiringData);

		JSTACK.Keystone.params.access = wiringData.access;
		JSTACK.Keystone.params.token = wiringData.access.token.id;
		JSTACK.Keystone.params.currentstate = 2;

		this.imageDetails = new ImageDetails(wiringData.id);
		this.imageDetails.getImageDetails(getImageDetailsSuccess.bind(this), onError);
	};


	return UI;
})();