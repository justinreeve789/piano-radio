<?php
/**
 * https://github.com/abdullahercan/php-youtube-search
 */
namespace App\Models;

use PHPHtmlParser\Dom;
use IvoPetkov\HTML5DOMDocument;

class YoutubeParse {
    public $baseUrl = "https://m.youtube.com";
    private $youtubedl;

    public function __construct() {
        $this->youtubedl = \Config::get('youtube-dl.bin');
    }

    public function getDataFromUrl($url) {
        $cmd = $this->youtubedl . ' -J --flat-playlist --playlist-start=1 "' . $url . '"';
        $json = shell_exec($cmd);
        return json_decode($json);
    }

    public function getDataForVideoId($videoId) {
        $cmd = $this->youtubedl . ' -j "https://youtube.com/watch?v=' . $videoId . '"';
        $json = shell_exec($cmd);
        return json_decode($json);
    }

    public function artistExistsByYouTubeId($id) {
        $artist = Artist::where('youtube_id', $id)->first();
        return (!!$artist);
    }

    public function createArtist($youtube_id, $name, $image_url) {
        $artist = new Artist();
        $artist->youtube_id = $youtube_id;
        $artist->name = $name;
        $artist->image_url = $image_url;
        $artist->save();
        return $artist;
    }

    public function getArtistImage($url) {
        $sed = <<<SED
sed -n '/data-thumb=/!s|.*\(//yt3\.ggpht\.com[^")]*\)[")].*|https:\\1|p' | sort | uniq
SED;
        $cmd = "echo `wget -O - '" . $url . "' | " . $sed . '`';
        $imageUrl = trim(shell_exec($cmd));
        if ($imageUrl != '') {
            return $imageUrl;
        }
        return null;
    }

    public function albumExistsForPlaylist($playlist) {
        // Check if the playlist already exists as an album.
        $album = Album::where('youtube_id', $playlist->id)->first();
        return (!!$album);
    }

    public function getPlaylistDataById($playlist_id) {
        $url = 'https://www.youtube.com/playlist?list=' . $playlist_id;
        $cmd = $this->youtubedl . ' -J --flat-playlist --playlist-start=1 "' . $url . '"';
        $json = shell_exec($cmd);
        return json_decode($json);
    }

    public function createAlbumForVideoPage($title, $youtube_id, $artist_id, $is_usable = true) {
        $album = new Album();
        $album->name = trim(explode(' - ', $title)[0]);
        $album->total_tracks = 0;   // This will be updated later.
        $album->youtube_id = $youtube_id;
        $album->is_usable = $is_usable;
        $album->save();

        $artist_album = new ArtistAlbum();
        $artist_album->album_id = $album->id;
        $artist_album->artist_id = $artist_id;
        $artist_album->save();

        return $album;
    }

    public function createAlbumForPlaylist($playlist, $artist_id, $is_usable = true) {
        $album = new Album();
        $album->name = $playlist->title;
        $album->total_tracks = 0;   // This will be updated later.
        $album->youtube_id = $playlist->id;
        $album->is_usable = $is_usable;
        $album->save();

        $artist_album = new ArtistAlbum();
        $artist_album->album_id = $album->id;
        $artist_album->artist_id = $artist_id;
        $artist_album->save();

        return $album;
    }

    public function createTrackForVideo($video, int $album_id, int $artist_id) {
        $track = new Track();
        $track->saveFromYouTubeData($video, $album_id, $artist_id);
        if ($track->id) {
            $ts = new TrackSource();
            $ts->track_id = $track->id;
            $ts->type = 'youtube';
            $ts->external_id = $video->id;
            $ts->url = 'https://youtube.com/watch?v=' . $video->id;
            $ts->duration_ms = $track->duration_ms;
            $ts->save();

            $album_track = new AlbumTrack();
            $album_track->album_id = $album_id;
            $album_track->track_id = $track->id;
            $album_track->save();

            $artist_track = new ArtistTrack();
            $artist_track->artist_id = $artist_id;
            $artist_track->track_id = $track->id;
            $artist_track->save();
        }
        return Track::with('trackSources')->where('id', $track->id)->first();
    }

    public function getImageForUrl($url) {
        $cmd = $this->youtubedl . ' --get-thumbnail "' . $url . '"';
        $image_url = trim(shell_exec($cmd));
        if (filter_var($image_url, FILTER_VALIDATE_URL)) {
            return $image_url;
        }
        return null;
    }

    /**
     * See https://github.com/dlepaux/realtime-bpm-analyzer
     *
     * @param $url
     * @return int
     */
    public function getBPM($url): int {
    }

    private function getData($url = "", $post = false, $val = "") {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . $url);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);
        if ($post) {
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $val);
        }
        curl_setopt($ch, CURLOPT_REFERER, "googlebot");
        curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1");

        $data = curl_exec($ch);
        curl_close($ch);

        return $data;
    }


    public function query($q = '') {
        $html = file_get_contents('https://www.youtube.com/results?q={$q}&hl=tr');
        echo $html;
        die;
    }

    public function search($q = "") {
        $path = "/results?q=" . urlencode($q) . "&hl=tr";
        $getData = $this->getData($path);

        preg_match_all('#var ytInitialData =(.*?)</script>#si', $getData, $matches, PREG_SET_ORDER);
        $data = preg_replace_callback('#\\\x([0-9A-F]{2})#si', function ($item) {
            return chr(intval($item[1], 16));
        }, $matches[0][1]);
        $data = str_replace(["\\\\", " '{", "';"], ["", "{", ""], $data);

        // TODO: This is an inefficient way of fixing the invalid JSON. It would be better to just figure out where we went wrong in the post-preg-processing.
        // We could also try to get the php-jq extension working.
        file_put_contents('/tmp/list.json', $data);
        $cmd = 'tail /tmp/list.json | dirty-json > /tmp/list-fixed.json';
        @exec($cmd);
        $json = file_get_contents('/tmp/list-fixed.json');
        $data = json_decode($json, true);
        if (!$data) {
            return false;
        }

        $item = [];
        if (
            $data
            && !empty($data['contents'])
            && !empty($data['contents']['sectionListRenderer'])
            && !empty($data['contents']['sectionListRenderer']['contents'])
            && count($data['contents']['sectionListRenderer']['contents']) > 0
            && !empty($data['contents']['sectionListRenderer']['contents'][1]['itemSectionRenderer'])
            && count($data['contents']['sectionListRenderer']['contents'][1]['itemSectionRenderer']) > 0
        ) {
            $results = $data['contents']['sectionListRenderer']['contents'][1]['itemSectionRenderer']['contents'];
            foreach ($results as $result) {
                if (!empty($result['compactVideoRenderer']['videoId'])) {
                    $item[] = [
                        'id' => $result['compactVideoRenderer']['videoId'],
                        'title' => $result['compactVideoRenderer']['title']['runs'][0]['text'],
                        'description' => $result['compactVideoRenderer']['title']['accessibility']['accessibilityData']['label'],
                        'time' => $result['compactVideoRenderer']['lengthText']['runs'][0]['text'],
                        'thumbnail' => end($result['compactVideoRenderer']['thumbnail']['thumbnails'])['url'],
                        'channel' => $result['compactVideoRenderer']['shortBylineText']['runs'][0]['navigationEndpoint']['commandMetadata']['webCommandMetadata']['url'],
                    ];
                }
            }
        }
        return $item;
    }
}