/* global ImageDetail UI receiveImageId */

describe('Test image details', function () {
	"use strict";

	var respServices = null;
	console.log("root" + JSON.stringify(JSTACK));

	beforeEach(function () {
		jasmine.getJSONFixtures().fixturesPath = 'src/test/fixtures/json';
		respServices = getJSONFixture('respServices.json');
	});

	it('should have called getimagedetail', function () {

		console.log("first" + JSON.stringify(JSTACK));

		var imageId = 'id';
		var access = respServices.access;
		var wiringData = {
			'id': imageId,
			'access': access
		};
		wiringData = JSON.stringify(wiringData);
		
		var ui = new UI();
		var receiveImageId = MashupPlatform.wiring.registerCallback.calls.mostRecent().args[0];

		receiveImageId(wiringData);

		console.log(JSON.stringify(JSTACK));
		expect(JSTACK.Nova.getimagedetail).tohaveBeenCalled();
	});
});