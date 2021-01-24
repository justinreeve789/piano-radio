<?php

namespace App\Console\Commands;

use App\Models\Album;
use App\Models\AlbumTrack;
use App\Models\Artist;
use App\Models\ArtistAlbum;
use App\Models\ArtistTrack;
use App\Models\MusicData;
use App\Models\Track;
use App\Models\TrackData;
use Illuminate\Console\Command;

class AddArtist extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'music:addartist {name}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add an artist, including their albums and tracks.';

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
        $name = $this->argument('name');
        $music = new MusicData();

        // Make sure the artist exists.
        $data = $music->getArtistByQuery($name);
        if (!$data) {
            // TODO: Log the missing artist.
            return 0;
        }

        // Check if we already have the artist saved.
        $artist = Artist::where('spotify_id', $data->id)->first();
        if (!$artist) {
            $artist = new Artist();
            $artist->name = $data->name;
            $artist->image_url = isset($data->images[0]) ? $data->images[0]->url : null;
            $artist->spotify_id = $data->id;
            $artist->save();
        }

        // Retrieve all the artist's albums.
        $spAlbums = $music->getAlbumsByArtistSpotifyId($artist->spotify_id);

        foreach ($spAlbums as $spAlbum) {
            // Check if the album has already been saved.
            $album = Album::where('name', $spAlbum->name)->first();
            if (!$album) {
                $album = new Album();
                $album->saveFromSpotifyData($spAlbum);
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
                    $track->saveFromSpotifyData($spTrack);
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

        return 0;
    }
}
