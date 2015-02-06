/* global UI */

var ImageDetails = (function (JSTACK) {
	"use strict";

	console.log("INSIDE ImageDetails" + JSON.stringify(JSTACK));
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
			JSTACK.Nova.getimagedetail(this.imageId, callback, onError);
		},

		deleteImage: function deleteImage (callback, onError) {
			JSTACK.Nova.deleteimage(this.imageId, callback, onError);
		}
	};


	return ImageDetails;

})(JSTACK);