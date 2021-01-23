<?php

namespace App\Models;

use Spatie\Crawler\Crawler;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Message\UriInterface;
use Psr\Http\Message\ResponseInterface;
use PHPHtmlParser\Dom;

class PRCrawlObserver extends \Spatie\Crawler\CrawlObserver {
    public function willCrawl(UriInterface $url) {
    }

//    public function soloPianoRadio(ResponseInterface $response) {
    public function soloPianoRadio() {
        $dom = new Dom;
        // $dom->loadStr($response->getBody());
        $dom->loadStr(file_get_contents('/var/www/dev.pianoradio.org/cdstore.htm'));
        $table = $dom->find('table#sheetmusic-table tbody tr');
        $rows = $table->getChildren();
        foreach ($rows as $row) {
            if (!$row->NextSiblingNotFound) {
                $node = $row->nextSibling();
                print_r($node->tag);
            }
        }
        print_r(count($rows));
        die;
        $tbody = $table->firstChild();
        foreach ($tbody as $row) {
            print_r($row->tag);
        }
        return;
        $row = $artist->firstChild();
        $image = $row->nextSibling();
        print_r($image->innerHTML);
        $name = $image->nextSibling();
        print_r($name->innerHTML);
        echo count($table);
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
