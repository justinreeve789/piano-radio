// Change "{}" to your options:
// https://github.com/sampotts/plyr/#options
const player = new Plyr('#embedded-player', {});

// Expose player so it can be used from the console.
// window.player = player;

$(document).ready(function() {
    $('input[type="range"]').each(function() {
        $(this).attr('data-val', $(this).val());
    });

    $('input[type="range"]').on('change', function() {
        $(this).attr('data-val', $(this).val());
    });

    $('.radio-play-button').on('click', function() {
        if (player.paused) {
            $(this).addClass('hide');
            player.play();
            player.currentTime = 135;
            $('#info').addClass('show-mostly');
            $('#player-box.site').addClass('show slow');
        }
    });

    $('.radio-options .collapse').on('click', function() {
        $('body').addClass('collapsed');
        $('#info').addClass('hide');
        $('#player-box #blank-overlay').addClass('background-transparent');
        $('#player-container').addClass('unblur');
        $('#collapsed-info-box').addClass('show');
    });

    $('#collapsed-info-box').on('click', function() {
        $('body').removeClass('collapsed');
        $('#info').removeClass('hide');
        $('#player-box #blank-overlay').removeClass('background-transparent');
        $('#player-container').removeClass('unblur');
        $('#collapsed-info-box').removeClass('show');
    });

    $('.radio-options .settings, .radio-options .close').on('click', function() {
        const flipcard = $(this).closest('.flip-card');
        const visualization = $('.track-visualization');

        if (flipcard.hasClass('flipped')) {
            flipcard.removeClass('flipped');
        } else {
            flipcard.addClass('flipped');
        }

        if (visualization.hasClass('hide')) {
            visualization.removeClass('hide');
        } else {
            visualization.addClass('hide');
        }
    });
});