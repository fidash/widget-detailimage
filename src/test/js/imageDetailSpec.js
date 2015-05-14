/* global ImageDetails UI receiveImageId */

describe('Test image details', function () {
	"use strict";

	var respServices = null;
	var respImageList = null;
	var ui;
	var units = [
		{
			"unit": "B",
			"value": 1,
			"expected": "1 B"
		},
		{
			"unit": "kiB",
			"value": 135821,
			"expected": "132.64 kiB"
		},
		{
			"unit": "MiB",
			"value": 12358468,
			"expected": "11.79 MiB"
		},
		{
			"unit": "GiB",
			"value": 4532282751,
			"expected": "4.22 GiB"
		},
		{
			"unit": "TiB",
			"value": 5423864125103,
			"expected": "4.93 TiB"
		},
		{
			"unit": "PiB",
			"value": 1452687412365789,
			"expected": "1.29 PiB"
		},
		{
			"unit": "EiB",
			"value": 4125369753962148752,
			"expected": "3.58 EiB"
		},
		{
			"unit": "ZiB",
			"value": 4756123651742368426957,
			"expected": "4.03 ZiB"
		},
		{
			"unit": "YiB",
			"value": 5123698741236987412369874,
			"expected": "4.24 YiB"
		}
	];


	beforeEach(function () {

		JSTACK.Keystone = jasmine.createSpyObj("Keystone", ["init", "authenticate", "gettenants", "params", "getservice"]);
		JSTACK.Nova = jasmine.createSpyObj("Nova", ["deleteimage", "getimagelist", "params"]);
		JSTACK.Comm = jasmine.createSpyObj("Comm",  ["getEndpoint", "del"]);

		jasmine.getFixtures().fixturesPath = 'base/src/test/fixtures/html';
		loadFixtures('defaultTemplate.html');

		jasmine.getJSONFixtures().fixturesPath = 'base/src/test/fixtures/json';
		jasmine.getJSONFixtures().clearCache();
		respServices = getJSONFixture('respServices.json');
		respImageList = getJSONFixture('respImageList.json');

		ui = new UI();
	});

	function receiveWiringEvent (imageId) {
		
		var access = respServices.access;
		var wiringData = {
			'id': imageId,
			'access': access
		};

		wiringData = JSON.stringify(wiringData);
		var receiveImageId = MashupPlatform.wiring.registerCallback.calls.mostRecent().args[1];		

		receiveImageId.call(ui, wiringData);
	}

	function getImageDetailsSuccess (response) {

		var callback = JSTACK.Nova.getimagelist.calls.mostRecent().args[1];
		
		callback(response);
	}

	function getImageDetailsError (errorResponse) {

		var errorCallback = JSTACK.Nova.getimagelist.calls.mostRecent().args[2];

		errorCallback(errorResponse);
	}


	/*********************************************************************************************
	********************************************Tests*********************************************
	*********************************************************************************************/

	it('should call JSTACK.Nova.getimagelist when receives a wiring input event', function () {

		var imageId = 'id';
		
		receiveWiringEvent(imageId);

		expect(JSTACK.Nova.getimagelist).toHaveBeenCalled();
		expect(ui.imageDetails).toExist();
	});

	it('should call JSTACK.Nova.deleteimage', function () {

		var imageId = 'id';
		var service = JSTACK.Keystone.getservice(JSTACK.Nova.params.service);
		var url = JSTACK.Comm.getEndpoint(service, "Spain2", JSTACK.Nova.params.endpointType) + '/images/' + imageId;

		receiveWiringEvent(imageId);
		ui.deleteImage();

		//expect(JSTACK.Nova.deleteimage).toHaveBeenCalled();
		expect(MashupPlatform.http.makeRequest).toHaveBeenCalledWith(url, jasmine.any(Object));
		expect(ui.imageDetails).toExist();
	});

	it('should call JSTACK.Nova.getimagelist error callback', function () {

		var imageId = 'id';
		
		receiveWiringEvent(imageId);
		getImageDetailsError("Error getimagelist");
		
		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "Error getimagelist"');

	});

	it('should call JSTACK.Nova.getimagelist success callback', function () {

		var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var expectedCount = JSTACK.Nova.getimagelist.calls.count() + 1;

		receiveWiringEvent(imageId);
		getImageDetailsSuccess(respImageList);
		expect(JSTACK.Nova.getimagelist.calls.count()).toBe(expectedCount);
	});

	it('should call buildDetailView after successfully getting an image\'s details', function () {

		var buildDetailViewSpy = spyOn(ui, 'buildDetailView');
		var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var successCallback;

		receiveWiringEvent(imageId);
		successCallback = JSTACK.Nova.getimagelist.calls.mostRecent().args[1];
		successCallback(respImageList);

		expect(buildDetailViewSpy).toHaveBeenCalled();
	});

	it('should call the error function when refresh is called without an image', function () {

		var expectedCount = MashupPlatform.widget.log.calls.count() + 1;

		ui.refresh();

		expect(MashupPlatform.widget.log.calls.count()).toBe(expectedCount);
		expect(MashupPlatform.widget.log.calls.mostRecent().args).toEqual(['Error: No image received yet.']);
	});

	it('should call the error function when deleteImage is called without an image', function () {

		var expectedCount = MashupPlatform.widget.log.calls.count() + 1;

		ui.deleteImage();

		expect(MashupPlatform.widget.log.calls.count()).toBe(expectedCount);
		expect(MashupPlatform.widget.log.calls.mostRecent().args).toEqual(['Error: No image received yet.']);
	});

	it('should call JSTACK.Nova.getimagelist when refreshing', function () {
		
		var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';

		receiveWiringEvent(imageId);
		ui.refresh();

		expect(JSTACK.Nova.getimagelist).toHaveBeenCalled();
	});

	it('should call the error function when the getImageDetails call fail', function () {

		var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var errorCallback;

		receiveWiringEvent(imageId);
		errorCallback = JSTACK.Nova.getimagelist.calls.mostRecent().args[2];
		errorCallback('Call error function');

		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "Call error function"');
	});

	it('should correctly build the detail view', function () {

		var imageData = respImageList.images[0];
		var fields = {
                'id': imageData.id,
                'visibility': 'Public',
                'checksum': imageData.checksum,
                'created': imageData.created_at,
                'updated': imageData.updated_at,
                'size': parseFloat(imageData.size/1024/1024/1024).toFixed(2) + " GiB",
                'container-format': imageData.container_format,
                'disk-format': imageData.disk_format
        };
        var imageName = imageData.name;
        var statusTitle = 'Status: ' + imageData.status;
		
		ui.buildDetailView(imageData);

        for (var field in fields) {
        	expect($('#image-' + field + ' > span')).toContainText(fields[field]);
        }

        expect($('#image-name')).toContainText(imageName);
        expect($('#image-status').attr('data-original-title')).toEqual(statusTitle);
	});

	it('should build the detailed view with a private image', function () {

		var imageData = respImageList.images[1];
		var fields = {
                'id': imageData.id,
                'visibility': 'Private',
                'checksum': imageData.checksum,
                'created': imageData.created_at,
                'updated': imageData.updated_at,
                'size': parseFloat(imageData.size/1024/1024/1024).toFixed(2) + " GiB",
                'container-format': imageData.container_format,
                'disk-format': imageData.disk_format
        };
        var imageName = imageData.name;
        var statusTitle = 'Status: ' + imageData.status;
		
		ui.buildDetailView(imageData);

        for (var field in fields) {
        	expect($('#image-' + field + ' > span')).toContainText(fields[field]);
        }

        expect($('#image-name')).toContainText(imageName);
        expect($('#image-status').attr('data-original-title')).toEqual(statusTitle);
	});
	
	it('should build build the detailed view with a protected image', function () {

		var imageData = respImageList.images[2];
		
		ui.buildDetailView(imageData);

		expect($('#delete-button').attr('disabled')).toBeDefined();
	});

	it('should change the height value after been given a new height', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {
			'heightInPixels': 400
		};

		callback(newValues);
		
		expect($('body').attr('height')).toBe(newValues.heightInPixels.toString());
	});

	it('should change the width value after been given a new width', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {
			'widthInPixels': 800
		};

		callback(newValues);
		
		expect($('body').attr('width')).toBe(newValues.widthInPixels.toString());
	});

	it('should not change size after been given an empty new values set', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {};
		var bodyExpectedWidth = $('body').attr('width');
		var bodyExpectedHeight = $('body').attr('height');


		callback(newValues);
		
		expect($('body').attr('width')).toBe(bodyExpectedWidth);
		expect($('body').attr('height')).toBe(bodyExpectedHeight);
	});

	it('should build the error view on failure', function () {

		var errorCallback;
		var imageId = 'id';
		var buildErrorViewSpy = spyOn(ui, 'buildErrorView').and.callThrough();
		var message = {
			'message': '500 Error',
			'body': 'Stack trace'
		};
		
		receiveWiringEvent(imageId);
		errorCallback = JSTACK.Nova.getimagelist.calls.mostRecent().args[2];
		errorCallback(message);

		expect(buildErrorViewSpy).toHaveBeenCalled();
		expect($('#error-view')).toContainText('500 Error');
	});

	it('should call JSTACK.Nova.getimagelist when a click event is triggered on the refresh button', function () {

		var imageId = 'id';
		var eventSpy = spyOnEvent('#refresh-button', 'click');
		var setTimeoutSpy = spyOn(window, 'setTimeout');
		var expectedCountTimeout, expectedCountImageDetails;

		receiveWiringEvent(imageId);
		getImageDetailsSuccess(respImageList);

		expectedCountTimeout = setTimeoutSpy.calls.count();
		expectedCountImageDetails = JSTACK.Nova.getimagelist.calls.count() + 1;
		$('#refresh-button').trigger('click');

		expect(eventSpy).toHaveBeenTriggered();
		expect(JSTACK.Nova.getimagelist.calls.count()).toEqual(expectedCountImageDetails);
		expect(setTimeoutSpy.calls.count()).toEqual(expectedCountTimeout);

	});

	it('should call JSTACK.Nova.deleteimage when a click event is triggered on the terminate button', function () {
		
		var imageId = 'id';
		var eventSpy = spyOnEvent('#delete-button', 'click');
		var expectedCountDeleteImage;
		var service = JSTACK.Keystone.getservice(JSTACK.Nova.params.service);
		var url = JSTACK.Comm.getEndpoint(service, "Spain2", JSTACK.Nova.params.endpointType) + '/images/' + imageId;

		receiveWiringEvent(imageId);
		getImageDetailsSuccess(respImageList);

		expectedCountDeleteImage = JSTACK.Nova.deleteimage.calls.count() + 1;
		$('#delete-button').trigger('click');

		expect(eventSpy).toHaveBeenTriggered();
		expect(MashupPlatform.http.makeRequest).toHaveBeenCalledWith(url, jasmine.any(Object));
		//expect(JSTACK.Nova.deleteimage.calls.count()).toEqual(expectedCountDeleteImage);
	});

	it('should not call setTimeout the second time a wiring event is received', function () {

		var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var setTimeoutSpy = spyOn(window, 'setTimeout');
		var expectedCountTimeout = setTimeoutSpy.calls.count() + 1;

		receiveWiringEvent(imageId);
		getImageDetailsSuccess(respImageList);
		receiveWiringEvent(imageId);
		getImageDetailsSuccess(respImageList);

		expect(setTimeoutSpy.calls.count()).toEqual(expectedCountTimeout);
	});

	it('should call getimagelist 10 seconds after receiving the last update', function () {

        var expectedCount, callback;
        var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
        var setTimeoutSpy = spyOn(window, 'setTimeout');

        receiveWiringEvent(imageId);
        expectedCount = JSTACK.Nova.getimagelist.calls.count() + 1;
		getImageDetailsSuccess(respImageList);
        callback = setTimeoutSpy.calls.mostRecent().args[0];
        callback();

        expect(JSTACK.Nova.getimagelist.calls.count()).toEqual(expectedCount);
        expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 10000);

    });

    it('should not call setTimeout after an error has occurred', function () {

    	var setTimeoutSpy = spyOn(window, 'setTimeout');
    	var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
    	var expectedCount = setTimeoutSpy.calls.count();
    	var errorCallback;

    	receiveWiringEvent(imageId);
    	errorCallback = JSTACK.Nova.getimagelist.calls.mostRecent().args[2];
    	errorCallback('Error');
    	getImageDetailsSuccess(respImageList);

    	expect(setTimeoutSpy.calls.count()).toEqual(expectedCount);
    });

    units.forEach(function (unit) {
    	it('should display image size in ' + unit.unit + ' correctly', function () {
    		
    		var imageData = respImageList.images[0];

    		imageData.size = unit.value;
    		ui.buildDetailView(imageData);

    		expect($('#image-size > span')).toContainText(unit.expected);
    	});
    });

});
