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
use App\Models\TrackTag;
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
    protected $signature = 'music:addyoutubeartist {url} {--tag=*}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add the YouTube videos for an artist as albums and tracks.';

    private $tracks;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
        $this->tracks = [];
    }

    private function processPlaylists($data, $url, $yt) {
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

        if (!$artist) {
            return;
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
                $album = $yt->createAlbumForPlaylist($pa, $artist->id);
            } else {
                $this->alert('Album exists for "' . $pa->title . '"');
            }

            // Find new videos for this playlist and add them as tracks.
            $this->alert('Scanning for new videos.');
            $playlist = $yt->getPlaylistDataById($pa->id);
            $autoaccept = false;
            foreach ($playlist->entries as $video) {
                $ts =
                    TrackSource::with('track')->where('type', 'youtube')->where('external_id', $video->id)->first();
                if ($ts) {
                    $this->error('Skipping ' . $video->title);
                    continue;
                } else {
                    // Skip if the video uploader doesn't match the artist.
                    if ($autoaccept == false) {
                        $match = $this->ask(
                            'Video uploader doesn\'t match artist. ' . $artist->name . ' vs ' . $video->uploader .
                            ': "' . $video->title . '" ... Add anyway?'
                        );
                        if ($match != 'y' && $match != 'all') {
                            continue;
                        }
                        if ($match == 'all') {
                            $autoaccept = true;
                        }
                    }

                    $ts = $yt->createTrackForVideo($video, $album->id, $artist->id);
                    if ($ts) {
                        $this->line('Created ' . $video->title);
                        $this->tracks[$ts->id] = $ts;
                    } else {
                        $this->error('Could not create ' . $video->title);
                    }
                }
            }
            $album->fixData();
        }
    }

    private function processSinglePlaylist($data, $url, $yt) {
        // Check if artist exists.
        if (!$yt->artistExistsByYouTubeId($data->uploader_id)) {
            $name = trim(explode(' - ', $data->title)[0]);
            $image_url = $yt->getArtistImage($url);
            if ($name != '' && $image_url !== null) {
                $artist = $yt->createArtist($data->uploader_id, $name, $image_url);
            }
        } else {
            $artist = Artist::where('youtube_id', $data->uploader_id)->first();
        }

        if (!$artist) {
            return;
        }

        // Check if the playlist already exists as an album.
        $album = Album::where('youtube_id', $data->id)->first();
        if (!$album) {
            if (strtolower($this->ask('Create album for "' . $data->title . '"?')) != 'y') {
                return;
            }
            $album = $yt->createAlbumForPlaylist($data, $artist->id);
        } else {
            $this->alert('Album exists for "' . $data->title . '"');
        }

        // Find new videos for this playlist and add them as tracks.
        $this->alert('Scanning for new videos.');
        $playlist = $yt->getPlaylistDataById($data->id);
        foreach ($playlist->entries as $video) {
            $ts =
                TrackSource::with('track')->where('type', 'youtube')->where('external_id', $video->id)->first();
            if ($ts) {
                $this->error('Skipping ' . $video->title);
                continue;
            } else {
                // Skip if the video uploader doesn't match the artist.
                if ($artist->name != $video->uploader) {
                    if ($this->ask(
                            'Video uploader doesn\'t match artist. ' . $artist->name . ' vs ' . $video->uploader .
                            ': "' . $video->title . '" ... Add anyway?'
                        ) != 'y') {
                        continue;
                    }
                }

                $ts = $yt->createTrackForVideo($video, $album->id, $artist->id);
                if ($ts) {
                    $this->line('Created ' . $video->title);
                    $this->tracks[$ts->id] = $ts;
                } else {
                    $this->error('Could not create ' . $video->title);
                }
            }
        }
        $album->fixData();
    }

    private function processVideos($data, $url, $yt) {
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

        if (!$artist) {
            return;
        }

        // In this case, we're not using playlists as albums. There's just going to be one album identified by the channel id.
        $album = Album::where('youtube_id', $data->id)->first();
        if (!$album) {
            if (strtolower($this->ask('Create album containing all videos?')) != 'y') {
                return;
            }
            $album = $yt->createAlbumForVideoPage($data->title, $data->id, $artist->id);
        } else {
            $this->alert('Album exists for "' . $data->title . '"');
        }

        // Find new videos and add them as tracks.
        $this->alert('Scanning for new videos.');
        foreach ($data->entries as $video) {
            $ts =
                TrackSource::with('track')->where('type', 'youtube')->where('external_id', $video->id)->first();
            if ($ts) {
                $this->error('Skipping ' . $video->title);
                continue;
            } else {
                $video = $yt->getDataForVideoId($video->id);
                if (!$video) {
                    continue;
                }

                // Skip if the video uploader doesn't match the artist.
                if ($artist->name != $video->uploader) {
                    if ($this->ask(
                            'Video uploader doesn\'t match artist. ' . $artist->name . ' vs ' . $video->uploader .
                            ': "' . $video->title . '" ... Add anyway?'
                        ) != 'y') {
                        continue;
                    }
                }

                $ts = $yt->createTrackForVideo($video, $album->id, $artist->id);
                if ($ts) {
                    $this->line('Created ' . $video->title);
                    $this->tracks[$ts->id] = $ts;
                } else {
                    $this->error('Could not create ' . $video->title);
                }
            }
        }
        $album->fixData();
    }

    public function processSingleVideo($data, $url, $yt) {
        // Check if artist exists.
        if (!$yt->artistExistsByYouTubeId($data->uploader_id)) {
            if ($this->ask('Artist ' . $data->uploader . ' not found. Create?') == 'y') {
                $name = $data->uploader;
                $image_url = $yt->getArtistImage($url);
                if ($name != '' && $image_url !== null) {
                    $artist = $yt->createArtist($data->id, $name, $image_url);
                }
            }
        } else {
            $artist = Artist::where('youtube_id', $data->uploader_id)->first();
        }

        if (!isset($artist) || !$artist) {
            return;
        }

        $album = Album::where('youtube_id', $data->uploader_id)->first();
        if (!$album) {
            if (strtolower($this->ask('No album for YouTube videos found for this artist. Create?')) != 'y') {
                return;
            }
            $album = $yt->createAlbumForVideoPage($data->uploader, $data->uploader_id, $artist->id);
        } else {
            $this->alert('Album exists for "' . $data->uploader . '"');
        }

        if ($album) {
            $video = $yt->getDataForVideoId($data->id);
            if ($video) {
                $this->line('Track already exists for ' . $data->title);
                return;
            }

            $ts = $yt->createTrackForVideo($video, $album->id, $artist->id);
            if ($ts) {
                $this->line('Created ' . $video->title);
                $this->tracks[$ts->id] = $ts;
            } else {
                $this->error('Could not create ' . $video->title);
            }
            $album->fixData();
        }
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $url = $this->argument('url');
        $addtags = $this->option('tag');
        $yt = new YoutubeParse();
        $parts = explode('/', $url);
        $data = $yt->getDataFromUrl($url);

        if (!$data) {
            // TODO: Log the missing artist.
            exit(0);
        }

        if (end($parts) == 'videos') {
            // All videos uploaded by user.
            $this->processVideos($data, $url, $yt);
        } elseif (end($parts) == 'playlists') {
            // All playlists for user.
            $this->processPlaylists($data, $url, $yt);
        } elseif (substr(end($parts), 0, 8) == 'playlist') {
            // Single playlist for user.
            $this->processSinglePlaylist($data, $url, $yt);
        } elseif (substr($parts[3], 0, 5) == 'watch') {
            //  Single video for user.
            $this->processSingleVideo($data, $url, $yt);
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

        if (!empty($tracks)) {
            $tags = explode(',', $addtags);
            foreach ($tracks as $track_id => $track) {
                foreach ($tags as $tag) {
                    $tag = trim(strtolower($tag));
                    $track_tag = TrackTag::where('track_id', $track_id)->where('tag', $tag)->first();
                    if (!$track_tag) {
                        $track_tag = new TrackTag();
                        $track_tag->track_id = $track_id;
                        $track_tag->tag = $tag;
                        $track_tag->save();
                    }
                }
            }
        }
    }
}
