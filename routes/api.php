<?php

use App\Http\Controllers\AlbumController;
use App\Http\Controllers\ArtistController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TrackController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::prefix('v1')->group(function() {
//    Route::middleware('auth:api')->get('/user', function (Request $request) {
//        return $request->user();
//    });

    Route::get('/stats', 'App\Http\Controllers\PagesController@stats');

    Route::post('/{type}/tag', [TagController::class, 'create']);
    Route::delete('/{type}/tag', [TagController::class, 'delete']);

    Route::prefix('track')->group(function() {
        Route::get('/', 'App\Http\Controllers\TrackController@getTrackSchedule');
        Route::get('/next', 'App\Http\Controllers\TrackController@next');
        Route::post('/rate', [TrackController::class, 'rate']);
        Route::post('/usable', [TrackController::class, 'toggleUsability']);
        Route::get('/{track_id}', 'App\Http\Controllers\TrackController@get');
    });

    Route::resource('/album', AlbumController::class);
    Route::prefix('/album')->group(function() {
        Route::post('/rate', [AlbumController::class, 'rate']);
        Route::post('/usable', [AlbumController::class, 'toggleUsability']);
        Route::get('/{album_id}', 'App\Http\Controllers\AlbumController@get');
    });

    Route::resource('/artist', ArtistController::class);
    Route::prefix('/artist')->group(function() {
        Route::post('/rate', [ArtistController::class, 'rate']);
        Route::post('/usable', [ArtistController::class, 'toggleUsability']);
        Route::get('/{artist_id}', 'App\Http\Controllers\ArtistController@artist_id');
    });

    Route::prefix('/tag')->group(function() {
        Route::get('/', 'App\Http\Controllers\TagController@index');
        Route::get('/{artist_id}/{album_id}/{track_id}', 'App\Http\Controllers\TagController@get');
    });
});