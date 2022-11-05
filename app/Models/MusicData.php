<?php
/**
 * TODO: Analyze genre. See https://medium.com/towards-artificial-intelligence/music-genre-prediction-by-extracted-audio-features-and-comparison-to-the-spotify-api-ebf82232e31a
 */
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MusicData {
    protected $client_id;
    protected $client_secret;
    protected $redirect_uri;
    protected $session;
    protected $api;
    protected $access_token;
    protected $youtube;

    function __construct() {
        $this->youtube = new \Madcoda\Youtube\Youtube(['key' => getenv('GOOGLE_API_KEY')]);

        $this->session = new \SpotifyWebAPI\Session(
            getenv('SPOTIFY_CLIENT_ID'),
            getenv('SPOTIFY_CLIENT_SECRET'),
            getenv('SPOTIFY_REDIRECT_URI')
        );
        $this->api = new \SpotifyWebAPI\SpotifyWebAPI();

//      $access_token = \App\Models\Config::where('key', 'spotify_access_token')->value('value');
        $access_token = null;
        if ($access_token) {
            $this->access_token = $access_token;
        } else {
            $this->session->requestCredentialsToken();
            $this->access_token = $this->session->getAccessToken();
            $config = new \App\Models\Config();
            $config->key = 'spotify_access_token';
            $config->value = $this->access_token;
//          $config->save();
        }
        $this->api->setAccessToken($this->access_token);
    }

    /**
     * @param string $query
     * @return mixed
     */
    public function lookup($query) {
        $results = $this->api->search($query, 'track');
        return $results;
    }

    /**
     * @param string $query
     * @return mixed
     */
    public function getArtistByQuery($query) {
        $results = $this->api->search($query, 'artist');
        if (isset($results->artists->items[0])) {
            return $results->artists->items[0];
        }
    }

    /**
     * @param string $spotify_id
     * @return mixed
     */
    public function getArtistBySpotifyId($spotify_id) {
        $results = $this->api->getArtist($spotify_id);
        if (isset($results)) {
            return $results;
        }
    }

    /**
     * @param string $query
     * @return mixed
     */
    public function getAlbumByQuery($query) {
        $results = $this->api->search($query, 'album');
        if (isset($results->albums->items[0])) {
            return $results->albums->items[0];
        }
    }

    /**
     * TODO: Look up tracks in bulk (up to 50 as per Spotify's API), rather than one at a time.
     *
     * @param string $spotify_id
     * @return array
     */
    public function getTracksByAlbumSpotifyId($spotify_id) {
        if (is_string($spotify_id)) {
            $results = $this->api->getAlbumTracks($spotify_id);
            if (isset($results->items)) {
                return $results->items;
            }
        }
        return [];
    }

    /**
     * @param string $spotify_id
     * @return mixed
     */
    public function getAudioFeaturesByTrackSpotifyId($spotify_id) {
        $results = $this->api->getAudioFeatures($spotify_id);
        if (isset($results->audio_features[0])) {
            return $results->audio_features[0];
        }
    }

    /**
     * @param string $spotify_id
     * @return array
     */
    public function getAlbumsByArtistSpotifyId($spotify_id) {
        do {
            if (isset($results->next)) {
                $url = parse_url($results->next);
                parse_str($url['query'], $params);
            } else {
                $params = ['offset' => 0, 'limit' => 50, 'include_groups' => 'album,single'];
            }
            $results = $this->api->getArtistAlbums($spotify_id, $params);
        }
        while (isset($results->next) && trim($results->next) != '');
        if (isset($results->items)) {
            return $results->items;
        }
        return [];
    }

    /**
     * @param string $youtube_time
     * @return mixed
     */
    protected function convertYoutubeTime($youtube_time) {
        $youtube_duration = $youtube_time;
        $interval = new \DateInterval($youtube_duration);
        $milliseconds = 1000 * ($interval->h * 3600 + $interval->i * 60 + $interval->s);
        return $milliseconds;
    }

    protected function convertDuration($duration) {
        $parts = explode(':', $duration);
        if (!isset($parts[count($parts) - 2]) || !isset($parts[count($parts) - 1])) {
            return false;
        }
        return (1000 * (60 * $parts[count($parts) - 2] + $parts[count($parts) - 1]));
    }

    /**
     * @param \App\Models\Track $track
     * @return bool
     */
    public function getYoutubeForTrack($track) {
        if (is_integer($track)) {
            $track = Track::where('id', $track)->first();
        }

        // TODO: Use an eager-loaded relationship to get the artist.
        $artist = \DB::table('artists')
            ->join('artist_tracks', 'artists.id', '=', 'artist_tracks.artist_id')
            ->select('artists.*')
            ->where('artist_tracks.track_id', '=', $track->id)
            ->first();

        if (!$artist) {
            echo 'Artist not found for track ' . $track->id . '
';
            return false;
        }

        try {
            $results = json_decode(file_get_contents('http://localhost:8080/api/search?q=' . urlencode($artist->name . ' ' . $track->name)));
            if (empty($results->results)) {
                return false;
            }
            $result = $results->results[0];
        } catch (\Exception $e) {
            echo 'Could not parse:';
            print_r((array) $artist);
            print_r((array) $track);
            return false;
        }

        if (!$result) {
            echo 'Could not process ' . $artist->name . ' ' . $track->name . '
';
            return false;
        }

        // Make sure the artist and track name are somewhere in the description, channel title, or username.
        // TODO: Get rid of non-alphanumeric and whitespace more efficiently.
        // TODO: Check the first three results, in case the first or second one doesn't work.
        for ($i = 0; $i <= 3; $i++) {
            if (!isset($results->results[$i]) || $i > 2) {
                return false;
            }
            $result = $results->results[$i];

            try {
                if (!isset($result->video)) {
                    echo 'Skipping non-video result for ' . $artist->name . ' - ' . $track->name . '
';
                    continue;
                }

                $title = trim(strtolower(preg_replace("/[^0-9a-zA-Z]/", "", $result->video->title)));
                $description = trim(strtolower(preg_replace("/[^0-9a-zA-Z]/", "", strip_tags($result->video->snippet))));
                $username = trim(strtolower(preg_replace("/[^0-9a-zA-Z]/", "", $result->uploader->username)));
                $artist_name = trim(strtolower(preg_replace("/[^0-9a-zA-Z]/", "", $artist->name)));
                $track_name = trim(strtolower(preg_replace("/[^0-9a-zA-Z]/", "", $track->name)));

                $title = trim(preg_replace('/\s\s+/', ' ', $title));
                $description = trim(preg_replace('/\s\s+/', ' ', $description));
                $username = trim(preg_replace('/\s\s+/', ' ', $username));
                $artist_name = trim(preg_replace('/\s\s+/', ' ', $artist_name));
                $track_name = trim(preg_replace('/\s\s+/', ' ', $track_name));

                if (strpos($title, $artist_name) === false &&
                    strpos($description, $artist_name) === false &&
                    strpos($username, $artist_name) === false) {
                    continue;
                }

                if (strpos($title, $track_name) === false &&
                    strpos($description, $track_name) === false) {
                    continue;
                }

                // TODO: If "- Topic" is at the end of the channel title, assume this is an official channel provided by the distributor.

                // Get the video details. Check the duration.
                $video_id = $result->video->id;
                $channel_id = substr(substr($result->uploader->url, strrpos($result->uploader->url, '/')), 1);
                if (!$duration_ms = $this->convertDuration($result->video->duration)) {
                    continue;
                }

                // Make sure the duration is within an acceptable range.
                $tolsec_after = getenv('TOLERANCE_MILLISECONDS_AFTER');
                $tolsec_before = getenv('TOLERANCE_MILLISECONDS_BEFORE');
                if (!$tolsec_after) {
                    $tolsec_after = 6000;
                }
                if (!$tolsec_before) {
                    $tolsec_before = 4000;
                }
                if ($track->duration_ms < $duration_ms - $tolsec_before || $track->duration_ms > $duration_ms + $tolsec_after) {
                    echo 'Mismatched duration for ' . $artist->name . ' - ' . $track->name . ': ' . $duration_ms . ' vs. ' . $track->duration_ms . ' - tolerance before: ' . $tolsec_before . ' to tolerance after: ' . $tolsec_after . '
';
                    continue;
                }

                // We have a working result, so let's break out of here.
                break;
            } catch (\Exception $e) {
                echo 'Does not match ' . $artist->name . ' ' . $track->name . '
';
                print_r($result);
                return false;
            }
        }

        // $duration = $video->contentDetails->duration;
        // $duration_ms = $this->convertYoutubeTime($duration);
        // $privacy_status = $video->status->privacyStatus;
        // $embeddable = $video->status->embeddable;

        // Check if we already have the artist site.
        // TODO: Fix the URL.
        $site = ArtistSite::where('type', 'youtube')->where('external_id', $channel_id)->first();
        if (!$site) {
            $site = new ArtistSite();
            $site->artist_id = $artist->id;
            $site->type = 'youtube';
            $site->external_id = $channel_id;

            if (substr($channel_id, 0, 2) == 'UC') {
                $site->url = 'https://www.youtube.com/channel/' . $channel_id;
            } else {
                $site->url = 'https://www.youtube.com/user/' . $channel_id;
            }

            $site->save();
        }

        // Add the track source.
        $track_source = new TrackSource();
        $track_source->track_id = $track->id;
        $track_source->type = 'youtube';
        $track_source->external_id = $video_id;
        $track_source->site_id = $site->id;
        $track_source->duration_ms = $duration_ms;
        $track_source->url = 'https://youtube.com/watch?v=' . $video_id;
        $track_source->save();

        echo $artist->name . ' - ' . $track->name . '
';
        return true;
    }

    /**
     * @param \App\Models\Track $track
     * @return bool
     */
    public function getSoundCloudForTrack($track) {
        // Don't continue if the track source already exists.
        if (TrackSource::where('type', 'soundcloud')->where('track_id', $track->id)->exists()) {
            return;
        }

        // Loop through all artists associated with the track.
        $artists = \DB::table('artists')
            ->join('artist_tracks', 'artists.id', '=', 'artist_tracks.artist_id')
            ->select('artists.*')
            ->where('artist_tracks.track_id', $track->id)
            ->get();
        foreach ($artists as $artist) {
            $artist->name = str_replace("'", "", $artist->name);
            $artist->name = str_replace('"', '', $artist->name);
            $track->name = str_replace("'", "", $track->name);
            $track->name = str_replace('"', '', $track->name);
            $query = preg_replace("/[^a-zA-Z0-9]+/", ' ', $artist->name) . ' ' . preg_replace("/[^a-zA-Z0-9]+/", ' ', $track->name);
            $cmd = 'youtube-dl -s -J --no-playlist scsearch10:"' . $query . '"';
            $json = shell_exec($cmd);
            $results = json_decode($json);
            if (empty($results)) {
                echo 'No result found for ' . $artist->name . ' - ' . $track->name . '
';
                continue;
            }

            if (empty($results->entries)) {
                echo 'No entries found for ' . $artist->name . ' - ' . $track->name . '
';
                continue;
            }

            foreach ($results->entries as $result) {
                // Make sure the duration is within an acceptable range.
                $duration_ms = $result->duration * 1000;
                $tolsec_after = getenv('TOLERANCE_MILLISECONDS_AFTER');
                $tolsec_before = getenv('TOLERANCE_MILLISECONDS_BEFORE');
                if (!$tolsec_after) {
                    $tolsec_after = 2000;
                }
                if (!$tolsec_before) {
                    $tolsec_before = 2000;
                }

                if ($track->duration_ms < $duration_ms - $tolsec_before || $track->duration_ms > $duration_ms + $tolsec_after) {
                    echo 'Mismatched duration for ' . $artist->name . ' - ' . $track->name . ': ' . $duration_ms . ' vs. ' . $track->duration_ms . ' - tolerance before: ' . $tolsec_before . ' to tolerance after: ' . $tolsec_after . '
';
                    continue;
                }

                $title = trim(strtolower(preg_replace("/[^0-9a-zA-Z]/", "", $result->title)));
                $description = trim(strtolower(preg_replace("/[^0-9a-zA-Z]/", "", strip_tags($result->description))));
                $artist_name = trim(strtolower(preg_replace("/[^0-9a-zA-Z]/", "", $artist->name)));
                $track_name = trim(strtolower(preg_replace("/[^0-9a-zA-Z]/", "", $track->name)));

                $title = trim(preg_replace('/\s\s+/', ' ', $title));
                $description = trim(preg_replace('/\s\s+/', ' ', $description));
                $artist_name = trim(preg_replace('/\s\s+/', ' ', $artist_name));
                $track_name = trim(preg_replace('/\s\s+/', ' ', $track_name));

                if ($artist_name == '' || $track_name == '') {
                    echo 'Skipping source, since we have a blank artist or track after alphanumeric replacement.
';
                    continue;
                }

                $external_id3 = null;
                if (strpos($title, $artist_name) === false &&
                    strpos($description, $artist_name) === false) {
                    $external_id3 = 'notaperfectmatch';
                }

                if (strpos($title, $track_name) === false &&
                    strpos($description, $track_name) === false) {
                    $external_id3 = 'notaperfectmatch';
                }

                // We have a match, so let's add the record if it doesn't exist.
                $track_source = TrackSource::where('type', 'soundcloud')->where('track_id', $track->id)->first();

                if ($track_source) {
                    echo 'Skipping source, since it already exists for ' . $artist->name . ' - ' . $track->name . ' (' . $track->id . ' ' . $result->id . ') at ' . $result->webpage_url . '
';
                    continue;
                }

                echo 'Saving record for ' . $artist->name . ' - ' . $track->name . '
';
                $currenttime = time();
                $track_source = new TrackSource();
                $track_source->track_id = $track->id;
                $track_source->type = 'soundcloud';
                $track_source->external_id = $result->id;
                $track_source->external_id2 = $result->uploader_id;
                $track_source->external_id3 = $external_id3;
                $track_source->url = $result->webpage_url;
                $track_source->duration_ms = $duration_ms;
                $track_source->created_at = $currenttime;
                $track_source->updated_at = $currenttime;
                $track_source->save();
                break;
            }
        }
    }
}