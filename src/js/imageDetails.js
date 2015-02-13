/* global UI */

var ImageDetails = (function (JSTACK) {
	"use strict";

	/*****************************************************************
	*************************CONSTRUCTOR******************************
	*****************************************************************/	

	function ImageDetails (imageId) {
		this.imageId = imageId;
	}


	/*****************************************************************
	*****************************PUBLIC*******************************
	*****************************************************************/

	ImageDetails.prototype = {
		getImageDetails: function getImageDetails (callback, onError) {

			var onOk = function onOk (response) {

				var imageData;
				
				for (var i=0; i<response.images.length; i++) {
					if (response.images[i].id === this.imageId) {
						imageData = JSON.stringify(response.images[i]);
						break;
					}
				}

				if (!imageData) {
					onError("Image with ID " + this.imageId + " does not exist.");
					return;
				}

				callback(imageData);
			}.bind(this);

			JSTACK.Nova.getimagelist(true, onOk, onError);
		},

		deleteImage: function deleteImage (callback, onError) {
			JSTACK.Nova.deleteimage(this.imageId, callback, onError);
		}
	};


	return ImageDetails;

})(JSTACK);
