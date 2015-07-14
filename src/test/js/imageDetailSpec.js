/* global ImageDetails UI receiveImageId */

describe('Test image details', function () {
    "use strict";

    var respServices = null;
    var respImageList = null;
    var imageDetails;
    


    beforeEach(function () {

        jasmine.getFixtures().fixturesPath = 'base/src/test/fixtures/html';
        loadFixtures('defaultTemplate.html');

        jasmine.getJSONFixtures().fixturesPath = 'base/src/test/fixtures/json';
        jasmine.getJSONFixtures().clearCache();
        respServices = getJSONFixture('respServices.json');
        respImageList = getJSONFixture('respImageList.json');

        imageDetails = new ImageDetails();
        imageDetails.init();

    });

    afterEach(function () {
        MashupPlatform.reset();
        jasmine.resetAll(JSTACK.Keystone);
        jasmine.resetAll(JSTACK.Nova);
        jasmine.resetAll(JSTACK.Comm);
        jasmine.resetAll(JSTACK.Glance);
    });

    function receiveWiringEvent (imageId) {
        
        var access = respServices.access;
        var wiringData = {
            'id': imageId,
            'access': access,
            'region': 'Spain2'
        };

        wiringData = JSON.stringify(wiringData);
        var receiveImageId = MashupPlatform.wiring.registerCallback.calls.mostRecent().args[1];     

        receiveImageId(wiringData);
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
    *                           F U N C T I O N A L I T Y   T E S T S                            *
    *********************************************************************************************/

    it('should call JSTACK.Nova.getimagelist when receives a wiring input event', function () {

        var imageId = 'id';
        
        receiveWiringEvent(imageId);

        expect(JSTACK.Nova.getimagelist).toHaveBeenCalled();
    });

    it('should call OpenStack delete image function', function () {

        var imageId = 'id';
        var service = JSTACK.Keystone.getservice(JSTACK.Nova.params.service);
        var deleteURL = JSTACK.Comm.getEndpoint(service, "Spain2", JSTACK.Nova.params.endpointType) + '/images/' + imageId;

        receiveWiringEvent(imageId);
        imageDetails.deleteImage();

        expect(MashupPlatform.http.makeRequest).toHaveBeenCalledWith(deleteURL, jasmine.any(Object));
    });

    it('should call buildDefaultView when an image is deleted', function () {
        var imageId = 'id';
        var service = JSTACK.Keystone.getservice(JSTACK.Nova.params.service);
        var deleteURL = JSTACK.Comm.getEndpoint(service, "Spain2", JSTACK.Nova.params.endpointType) + '/images/' + imageId;
        var deleteCallback;
        var buildDefaultViewSpy = spyOn(UI, 'buildDefaultView');

        receiveWiringEvent(imageId);
        imageDetails.deleteImage();
        deleteCallback = MashupPlatform.http.makeRequest.calls.mostRecent().args[1].onSuccess;
        deleteCallback();

        expect(buildDefaultViewSpy).toHaveBeenCalled();
        expect(imageDetails.error).toBe(true);
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

        var buildDetailViewSpy = spyOn(UI, 'buildDetailView');
        var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
        var successCallback;

        receiveWiringEvent(imageId);
        successCallback = JSTACK.Nova.getimagelist.calls.mostRecent().args[1];
        successCallback(respImageList);

        expect(buildDetailViewSpy).toHaveBeenCalled();
    });

    it('should build the default view after getting a 404 error', function () {

        var buildDefaultViewSpy = spyOn(UI, 'buildDefaultView');
        var imageId = 'id';
        var successCallback;

        receiveWiringEvent(imageId);
        successCallback = JSTACK.Nova.getimagelist.calls.mostRecent().args[1];
        successCallback(respImageList);

        expect(buildDefaultViewSpy).toHaveBeenCalled();
    });

    it('should call the error function when refresh is called without an image', function () {

        imageDetails.getImageDetails();

        expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "No image received yet."');
    });

    it('should call the error function when deleteImage is called without an image', function () {

        imageDetails.deleteImage();

        expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "No image received yet."');
    });

    it('should call the error function when refresh is called without an image', function () {

        imageDetails.updateImage();

        expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "No image received yet."');
    });

    it('should call JSTACK.Nova.getimagelist when refreshing', function () {
        
        var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';

        receiveWiringEvent(imageId);
        imageDetails.getImageDetails();

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

    it('should not call setTimeout the second time a wiring event is received', function () {

        var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
        var setTimeoutSpy = spyOn(window, 'setTimeout');

        receiveWiringEvent(imageId);
        getImageDetailsSuccess(respImageList);
        receiveWiringEvent(imageId);
        getImageDetailsSuccess(respImageList);

        expect(setTimeoutSpy.calls.count()).toEqual(1);
    });

    it('should call getimagelist 4 seconds after receiving the last update', function () {

        var expectedCount, callback;
        var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
        var setTimeoutSpy = spyOn(window, 'setTimeout');

        receiveWiringEvent(imageId);
        expectedCount = JSTACK.Nova.getimagelist.calls.count() + 1;
        getImageDetailsSuccess(respImageList);
        callback = setTimeoutSpy.calls.mostRecent().args[0];
        callback();

        expect(JSTACK.Nova.getimagelist.calls.count()).toEqual(expectedCount);
        expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 4000);

    });

    it('should have a refresh delay of 1 second after receiving an image with status other than active', function () {
        var expectedCount, callback;
        var imageId = '63f8a862-6bb0-40d9-90f1-a83c443b7e85';
        var setTimeoutSpy = spyOn(window, 'setTimeout');

        receiveWiringEvent(imageId);
        expectedCount = JSTACK.Nova.getimagelist.calls.count() + 1;
        getImageDetailsSuccess(respImageList);
        callback = setTimeoutSpy.calls.mostRecent().args[0];
        callback();

        expect(JSTACK.Nova.getimagelist.calls.count()).toEqual(expectedCount);
        expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 1000);
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

    it('should build the error view on failure', function () {

        var errorCallback;
        var imageId = 'id';
        var buildErrorViewSpy = spyOn(UI, 'buildErrorView').and.callThrough();
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

    it('should call JSTACK.Glance.updateimage', function () {

        var imageId = 'id';

        receiveWiringEvent(imageId);
        imageDetails.updateImage();

        expect(JSTACK.Glance.updateimage).toHaveBeenCalled();

    });

    it('should call the refresh function after an image is updated', function () {

        var imageId = 'id';
        var updateCallback;

        receiveWiringEvent(imageId);
        imageDetails.updateImage();
        updateCallback = JSTACK.Glance.updateimage.calls.mostRecent().args[4];
        updateCallback();

        expect(JSTACK.Nova.getimagelist).toHaveBeenCalled();

    });

    it('should call fillEditForm when the image is refreshed', function () {
        var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
        var fillEditFormSpy = spyOn(UI, 'fillEditForm');

        receiveWiringEvent(imageId);
        getImageDetailsSuccess(respImageList);

        expect(fillEditFormSpy).toHaveBeenCalled();
    });

});
