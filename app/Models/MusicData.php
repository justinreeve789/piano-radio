<?php

namespace App\Models;

class MusicData {
    protected $client_id;
    protected $client_secret;
    protected $redirect_uri;
    protected $session;
    protected $api;
    protected $access_token;

    function __construct() {
        $this->session = new \SpotifyWebAPI\Session(
            getenv('SPOTIFY_CLIENT_ID'),
            getenv('SPOTIFY_CLIENT_SECRET'),
            getenv('SPOTIFY_REDIRECT_URI')
        );
        $this->api = new \SpotifyWebAPI\SpotifyWebAPI();

        $access_token = \App\Models\Config::where('key', 'spotify_access_token')->value('value');
        if ($access_token) {
            $this->access_token = $access_token;
        } else {
            $this->session->requestCredentialsToken();
            $this->access_token = $this->session->getAccessToken();
            $config = new \App\Models\Config();
            $config->key = 'spotify_access_token';
            $config->value = $this->access_token;
            $config->save();
        }
        $this->api->setAccessToken($this->access_token);
    }

    public function lookup($query) {
        $results = $this->api->search($query, 'track');
        return $results;
    }

    public function getArtistByQuery($query) {
        $results = $this->api->search($query, 'artist');
        if (isset($results->artists->items[0])) {
            return $results->artists->items[0];
        }
    }

    public function getAlbumByQuery($query) {
        $results = $this->api->search($query, 'album');
        if (isset($results->albums->items[0])) {
            return $results->albums->items[0];
        }
    }

    public function getTracksByAlbumSpotifyId($spotify_id) {
        $results = $this->api->getAlbumTracks($spotify_id);
        if (isset($results->albums->items[0])) {
            return $results->albums->items[0];
        }
    }
}
