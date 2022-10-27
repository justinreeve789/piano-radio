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
use App\Models\TrackSource;
use App\Models\YoutubeParse;
use Illuminate\Console\Command;

class AddYouTubeArtist extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'music:addyoutubeartist {url}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add the YouTube videos for an artist as albums and tracks.';

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
        $url = $this->argument('url');
        $yt = new YoutubeParse();
        $parts = explode('/', $url);
        $data = $yt->getDataFromUrl($url);

        if (end($parts) == 'videos') {
            // Check if artist exists.
            if (!$yt->artistExistsByYouTubeId($data->id)) {
            }

            // All videos uploaded by user.
            $videos = $data;
        } elseif (end($parts) == 'playlists') {
            // All playlists for user.
            // Check if artist exists.
            if (!$yt->artistExistsByYouTubeId($data->id)) {
                $name = trim(explode(' - ', $data->title)[0]);
                $image_url = $yt->getArtistImage($url);
                if ($name != '' && $image_url !== null) {
                    $artist = $yt->createArtist($data->id, $name, $image_url);
                }
            } else {
                $artist = Artist::where('youtube_id', $data->id)->first();
            }

            // Check all playlists.
            $playlist_albums = $data->entries;
            foreach ($playlist_albums as $pa) {
                // Check if the playlist already exists as an album.
                $album = Album::where('youtube_id', $pa->id)->first();
                if (!$album) {
                    if (strtolower($this->ask('Create album for "' . $pa->title . '"?')) != 'y') {
                        continue;
                    }
                    $album = $yt->createAlbumForPlaylist($pa);
                } else {
                    $this->alert('Album exists for "' . $pa->title . '"');
                }

                // Find new videos for this playlist and add them as tracks.
                // We'll have to generate track numbers, starting with the earliest.
                $this->alert('Scanning for new videos.');
                $playlist = $yt->getPlaylistDataById($pa->id);
                foreach ($playlist->entries as $video) {
                    // Skip if the video uploader doesn't match the artist.
                    if ($artist->name != $video->uploader) {
                        if ($this->ask(
                                'Video uploader doesn\'t match artist. ' . $artist->name . ' vs ' . $video->uploader .
                                ': "' . $video->title . '" ... Add anyway?'
                            ) != 'y') {
                            continue;
                        }
                    }

                    $ts =
                        TrackSource::with('track')->where('type', 'youtube')->where('external_id', $video->id)->first();
                    if ($ts) {
                        $this->error('"' . $video->title . '" already saved . Skipping . ');
                        continue;
                    } else {
                        $ts = $yt->createTrackForVideo($video);
                        if ($ts) {
                            $this->error('Created ' . $video->title);
                        } else {
                            $this->error('Could not create ' . $video->title);
                        }
                    }
                    print_r((array)$ts);
                }
            }
        } elseif (substr(end($parts), 0, 8) == 'playlist') {
            // Check if artist exists.
            if (!$yt->artistExistsByYouTubeId($data->uploader_id)) {
            }

            // Single playlist for user.
            $videos = $data;
            print_r($data);
        } elseif ($parts[3] == 'c' && count($parts) == 5) {
            // Profile for a user.
            $items = $data;
            foreach ($items->entries as $item) {
                $urlparts = explode(' / ', parse_url($item->url)['path']);
                print_r($urlparts);
            }
        } else {
            $this->error('The URL path must end in / videos, /playlists, or /playlist');
            exit(0);
        }
        die;
        $music = new MusicData();

        // We can search either the name or their Spotify id.
        $nameparts = explode(':', $name);
        if (isset($nameparts[0]) && $nameparts[0] == 'spotify' && isset($nameparts[1]) && $nameparts[1] == 'artist') {
            $artist_spotify_id = $nameparts[2];
        }

        try {
            $attempt = new ArtistAttempt();
            $attempt->name = $name;
            $attempt->save();
        } catch (\Exception $e) {
            echo 'Band attempt for ' . $name . ' already exists .
                        ';
        }

        return 0;

        if (!$data) {
            // TODO: Log the missing artist.
            return 0;
        }
    }
}
