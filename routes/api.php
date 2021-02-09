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

    // Route::resource('/track', TrackController::class);
    Route::prefix('track')->group(function() {
        Route::get('/next', 'App\Http\Controllers\TrackController@next');
        Route::post('/rate', [TrackController::class, 'rate']);
        Route::post('/tag', [TagController::class, 'create']);
        Route::delete('/tag', [TagController::class, 'delete']);
    });

    Route::resource('/album', AlbumController::class);
    Route::prefix('/album')->group(function() {
        Route::post('/rate', [AlbumController::class, 'rate']);
        Route::post('/tag', [TagController::class, 'create']);
        Route::delete('/tag', [TagController::class, 'delete']);
    });

    Route::resource('/artist', ArtistController::class);
    Route::prefix('/artist')->group(function() {
        Route::post('/rate', [ArtistController::class, 'rate']);
        Route::post('/tag', [TagController::class, 'create']);
        Route::delete('/tag', [TagController::class, 'delete']);
    });
});