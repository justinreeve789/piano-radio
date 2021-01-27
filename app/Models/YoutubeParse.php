<?php
/**
 * https://github.com/abdullahercan/php-youtube-search
 */
namespace App\Models;

use PHPHtmlParser\Dom;
use IvoPetkov\HTML5DOMDocument;

class YoutubeParse {
    public $baseUrl = "https://m.youtube.com";

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

        // TODO: This is an inefficient of fixing the invalid JSON. It would be better to just figure out where we went wrong in the post-preg-processing.
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