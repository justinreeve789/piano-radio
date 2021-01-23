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

                // There's some weird stuff happening with some elements in this DOM that doesn't seem to be fixed by any regexes. Let's just parse through it again and clean up the data.
                $cleantitles = [];
                foreach ($titles as $title) {
                    $title = trim($title);
                    if ($title != '') {
                        $cleantitles[] = trim($title);
                    }
                }
                print_r($cleantitles);
            } catch (\Exception $e) {
                echo 'Skipped ' . print_r($row);
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
