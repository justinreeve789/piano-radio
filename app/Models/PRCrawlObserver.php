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
                \Log::error('Skipped ' . print_r($row, true));
                continue;
            }

            // There's some weird stuff happening with some elements in this DOM that doesn't seem to be fixed by any regexes. Let's just parse through it again and clean up the data.
            // Load the song data while we're at it.
            // Creating a new authorization token with each iteration ensures it won't expire.
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
                            $album->release_date = date('Y-m-d', strtotime($spAlbum->release_date));
                            $album->spotify_id = $spAlbum->id;
                            $album->save();
                        }

                        // Make sure the artist association exists for the album.
                        $artist_album = ArtistAlbum::where('artist_id', $artist->id)->where('album_id', $album->id)->first();
                        if (!$artist_album) {
                            $artist_album = new ArtistAlbum();
                            $artist_album->artist_id = $artist->id;
                            $artist_album->album_id = $album->id;
                            $artist_album->save();
                        }

                        // Look up the tracks.
                        // TODO: Don't do this if we've already saved the tracks, and the number matches the album track count.
                        $spTracks = $music->getTracksByAlbumSpotifyId($album->spotify_id);

                        foreach ($spTracks as $spTrack) {
                            // Make sure the track hasn't already been saved.
                            $track = Track::where('spotify_id', $spTrack->id)->first();
                            if (!$track) {
                                $track = new Track();
                                $track->name = $spTrack->name;
                                $track->disc_number = $spTrack->disc_number;
                                $track->track_number = $spTrack->track_number;
                                $track->spotify_id = $spTrack->id;
                                $track->duration_ms = $spTrack->duration_ms;
                                $track->save();
                            }

                            // Make sure the associations exist for the album and track.
                            $artist_track = ArtistTrack::where('artist_id', $artist->id)->where('track_id', $track->id)->first();
                            if (!$artist_track) {
                                $artist_track = new ArtistTrack();
                                $artist_track->artist_id = $artist->id;
                                $artist_track->track_id = $track->id;
                                $artist_track->save();
                            }

                            $album_track = AlbumTrack::where('album_id', $album->id)->where('track_id', $track->id)->first();
                            if (!$album_track) {
                                $album_track = new AlbumTrack();
                                $album_track->album_id = $album->id;
                                $album_track->track_id = $track->id;
                                $album_track->save();
                            }
                        }
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
