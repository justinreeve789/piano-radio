<?php

namespace App\Models;

class Soundcloud
{
    protected $client;
    protected $client_id;
    protected $client_secret;
    protected $redirect_uri;
    protected $session;
    protected $api;
    protected $access_token;

    function __construct() {
        $this->client = new \GuzzleHttp\Client();
        $response = $this->client->request('GET', 'https://soundcloud.com/connect');

        echo $response->getStatusCode(); // 200
        echo $response->getHeaderLine('content-type'); // 'application/json; charset=utf8'
        echo $response->getBody(); // '{"id": 1420053, "name": "guzzle", ...}'

// Send an asynchronous request.
        $request = new \GuzzleHttp\Psr7\Request('GET', 'http://httpbin.org');
        $promise = $client->sendAsync($request)->then(function ($response) {
            echo 'I completed! ' . $response->getBody();
        });

        $promise->wait();
    }
}
