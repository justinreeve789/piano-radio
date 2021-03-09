<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Album;
use App\Models\Track;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index() {
        $model_name = '\\App\\Models\\Settings\\' . getenv('APP_SETTINGS_MODEL');
        $model = new $model_name();
        return ['tags' => $model->getAllTags()];
    }

    public function get($artist_id, $album_id, $track_id) {
        $artist = Artist::with('artistTags')->where('id', $artist_id)->first();
        $album = Album::with('albumTags')->where('id', $album_id)->first();
        $track = Track::with('trackTags')->where('id', $track_id)->first();

        return [
            'artist_tags' => $artist->artistTags,
            'album_tags' => $album->albumTags,
            'track_tags' => $track->trackTags,
        ];
    }

    public function create(Request $request, $type) {
        print_r($type);
        $id = $request->input('id');
        $tag = trim(strtolower($request->input('tag')));
        if (!is_numeric($id) || $tag == '') {
            return;
        }
        $model_name = '\\App\\Models\\' . ucfirst($type) . 'Tag';
        $model = new $model_name;
        $id_field = $type . '_id';
        $model->{$id_field} = $id;
        $model->tag = $tag;
        $model->save();
    }

    public function delete(Request $request, $type) {
        $id = $request->input('id');
        $tag = trim(strtolower($request->input('tag')));
        if (!is_numeric($id) || $tag == '') {
            return;
        }
        $model_name = '\\App\\Models\\' . ucfirst($type) . 'Tag';
        $id_field = $type . '_id';
        $model_name::where($id_field, $id)->where('tag', $tag)->delete();
    }
}