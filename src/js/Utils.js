var Utils = (function () {
    "use strict";

    function getDisplayableSize (size) {
        
        var unitChangeLimit = 1024;
        var units = [
            "B",
            "KiB",
            "MiB",
            "GiB",
            "TiB",
            "PiB",
            "EiB",
            "ZiB",
            "YiB",
        ];

        var displayableSize = parseFloat(size);
        var unit = 0;

        if (displayableSize < unitChangeLimit) {
            return displayableSize + ' ' + units[0];
        }

        while (parseFloat(displayableSize/unitChangeLimit) >= parseFloat(1) && unit < 9) {
            displayableSize /= unitChangeLimit;
            unit += 1;
        }

        return displayableSize.toFixed(2) + ' ' + units[unit];
    
    }

    function byteToGiB (bytes) {

        var unitChangeLimit = 1024;
        var result = bytes;

        for (var i=0; i<3; i++) {
            result = parseFloat(result/unitChangeLimit);
        }

        return result;
    }

    return {
        getDisplayableSize: getDisplayableSize,
        byteToGiB: byteToGiB
    };
    
})();