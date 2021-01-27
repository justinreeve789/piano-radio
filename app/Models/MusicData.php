<?php

namespace App\Models;

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
        $results = $this->api->getAlbumTracks($spotify_id);
        if (isset($results->items)) {
            return $results->items;
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
        $results = $this->api->getArtistAlbums($spotify_id);
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
        $seconds = $interval->h * 3600 + $interval->i * 60 + $interval->s;
        return $seconds;
    }

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

        $info = $this->youtube->searchVideos($artist->name . ' ' . $track->name);

        // Make sure the artist and track name are somewhere in the description or channel title.
        $result = $info[0];
        if (strpos(strtolower($result->snippet->description), strtolower($artist->name)) === false &&
            strpos(strtolower($result->snippet->title), strtolower($artist->name)) === false &&
            strpos(strtolower($result->snippet->channelTitle), strtolower($artist->name)) === false) {
            return false;
        }

        if (strpos(strtolower($result->snippet->description), strtolower($track->name)) === false &&
            strpos(strtolower($result->snippet->title), strtolower($track->name)) === false &&
            strpos(strtolower($result->snippet->channelTitle), strtolower($track->name)) === false) {
            return false;
        }

        // If "- Topic" is at the end of the channel title, assume this is an official channel provided by the distributor.
        if (substr($result->snippet->channelTitle, -7) == '- Topic') {
            $distributor_channel = true;
        }

        // Get the video details.
        $video = $this->youtube->getVideoInfo($result->id->videoId);
        $channel_id = $video->snippet->channelId;
        $duration = $video->contentDetails->duration;
        $duration_ms = $this->convertYoutubeTime($duration) * 1000;
        $privacy_status = $video->status->privacyStatus;
        $embeddable = $video->status->embeddable;

        // Make sure the duration is within an acceptable range.
        if ($track->duration < $duration_ms - 2000 || $track->duration > $duration_ms + 10000) {
            return false;
        }

        // Check if we already have the artist site.
        // TODO: Fix the URL.
        $site = ArtistSite::where('type', 'youtube')->where('external_id', $channel_id)->first();
        if (!$site) {
            $site = new ArtistSite();
            $site->artist_id = $artist->id;
            $site->type = 'youtube';
            $site->external_id = $channel_id;
            $site->url = 'pending';
            $site->save();
        }

        // Add the track source.
        $track_source = new TrackSource();
        $track_source->track_id = $track->id;
        $track_source->type = 'youtube';
        $track_source->external_id = $video->id;
        $track_source->artist_site_id = $site->id;
        $track_source->duration_ms = $duration_ms;
        $track_source->save();

        return true;
    }
}
