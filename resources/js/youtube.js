PianoRadio.Drivers.YouTube = function(embedSnippet) {

    /*
     @see https://developers.google.com/youtube/iframe_api_reference
     @see https://en.wikipedia.org/wiki/HTML5_video
     @see http://www.w3.org/2010/05/video/mediaevents.html
     @see http://stackoverflow.com/questions/26245049/does-youtube-iframe-api-have-an-event-that-fires-continuously-during-playback
     @see http://stackoverflow.com/questions/29293877/how-to-listen-to-seek-event-in-youtube-embed-api
     */
    var snippet=embedSnippet,
        hostedId,
        player,
        currentTick = 0,
        playIntervalStart = 0;

    init();

    function init() {
        hostedId = snippet.getAttribute('data-hosted-id');

        var players = plyr.setup({
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions'],
        });
        var firstPlayer = players[0];

        firstPlayer.on('ready', function(evt) {
            player = evt.detail.plyr;

            player.on('timeupdate', function(e) {
                // This is kind of a dumb workaround, but since this event may occur before the "seeking" event, and thus
                // preventing us from getting a proper "fromTime," we're giving this a 1-second buffer before updating
                // anything. If the timeupdate is less than 1 second, the user probably didnt seek anywhere.
                if (e.detail.plyr.getCurrentTime() < currentTick + 1 && e.detail.plyr.getCurrentTime() > currentTick)
                {
                    var rounded = Math.round(e.detail.plyr.getCurrentTime());
                    if (rounded > currentTick) {
                        currentTick = rounded;
                        PianoRadio.Drivers.dispatchEvent('PianoRadio_progress', {
                            tick : currentTick
                        }, embedSnippet);
                    }
                }
            });

            player.on('waiting', function(e) {
                // TODO: Do we have to show a loader ?!
            });

            player.on('play', function(e) {
                playIntervalStart = currentTick;
                PianoRadio.Drivers.dispatchEvent('PianoRadio_play', null, embedSnippet);
            });

            player.on('pause', function(e) {
                PianoRadio.Drivers.recordInterval(playIntervalStart, currentTick, embedSnippet);
                playIntervalStart = currentTick;
                PianoRadio.Drivers.dispatchEvent('PianoRadio_pause', null, embedSnippet);
            });

            player.on('ended', function(e) {
                PianoRadio.Drivers.recordInterval(playIntervalStart, 'end', embedSnippet);
                playIntervalStart = 0;
                PianoRadio.Drivers.dispatchEvent('PianoRadio_end', null, embedSnippet);
            });

            player.on('seeking', function(e) {
                var fromTime = currentTick,
                    toTime = Math.floor(e.detail.plyr.getCurrentTime());

                PianoRadio.Drivers.recordInterval(playIntervalStart, currentTick, embedSnippet);
                playIntervalStart = currentTick = toTime;
                PianoRadio.Drivers.dispatchEvent('PianoRadio_seek', {
                    to : e.detail.plyr.getCurrentTime(),
                    from : fromTime,
                }, embedSnippet);
            });
        });
    }

    var play = function() {
        player.play();
    };

    var seek = function(to) {
        player.seek(to);
    };

    var pause = function() {
        // If an element is loaded at the beginning, we won't have the YT object in the workflow yet, but it
        // won't need to be paused anyway. Make sure player exists.
        if (typeof player !== undefined && player != null)
        {
            if (player.pause)
                player.pause();
        }
    };

    var replace = function(newId) {

        clearEvents();

        // this actually plays the video, not what we want
        //player.loadVideoById({
        //    'videoId': newId
        //    //'suggestedQuality': 'large'
        //});

        // fixme - add all the proper options to the url...
        //var url = 'https://www.youtube.com/v/'+newId+'?version=3';
        //player.cueVideoByUrl({
        //    mediaContentUrl: url
        //});

        player.YT.cueVideoById({
            'videoId': newId
        });
        init();
    };

    var fullscreen = function() {
        // If we're on a mobile device, force fullscreen when played.
        if (PianoRadio.Utils.isMobile() == false) {
        }
    }


    var clearEvents = function() {
//		player.removeEvent('onStateChange');
//		player.removeEvent('onError');
        player.removeEventListener('loadedmetadata');
        player.removeEventListener('timeupdate');
        player.removeEventListener('play');
        player.removeEventListener('pause');
        player.removeEventListener('ended');
    };

    return {
        id : function() {
            return hostedId;
        },
        time : function() {
            return currentTick;
        },
        play : play,
        pause : pause,
        seek : seek,
        replace : replace
    };
};