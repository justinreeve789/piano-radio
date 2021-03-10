<?php

namespace App\Console\Commands;

use App\Models\Album;
use App\Models\AlbumTag;
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
    protected $signature = 'music:addartist {name} {--tag=*} {--album=*} {--track=*} {--skip-albums} {--skip-tracks}';

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
        $addalbums = $this->option('album');
        $addtags = $this->option('tag');
        $addtracks = $this->option('track');   // If individual tracks are specified, and we haven't created the album yet, assume the rest of the album is NOT usable.
        $skip_albums = $this->option('skip-albums');
        $skip_tracks = $this->option('skip-tracks');
        $music = new MusicData();

        // We can search either the name or their Spotify id.
        $nameparts = explode(':', $name);
        if (isset($nameparts[0]) && $nameparts[0] == 'spotify' && isset($nameparts[1]) && $nameparts[1] == 'artist') {
            $artist_spotify_id = $nameparts[2];
        }

        // Make sure the artist exists.
        if (!empty($artist_spotify_id)) {
            $data = $music->getArtistBySpotifyId($artist_spotify_id);
        } else {
            $data = $music->getArtistByQuery($name);
        }

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

        if ($skip_albums) {
            return 0;
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

            // If album tags were specified, add them now.
            if (!empty($addtags)) {
                foreach ($addtags as $tag) {
                    $tag = trim(strtolower($tag));
                    $album_tag = AlbumTag::where('album_id', $album->id)->where('tag', $tag)->first();
                    if (!$album_tag) {
                        $album_tag = new AlbumTag();
                        $album_tag->album_id = $album->id;
                        $album_tag->tag = $tag;
                        $album_tag->save();
                    }
                }
            }

            // Make sure the artist association exists for the album.
            $artist_album = ArtistAlbum::where('artist_id', $artist->id)->where('album_id', $album->id)->first();
            if (!$artist_album) {
                $artist_album = new ArtistAlbum();
                $artist_album->artist_id = $artist->id;
                $artist_album->album_id = $album->id;
                $artist_album->save();
            }

            if ($skip_tracks) {
                continue;
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
