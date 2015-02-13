/* global ImageDetails UI receiveImageId */

describe('Test image details', function () {
	"use strict";

	var respServices = null;
	var respImageList = null;
	var calledGetImageDetailsSuccess, calledGetImageDetailsError;


	beforeEach(function () {
		jasmine.getJSONFixtures().fixturesPath = 'src/test/fixtures/json';
		respServices = getJSONFixture('respServices.json');
		respImageList = getJSONFixture('respImageList.json');
		calledGetImageDetailsSuccess = false;
		calledGetImageDetailsError = false;
	});

	function receiveWiringEvent (ui) {
		
		var imageId = 'id';
		var access = respServices.access;
		var wiringData = {
			'id': imageId,
			'access': access
		};

		wiringData = JSON.stringify(wiringData);
		var receiveImageId = MashupPlatform.wiring.registerCallback.calls.mostRecent().args[1];		

		receiveImageId.call(ui, wiringData);
	}

	function callGetImageDetailsCallback (imageDetails) {

		imageDetails.getImageDetails(function () {
			calledGetImageDetailsSuccess = true;
		},
		function () {
			calledGetImageDetailsError = true;
		});
		var successCallback = JSTACK.Nova.getimagelist.calls.mostRecent().args[1];

		successCallback(respImageList);
	}

	it('should call JSTACK.Nova.getimagelist when receives a wiring input event', function () {

		var ui = new UI();
		
		receiveWiringEvent();

		expect(JSTACK.Nova.getimagelist).toHaveBeenCalled();
		expect(ui.imageDetails).toExist();
	});

	it('should call JSTACK.Nova.deleteimage', function () {

		var ui = new UI();

		receiveWiringEvent(ui);
		ui.deleteImage();

		expect(JSTACK.Nova.deleteimage).toHaveBeenCalled();
		expect(ui.imageDetails).toExist();
	});

	it('should call getImageDetails error callback', function () {
		
		var imageDetails = new ImageDetails('id');
		
		callGetImageDetailsCallback(imageDetails);
		expect(calledGetImageDetailsError).toBe(true);

	});

	it('should call getImageDetails success callback', function () {

		var imageDetails = new ImageDetails('f3c6536a-4604-47d7-96b7-daf7ff1455ca');

		callGetImageDetailsCallback(imageDetails);
		expect(calledGetImageDetailsSuccess).toBe(true);
	});
	
});
