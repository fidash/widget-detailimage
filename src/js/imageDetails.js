/* global UI MashupPlatform */

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
                    onError({message: "Error 404", body: "Image with ID " + this.imageId + " does not exist."});
                    return;
                }

                this.currentImage = JSON.parse(imageData);
                callback(imageData);
            }.bind(this);

            JSTACK.Nova.getimagelist(true, onOk, onError, "Spain2");
        },

        deleteImage: function deleteImage (callback, onError) {
            
            //JSTACK.Nova.deleteimage(this.imageId, callback, onError, "Spain2");
            var service = JSTACK.Keystone.getservice(JSTACK.Nova.params.service);
            var url = JSTACK.Comm.getEndpoint(service, "Spain2", JSTACK.Nova.params.endpointType);
            var deleteUrl = url + '/images/' + this.imageId;
            var headers = {
                "X-Auth-Token": JSTACK.Keystone.params.token
            };

            MashupPlatform.http.makeRequest(deleteUrl, {
                method: 'DELETE',
                requestHeaders: headers,
                onSuccess: callback,
                onFailure: onError
            });
            
        },

        updateImage: function updateImage (name, is_public, callback, onError) {
            JSTACK.Glance.updateimage(this.currentImage.id, name, is_public, undefined, callback, onError, "Spain2");
        }
    };


    return ImageDetails;

})(JSTACK);
