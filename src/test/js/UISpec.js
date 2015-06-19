describe("User Interface", function () {
	"use strict";

	var respServices = null;
    var respImageList = null;
    var imageDetails;
	var units = [
        {
            "unit": "B",
            "bytes": 1,
            "expected": "1 B"
        },
        {
            "unit": "kiB",
            "bytes": 1024,
            "expected": "1.00 kiB"
        },
        {
            "unit": "kiB",
            "bytes": 135821,
            "expected": "132.64 kiB"
        },
        {
            "unit": "MiB",
            "bytes": 1048576,
            "expected": "1.00 MiB"
        },
        {
            "unit": "MiB",
            "bytes": 12358468,
            "expected": "11.79 MiB"
        },
        {
            "unit": "GiB",
            "bytes": 1073741824,
            "expected": "1.00 GiB"
        },
        {
            "unit": "GiB",
            "bytes": 4532282751,
            "expected": "4.22 GiB"
        },
        {
            "unit": "TiB",
            "bytes": 1.099511628e12,
            "expected": "1.00 TiB"
        },
        {
            "unit": "TiB",
            "bytes": 5423864125103,
            "expected": "4.93 TiB"
        },
        {
            "unit": "PiB",
            "bytes": 1.125899907e15,
            "expected": "1.00 PiB"
        },
        {
            "unit": "PiB",
            "bytes": 1452687412365789,
            "expected": "1.29 PiB"
        },
        {
            "unit": "EiB",
            "bytes": 1.152921505e18,
            "expected": "1.00 EiB"
        },
        {
            "unit": "EiB",
            "bytes": 4125369753962148752,
            "expected": "3.58 EiB"
        },
        {
            "unit": "ZiB",
            "bytes": 1.180591621e21,
            "expected": "1.00 ZiB"
        },
        {
            "unit": "ZiB",
            "bytes": 4756123651742368426957,
            "expected": "4.03 ZiB"
        },
        {
            "unit": "YiB",
            "bytes": 1.20892582e24,
            "expected": "1.00 YiB"
        },
        {
            "unit": "YiB",
            "bytes": 5123698741236987412369874,
            "expected": "4.24 YiB"
        }
    ];

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

    units.forEach(function (unit) {
        it('should display image size in ' + unit.unit, function () {
            
            var imageData = respImageList.images[0];

            imageData.size = unit.bytes;
            UI.buildDetailView(imageData);

            expect($('#image-size > span')).toContainText(unit.expected);
        });
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
        
        UI.buildDetailView(imageData);

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
        
        UI.buildDetailView(imageData);

        for (var field in fields) {
            expect($('#image-' + field + ' > span')).toContainText(fields[field]);
        }

        expect($('#image-name')).toContainText(imageName);
        expect($('#image-status').attr('data-original-title')).toEqual(statusTitle);
    });
    
    it('should build build the detailed view with a protected image', function () {

        var imageData = respImageList.images[2];
        
        UI.buildDetailView(imageData);

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

    it('should call JSTACK.Nova.getimagelist when a click event is triggered on the refresh button', function () {

        var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
        var eventSpy = spyOnEvent('#refresh-button', 'click');
        var setTimeoutSpy = spyOn(window, 'setTimeout');
        
        receiveWiringEvent(imageId);

        $('#refresh-button').trigger('click');

        expect(eventSpy).toHaveBeenTriggered();
        expect(JSTACK.Nova.getimagelist).toHaveBeenCalled();
        expect(setTimeoutSpy).not.toHaveBeenCalled();

    });

    it('should call JSTACK.Nova.deleteimage when a click event is triggered on the terminate button', function () {

        var eventSpy = spyOnEvent('#delete-button', 'click');
        var imageId = 'id';
        var service = JSTACK.Keystone.getservice(JSTACK.Nova.params.service);
        var deleteURL = JSTACK.Comm.getEndpoint(service, "Spain2", JSTACK.Nova.params.endpointType) + '/images/' + imageId;

        receiveWiringEvent(imageId);
        
        $('#delete-button').trigger('click');

        expect('click').toHaveBeenTriggeredOn('#delete-button');
        expect(MashupPlatform.http.makeRequest).toHaveBeenCalledWith(deleteURL, jasmine.any(Object));
    });

    it('should build the edit view', function () {
        var image = respImageList.images[0];

        UI.buildEditView(image);

        expect('#edit-view').not.toHaveClass('hide');
    });

    it('should build the edit after clicking in the edit button', function () {
        var imageId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
        var eventSpy = spyOnEvent('#edit-button', 'click');
        var buildEditViewSpy = spyOn(UI, 'buildEditView');

        receiveWiringEvent(imageId);
        $('#edit-button').trigger('click');

        expect('click').toHaveBeenTriggeredOn('#edit-button');
        expect(buildEditViewSpy).toHaveBeenCalledWith(imageDetails.currentImage);
    });

    it('should not build the details view while the edit view is opened', function () {
        var image = respImageList.images[0];

        UI.buildEditView(image);
        UI.buildDetailView(image);

        expect('#detail-view').toHaveClass('hide');
    });

    it('should call the imageUpdate function after clicking in the update button', function () {
        var callbacks = jasmine.createSpyObj('callbacks', ['refresh', 'update', 'delete']);
        var eventSpy = spyOnEvent('#update-image', 'click');

        UI.init(callbacks, respImageList.images[0]);
        $('#update-image').trigger('click');

        expect('click').toHaveBeenTriggeredOn('#update-image');
        expect(callbacks.update).toHaveBeenCalled();
    });

    it('should close the edit view and build the detail view after updating the image', function () {
        var callbacks = jasmine.createSpyObj('callbacks', ['refresh', 'update', 'delete']);
        var eventSpy = spyOnEvent('#update-image', 'click');

        UI.init(callbacks, respImageList.images[0]);
        $('#update-image').trigger('click');

        expect('click').toHaveBeenTriggeredOn('#update-image');
        expect('#edit-view').toHaveClass('hide');
    });

    it('should close the edit view and build the details view after closing the edit view', function () {
        var callbacks = jasmine.createSpyObj('callbacks', ['refresh', 'update', 'delete']);
        var eventSpy = spyOnEvent('#close-edit', 'click');

        UI.init(callbacks, respImageList.images[0]);
        $('#close-edit').trigger('click');

        expect('click').toHaveBeenTriggeredOn('#close-edit');
        expect('#edit-view').toHaveClass('hide');
        expect(callbacks.refresh).toHaveBeenCalled();
        expect('#detail-view').not.toHaveClass('hide');
    });
});