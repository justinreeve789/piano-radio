<?php

use App\Http\Controllers\PagesController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', 'App\Http\Controllers\PagesController@index');
Route::get('/sitemap', 'App\Http\Controllers\PagesController@sitemap');
Route::get('/artist/{id}', 'App\Http\Controllers\PagesController@artist');
Route::get('/radio/{type}/{id}', 'App\Http\Controllers\PagesController@radio');
Route::get('/{any}', 'App\Http\Controllers\PagesController@radio')->where('any', '.*');
