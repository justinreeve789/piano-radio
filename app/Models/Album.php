<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Album extends Model
{
    use HasFactory;

    public function tracks() {
        return $this->hasMany('App\Models\Track');
    }

    public function albumTags() {
        return $this->hasMany('App\Models\AlbumTag');
    }

    public function saveFromSpotifyData($data) {
        $this->name = $data->name;
        $this->total_tracks = $data->total_tracks;
        $this->image_url = isset($data->images[0]) ? $data->images[0]->url : null;
        $this->release_date = date('Y-m-d', strtotime($data->release_date));
        $this->spotify_id = $data->id;
        $this->save();
    }

    public function fixData() {
        // Update track count.
        if ($this->total_tracks == 0) {
            $tracks = Track::where('album_id', $this->id)->get();
            $this->total_tracks = count($tracks);
        }

        // If we're not dealing with a Spotify album, renumber the tracks if necessary.
        if ($this->spotify_id === null) {
            $renumber = false;
            $highest_number = 0;
            foreach ($tracks as $track) {
                $highest_number = $track->track_number;
                if ($track->spotify_id !== null) {
                    continue;
                }
                if ($track->track_number == 0) {
                    $renumber = true;
                }
            }

            if ($renumber === true) {
                // Loop through them again, and this time start with the highest track number.
                foreach ($tracks as $track) {
                    if ($track->spotify_id === null && $track->track_number == 0) {
                        $track->track_number = ++$highest_number;
                        $track->save();
                    }
                }
            }
        }

        // Update album image if one is missing. Use the first track.
        if (!$this->image_url) {
            $ts = TrackSource::where('type', 'youtube',)->where('track_id', $tracks[0]->id)->first();
            if ($ts) {
                $yt = new YoutubeParse();
                $image_url = $yt->getImageForUrl($ts->url);
                if ($image_url) {
                    $this->image_url = $image_url;
                }
            }
        }

        $this->save();
    }
}