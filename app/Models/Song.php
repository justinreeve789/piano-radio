<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Song extends Model
{
    use HasFactory;

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

        $access_token = \App\Models\Config::where('key', 'spotify_access_token')->pluck('value');
        if ($access_token) {
            $this->credentials_token = $access_token;
        } else {
            $this->session->requestCredentialsToken();
            $this->access_token = $this->session->getAccessToken();
            $config = new \App\Models\Config();
            $config->key = 'spotify_access_token';
            $config->value = $this->access_token;
            \App\Models\Config::save($config);
        }
    }

    public function lookup($query) {
    }
}