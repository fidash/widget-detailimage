var Utils = (function () {
    "use strict";

    function getDisplayableSize (size) {
        
        var unitChangeLimit = 1024;
        var units = [
            "B",
            "kiB",
            "MiB",
            "GiB",
            "TiB",
            "PiB",
            "EiB",
            "ZiB",
            "YiB",
        ];
        size = parseFloat(size);
        var displayableSize = size;
        var unit = 0;

        if (size < unitChangeLimit) {
            return size + ' ' + units[0];
        }

        while (parseFloat(displayableSize/unitChangeLimit) >= parseFloat(1) && unit < 9) {
            displayableSize /= unitChangeLimit;
            unit += 1;
        }

        return displayableSize.toFixed(2) + ' ' + units[unit];
    
    }

    function convertToGB (bytes) {

        var unitChangeLimit = 1024;
        var result = bytes;

        for (var i=0; i<3; i++) {
            result = parseFloat(result/unitChangeLimit);
        }

        return result;
    }

    return {
        getDisplayableSize: getDisplayableSize,
        convertToGB: convertToGB
    };
    
})();