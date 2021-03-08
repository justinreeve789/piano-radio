<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="csrf-token" content="{{csrf_token()}}">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Roboto:wght@100&amp;display=swap'>
    <link rel="stylesheet" href="{{ mix('css/artist.css') }}" />
    <title>{{ $artist->name }} - {{ env('APP_NAME') }} Artist</title>
</head>

<body class="site-{{ strtolower(env('APP_SETTINGS_MODEL')) }}">
<!-- header -->

<div class='header'>
    <a href='#' class='title'>{{ $artist->name }}</a>
    @foreach ($artist->sites as $site)
        @if ($site->type == 'youtube')
            <a href='https://youtube.com/channel/{{ $site->external_id }}' target="_blank"><img src='https://image.flaticon.com/icons/svg/1384/1384060.svg'></a>
        @elseif ($site->type == 'spotify')
            <a href='{{ $site->url }}' target="_blank"><img src='https://image.flaticon.com/icons/svg/408/408748.svg'></a>
        @elseif ($site->type == 'twitter')
            <a href='{{ $site->url }}' target="_blank"><img src='https://image.flaticon.com/icons/svg/1409/1409946.svg'></a>
        @elseif ($site->type == 'instagram')
            <a href='{{ $site->url }}' target="_blank"><img src='https://image.flaticon.com/icons/svg/174/174876.svg'></a>
        @elseif ($site->type == 'personal')
            <a href='{{ $site->url }}' target="_blank"><img src='https://image.flaticon.com/icons/svg/1450/1450169.svg'></a>
        @elseif ($site->type == 'sheetmusic')
            <a href='{{ $site->url }}' target="_blank"><img src='https://image.flaticon.com/icons/svg/1645/1645653.svg'></a>
        @else
            <a href='{{ $site->url }}' target="_blank"><img src='https://image.flaticon.com/icons/svg/1450/1450169.svg'></a>
        @endif
    @endforeach
</div>

<!-- jumbo -->

<div class='jumbo'>
    <div class='text'>
        @foreach ($artist->albums as $album)
            <div class="album">
                <img class="album-image" src="{{ $album->image_url }}">
                <a class="title">{{ $album->name }}</a>
            </div>
        @endforeach
    </div>
    <div class='img'>
        <img src='{{ $artist->image_url }}'>
    </div>
</div>

<div class='footer'>
</div>

</body>
</html>