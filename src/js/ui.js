var UI = (function () {

	/*****************************************************************
	****************************VARIABLEs*****************************
	*****************************************************************/

	var refreshButton, deleteButton;

	var deleteImageSuccess, getImageDetailsSuccess, receiveImageId,
		refresh, onError;


	/*****************************************************************
	*************************CONSTRUCTOR******************************
	*****************************************************************/	

	function UI () {

		this.imageDetails = null;
		refreshButton = new StyledElements.StyledButton();
		deleteButton = new StyledElements.StyledButton();


		// Register callback for input endpoint
		MashupPlatform.wiring.registerCallback(receiveImageId);
	}


	/*****************************************************************
	*****************************PUBLIC*******************************
	*****************************************************************/

	UI.prototype = {
		buildDetailView: function buildDetailView (imageData) {

		},

		buildDefaultView: function buildDefaultView () {

		}
	};


	/*****************************************************************
	***************************PRIVATE********************************
	*****************************************************************/

	receiveImageId = function receiveImageId (wiringData) {
		wiringData = JSON.parse(wiringData);

		JSTACK.Keystone.params.access = wiringData.access;
		JSTACK.Keystone.params.token = wiringData.access.token.id;
		JSTACK.Keystone.params.currentstate = 2;

		this.imageDetails = new ImageDetails(wiringData.id);
		this.imageDetails.getImageDetails(getImageDetailsSuccess, onError);
	};


	/*****************************************************************
	***************************HANDLERS*******************************
	*****************************************************************/

	getImageDetailsSuccess = function getImageDetailsSuccess (imageData) {
		imageData = JSON.parse(imageData);
		this.buildDetailView(imageData);
	};

	deleteImageSuccess = function deleteImageSuccess (response) {
		response = JSON.parse(response);
		console.log(response);
		this.buildDefaultView();
	};

	onError = function onError (error) {
        MashupPlatform.widget.log('Error: ' + JSON.tableringify(error));
    };


	return UI;
})();