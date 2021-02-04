/*
 TODO for drivers :
 - isPaused
 - getDuration
 - move them to their own files so we can build driver-specific embed snippets
 */
// TODO: make this the prototype and keep playInterval, currentTick, any other common vars here
PianoRadio.Drivers = {

    dispatchEvent: function (name, data, target) {

        data = data || {};
        var params = {
            detail: data,
            bubbles: true,
            cancelable: false
        };

        target.dispatchEvent(new CustomEvent(name, params));
    },

    recordInterval: function (start, end, target) {
        if (end > start || end === 'end') {
            PianoRadio.Drivers.dispatchEvent('pianoradio_log',
                {start: start, end: end}, target);
        }
    }
};