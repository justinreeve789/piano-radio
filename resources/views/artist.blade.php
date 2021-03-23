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
    <link rel="icon" href="https://image.flaticon.com/icons/svg/2983/2983687.svg">
    @include('partials.analytics')
</head>

<body class="site-{{ strtolower(env("APP_SETTINGS_MODEL")) }}" style="--background-image-url: url('{{ $artist->image_url }}');">

<div id="main" class="container">
    <header>
        <div class="row">
            <div class="artist-name col-md-6 pull-left">
                <a href="/" class="title logo" title="Back to home page"><img src="https://image.flaticon.com/icons/svg/2983/2983687.svg"></a>
                <a href="/" class="title">{{ $artist->name }}</a>
            </div>
            <div class="artist-links col-md-6 pull-right">
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
                    <a title="YouTube" href="{{ $site->url }}" target="_blank"><img src="https://image.flaticon.com/icons/svg/1384/1384060.svg"></a>
                @elseif ($site->type == "spotify")
                    <a title="Spotify" href="{{ $site->url }}" target="_blank"><img src="https://image.flaticon.com/icons/svg/408/408748.svg"></a>
                @elseif ($site->type == "twitter")
                    <a title="Twitter" href="{{ $site->url }}" target="_blank"><img src="https://image.flaticon.com/icons/svg/174/174876.svg"></a>
                @elseif ($site->type == "instagram")
                    <a title="Instagram" href="{{ $site->url }}" target="_blank"><img src="https://image.flaticon.com/icons/svg/1409/1409946.svg"></a>
                @elseif ($site->type == "apple")
                    <a title="Apple" href="{{ $site->url }}" target="_blank"><img src="https://image.flaticon.com/icons/svg/3698/3698272.svg"></a>
                @elseif ($site->type == "soundcloud")
                    <a title="Soundcloud" href="{{ $site->url }}" target="_blank"><img src="https://image.flaticon.com/icons/svg/145/145809.svg"></a>
                @elseif ($site->type == "facebook")
                    <a title="Facebook" href="{{ $site->url }}" target="_blank"><img src="https://image.flaticon.com/icons/svg/145/145802.svg"></a>
                @elseif ($site->type == "bandcamp")
                    <a title="Bandcamp" href="{{ $site->url }}" target="_blank"><img src="https://image.flaticon.com/icons/svg/168/168742.svg"></a>
                @elseif ($site->type != 'youtube' && $site->type != 'sheetmusic' && $site->type != 'personal')
                    <a title="Web Site" href="{{ $site->url }}" target="_blank"><img src="https://image.flaticon.com/icons/svg/1450/1450169.svg"></a>
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