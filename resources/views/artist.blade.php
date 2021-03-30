<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $artist->name }} - {{ env("APP_NAME") }} Artist</title>
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link rel="stylesheet" href="{{ mix("css/artist.css") }}">
    <link rel="icon" href="{{ asset('images/radio.svg') }}">
    @include('partials.analytics')
</head>

<body class="site-{{ strtolower(env("APP_SETTINGS_MODEL")) }}" style="--background-image-url: url('{{ $artist->image_url }}');">

<div id="main" class="container">
    <header>
        <div class="row">
            <div class="artist-name col-md-6 pull-left">
                <a href="/" class="title logo" title="Back to home page"><img src="{{ asset('images/radio.svg') }}"></a>
                <a href="/" class="title">{{ $artist->name }}</a>
            </div>
            <div class="artist-links col-md-6 pull-right">
                <a class="button" onclick="window.open('/{{ $artist->url_name }}/listen', '_radio', 'resizable=no, toolbar=no, scrollbars=no, menubar=no, status=no, directories=no, width=640, height=640, left=0, top=0');">
                    <img src="{{ asset('images/play.svg') }}">
                    Play Artist
                </a>
                @foreach ($artist->sites as $site)
                    @if ($site->type == "personal")
                        <a title="Music Site" href="{{ $site->url }}" target="_blank">Artist's Site</a>
                    @elseif ($site->type == "sheetmusic")
                        <a title="Sheet Music" href="{{ $site->url }}" target="_blank">Sheet Music</a>
                    @endif
                @endforeach
            </div>
        </div>
    </header>

    <div class="row justify-content-center">
        <div class="artist col-md-6 order-md-last">
            <div class="img">
                <img src="{{ $artist->image_url }}">
            </div>
            <div class="row icons">
            <?php $youtube = 0; ?>
            @foreach ($artist->sites as $site)
                @if ($site->type == "youtube" && $youtube++ < 2)
                    <a title="YouTube" href="{{ $site->url }}" target="_blank"><img src="{{ asset('images/youtube.svg') }}"></a>
                @elseif ($site->type == "spotify")
                    <a title="Spotify" href="{{ $site->url }}" target="_blank"><img src="{{ asset('images/spotify.svg') }}"></a>
                @elseif ($site->type == "twitter")
                    <a title="Twitter" href="{{ $site->url }}" target="_blank"><img src="{{ asset('images/twitter.svg') }}"></a>
                @elseif ($site->type == "instagram")
                    <a title="Instagram" href="{{ $site->url }}" target="_blank"><img src="{{ asset('images/instagram.svg') }}"></a>
                @elseif ($site->type == "apple")
                    <a title="Apple" href="{{ $site->url }}" target="_blank"><img src="{{ asset('images/apple.svg') }}"></a>
                @elseif ($site->type == "soundcloud")
                    <a title="Soundcloud" href="{{ $site->url }}" target="_blank"><img src="{{ asset('images/soundcloud.svg') }}"></a>
                @elseif ($site->type == "facebook")
                    <a title="Facebook" href="{{ $site->url }}" target="_blank"><img src="{{ asset('images/facebook.svg') }}"></a>
                @elseif ($site->type == "bandcamp")
                    <a title="Bandcamp" href="{{ $site->url }}" target="_blank"><img src="{{ asset('images/bandcamp.svg') }}"></a>
                @elseif ($site->type == "reverbnation")
                    <a title="Reverbnation" href="{{ $site->url }}" target="_blank"><img src="{{ asset('images/reverbnation.svg') }}"></a>
                @elseif ($site->type == "myspace")
                    <a title="Myspace" href="{{ $site->url }}" target="_blank"><img src="{{ asset('images/myspace.svg') }}"></a>
                @elseif ($site->type != 'youtube' && $site->type != 'sheetmusic' && $site->type != 'personal')
                    <a title="Web Site" href="{{ $site->url }}" target="_blank"><img src="{{ asset('images/website.svg') }}"></a>
                @endif
            @endforeach
            </div>
        </div>
        <div class="albums col-md-6 order-md-first">
            @foreach ($artist->albums as $album)
            <div class="album row">
                <input type="radio" name="album" value="{{ $album->id }}">
                <div class="info row">
                    <img class="album-image" src="{{ $album->image_url }}">
                    <a class="title">{{ $album->name }}</a>
                </div>
                <div class="tracks">
                    @foreach ($album->tracks as $track)
                    <div class="track row<?php if (count($track->trackSources->toArray()) == 0) { echo ' inactive'; } ?>">
                        <div class="track-number col-1">
                            {{ $track->track_number }}
                        </div>
                        <div class="track-title col-9">
                            @if (isset($track->trackSources[0]) && $track->trackSources[0]->url)
                            <a href="{{ $track->trackSources[0]->url }}" target="_blank">{{ $track->name }}</a>
                            @else
                            {{ $track->name }}
                            @endif
                        </div>
                        <div class="track-duration col-1 text-right">
                            <?php echo \App\Models\Track::formatMilliseconds($track->duration_ms); ?>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
            @endforeach
        </div>
    </div>
</div>
</body>
</html>