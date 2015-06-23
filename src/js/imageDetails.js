/* global UI MashupPlatform */

var ImageDetails = (function (JSTACK) {
    "use strict";

    /*****************************************************************
    *                      C O N S T R U C T O R                     *
    *****************************************************************/  

    function ImageDetails () {
        
        this.delay = 4000;
        this.error = false;
        this.firstRefresh = true;

    }


    /*****************************************************************
    *                          P R I V A T E                         *
    *****************************************************************/

    function hasReceivedImage () {
        return this.imageId && this.region;
    }

    function drawDetails (autoRefresh, imageData) {
        
        imageData = JSON.parse(imageData);

        // Build view
        UI.buildDetailView(imageData);

        // Recalculate refresh delay
        this.delay = imageData.status !== "active" ? 1000 : 4000;

        if (autoRefresh && !this.error) {
            setTimeout(function () {
                   this.getImageDetails(drawDetails.bind(this, true), onError.bind(this));
            }.bind(this), this.delay);
        }

    }

    function resetInterface () {
        this.error = true;
        UI.buildDefaultView();
    }

    function onError (errorResponse) {

        // Build default view if error is 404
        if (errorResponse.message === 'Error 404') {
            UI.buildDefaultView();
        }
        else {
            this.error = true;
            UI.buildErrorView(errorResponse);
            MashupPlatform.widget.log('Error: ' + JSON.stringify(errorResponse));
        }

    }

    function receiveImageId (wiringData) {
        wiringData = JSON.parse(wiringData);

        JSTACK.Keystone.params.access = wiringData.access;
        JSTACK.Keystone.params.token = wiringData.token;
        JSTACK.Keystone.params.currentstate = 2;
        JSTACK.Keystone.params.version = 3;

        this.imageId = wiringData.id;
        this.region = wiringData.region;
        this.error = false;
        this.getImageDetails(this.firstRefresh);
        this.firstRefresh = false;
    }


    /*****************************************************************
    *                           P U B L I C                          *
    *****************************************************************/

    ImageDetails.prototype = {

        init: function init () {

            var callbacks = {
                refresh: this.getImageDetails.bind(this),
                delete: this.deleteImage.bind(this),
                update: this.updateImage.bind(this)
            };

            // Register callback for input endpoint
            MashupPlatform.wiring.registerCallback('image_id', receiveImageId.bind(this));

            UI.init(callbacks, this.currentImage);

        },

        getImageDetails: function getImageDetails (autoRefresh) {

            if (!hasReceivedImage.call(this)) {
                onError.call(this,"No image received yet.");
                return;
            }

            var onOk = function onOk (response) {

                var imageData, image;
                
                for (var i=0; i<response.images.length; i++) {
                    image = response.images[i];

                    if (image.id === this.imageId) {
                        imageData = JSON.stringify(image);
                        break;
                    }
                }

                if (!imageData) {
                    onError.call(this,{message: "Error 404", body: "Image with ID " + this.imageId + " does not exist."});
                    return;
                }

                this.currentImage = JSON.parse(imageData);
                drawDetails.call(this, autoRefresh, imageData);
            }.bind(this);

            JSTACK.Nova.getimagelist(true, onOk, onError.bind(this), this.region);
        },

        deleteImage: function deleteImage () {

            if (!hasReceivedImage.call(this)) {
                onError.call(this,"No image received yet.");
                return;
            }
            
            //JSTACK.Nova.deleteimage(this.imageId, callback, onError, "Spain2");
            var service = JSTACK.Keystone.getservice(JSTACK.Nova.params.service);
            var url = JSTACK.Comm.getEndpoint(service, this.region, JSTACK.Nova.params.endpointType);
            var deleteUrl = url + '/images/' + this.imageId;
            var headers = {
                "X-Auth-Token": JSTACK.Keystone.params.token
            };

            MashupPlatform.http.makeRequest(deleteUrl, {
                method: 'DELETE',
                requestHeaders: headers,
                onSuccess: resetInterface.bind(this),
                onFailure: onError.bind(this)
            });
            
        },

        updateImage: function updateImage () {

            if (!hasReceivedImage.call(this)) {
                onError.call(this,"No image received yet.");
                return;
            }

            var name = $('#image-name-form').val();
            var is_public = $('#image-is_public-form').val();
            var min_ram = $('#image-min-ram-form').val();
            var min_disk = $('#image-min-disk-form').val();

            JSTACK.Glance.updateimage(this.imageId, name, is_public, undefined, this.getImageDetails.bind(this, false), onError.bind(this), this.region);
        }
    };


    return ImageDetails;

})(JSTACK);
