<?php

namespace App\Console\Commands;

use App\Models\Album;
use App\Models\AlbumTag;
use App\Models\AlbumTrack;
use App\Models\Artist;
use App\Models\ArtistAlbum;
use App\Models\ArtistAttempt;
use App\Models\ArtistTag;
use App\Models\ArtistTrack;
use App\Models\MusicData;
use App\Models\Track;
use App\Models\TrackData;
use Illuminate\Console\Command;

class UpdateArtists extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'music:updateartists';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update all artists with new albums.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $music = new MusicData();

        $artists = Artist::get();
        foreach ($artists as $artist) {
            if (!empty($artist->spotify_id)) {
                $data = $music->getArtistBySpotifyId($artist->spotify_id);
                if (empty($data)) {
                    // TODO: Log the missing artist.
                    echo 'No matching artist found on Spotify: ' . $artist->spotify_id . '
';
                    continue;
                }
            }

            // Retrieve all the artist's albums.
            $spAlbums = $music->getAlbumsByArtistSpotifyId($artist->spotify_id);

            foreach ($spAlbums as $spAlbum) {
                // Check if the album has already been saved.
                $album = Album::where('name', $spAlbum->name)->first();
                if (!$album) {
                    $album = new Album();
                    $album->saveFromSpotifyData($spAlbum);
                } else {
                    continue;
                }

                echo 'Adding album for ' . $artist->name . ': ' . $album->name . '
';
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
                        $track->album_id = $album->id;
                        $track->artist_id = $artist->id;
                        $track->saveFromSpotifyData($spTrack);
                    }

                    // Make sure the associations exist for the album and track.
                    $artist_track =
                        ArtistTrack::where('artist_id', $artist->id)->where('track_id', $track->id)->first();
                    if (!$artist_track) {
                        $artist_track = new ArtistTrack();
                        $artist_track->artist_id = $artist->id;
                        $artist_track->track_id = $track->id;
                        $artist_track->save();
                    }

                    $track->album_id = $album->id;
                    $track->artist_id = $artist->id;
                    $track->save();

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

        return 0;
    }
}
