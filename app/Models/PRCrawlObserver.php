<?php

namespace App\Models;

use Spatie\Crawler\Crawler;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Message\UriInterface;
use Psr\Http\Message\ResponseInterface;
use PHPHtmlParser\Dom;
use IvoPetkov\HTML5DOMDocument;

class PRCrawlObserver extends \Spatie\Crawler\CrawlObserver {
    public function willCrawl(UriInterface $url) {
    }

//    public function soloPianoRadio(ResponseInterface $response) {
    public function soloPianoRadio() {
        $dom = new HTML5DOMDocument();
        // $dom->loadStr($response->getBody());
        $dom->loadHTML(file_get_contents('/var/www/dev.pianoradio.org/cdstore.htm'));
        $table = $dom->querySelector('table#sheetmusic-table tbody');
        foreach ($table->childNodes as $row) {
            try {
                $name = trim($row->childNodes->item(2)->textContent);
                $site = $row->childNodes->item(4)->textContent;
                $albums = $row->childNodes->item(6);
                $titles = explode("\n", trim(strip_tags(preg_replace('#<br\s*/?>#i', "\n", trim($albums->innerHTML)))));
            } catch (\Exception $e) {
                echo 'Skipped ' . print_r($row);
            }

            // There's some weird stuff happening with some elements in this DOM that doesn't seem to be fixed by any regexes. Let's just parse through it again and clean up the data.
            // Load the song data while we're at it.
            $music = new MusicData();

            // Make sure we've saved the artist(s) already.
            $data = $music->getArtistByQuery($name);
            if (!$data) {
                // TODO: Log the missing artist.
                continue;
            }

            $artist = Artist::where('spotify_id', $data->id)->first();
            if (!$artist) {
                $artist = new Artist();
                $artist->name = $data->name;
                $artist->image_url = isset($data->images[0]) ? $data->images[0]->url : null;
                $artist->spotify_id = $data->id;
                $artist->save();
            }

            // Look up the albums.
            foreach ($titles as $title) {
                $title = trim($title);
                if ($title != '') {
                    $spAlbum = $music->getAlbumByQuery($name . ' ' . $title);
                    if ($spAlbum) {
                        if (!$spAlbum) {
                            continue;
                        }

                        // Make sure the artist is the same as the one we just retrieved.
                        $foundartist = false;
                        foreach ($spAlbum->artists as $a) {
                            if ($a->id == $artist->spotify_id || $a->name == $artist->name) {
                                $foundartist = true;
                                break;
                            }
                        }

                        if ($foundartist == false) {
                            // TODO: Log.
                            \Log::error('Skipping. Artist ' . $artist->name . ' not found for Album ' . $spAlbum->name);
                            continue;
                        }

                        // Make sure the album has already been saved.
                        $album = Album::where('name', $spAlbum->name)->first();
                        if (!$album) {
                            $album = new Album();
                            $album->name = $spAlbum->name;
                            $album->total_tracks = $spAlbum->total_tracks;
                            $album->image_url = isset($spAlbum->images[0]) ? $spAlbum->images[0]->url : null;
                            $album->release_date = $spAlbum->release_date;
                            $album->spotify_id = $spAlbum->id;
                            $album->save();
                        }

                        // Look up the tracks.
                        $results = $music->getTracksByAlbumSpotifyId($album->spotify_id);
                    }
                }
            }
        }
        die;
    }

    public function crawled(UriInterface $url,
                            ResponseInterface $response,
                            ?UriInterface $foundOnUrl = null) {

        if ($url->getHost() == 'solopianoradio.com') {
            $this->soloPianoRadio($response);
        }
    }

    public function crawlFailed(UriInterface $url,
                                RequestException $requestException,
                                ?UriInterface $foundOnUrl = null) {
    }

    public function finishedCrawling() { }
}
