/******/ (() => { // webpackBootstrap
/*!******************************!*\
  !*** ./resources/js/load.js ***!
  \******************************/
// Change "{}" to your options:
// https://github.com/sampotts/plyr/#options
// Expose player so it can be used from the console.
// window.player = player;
$(document).ready(function () {
  var player = new Plyr('#embedded-player', {});
  $('input[type="range"]').each(function () {
    var attr = 'data-setting-' + $(this).attr('name');
    var val = $(this).val();
    $(this).attr('data-val', $(this).val());
    $(this).closest('.radio-settings').attr(attr, val);
  });
  $('input[type="range"]').on('input', function () {
    var attr = 'data-setting-' + $(this).attr('name');
    var val = $(this).val();
    $(this).attr('data-val', $(this).val());
    $(this).closest('.radio-settings').attr(attr, val);
  });
  $('.radio-play-button').on('click', function () {
    if (player.paused) {
      $(this).addClass('hide').addClass('shrink');
      player.play();
      player.currentTime = 60;
      $('#info').addClass('show-mostly');
      $('#player-box.site').addClass('show slow');
    }
  });
  $('.radio-options .collapse').on('click', function () {
    $('body').addClass('collapsed');
    $('#info').addClass('hide');
    $('#collapsed-track-playing .track-container').html($('#track-playing .track-row').clone());
    $('#player-box #blank-overlay').addClass('background-transparent');
    $('#player-container').addClass('unblur');
    $('#collapsed-track-playing').addClass('show');
  });
  $('#collapsed-track-playing').on('click', function () {
    $('body').removeClass('collapsed');
    $('#info').removeClass('hide');
    $('#collapsed-track-playing').removeClass('show');
    $('#player-box #blank-overlay').removeClass('background-transparent');
    $('#player-container').removeClass('unblur');
  });
  $('.radio-options .settings, .radio-options .close').on('click', function () {
    var flipcard = $(this).closest('.flip-card');
    var visualization = $('.track-visualization');

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
/******/ })()
;