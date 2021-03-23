<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>{{ env('APP_NAME' )}}</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link rel="stylesheet" href="{{ mix('css/home.css') }}">
    <link rel="stylesheet" href="{{ mix('css/site.css') }}">
    <link rel="icon" href="https://image.flaticon.com/icons/svg/2983/2983687.svg">
    {!! $opengraph !!}
    @include('partials.analytics');
</head>
<body class="site-{{ strtolower(getenv('APP_SETTINGS_MODEL')) }}" style="--background-image-url: url('{{ getenv('HOME_BACKGROUND_URL') }}')">
<header>
    <h1 class="title">
        {{ env('APP_NAME') }}
    </h1>
</header>
<div id="main" class="container">
    <div class="description">
        @include('sites.' . strtolower(getenv('APP_SETTINGS_MODEL')))
    </div>

    <div class="buttons">
        <button type="button" onclick="window.open('/radio', '_radio', 'resizable=no, toolbar=no, scrollbars=no, menubar=no, status=no, directories=no, width=640, height=640, left=0, top=0');">
            <img src="https://image.flaticon.com/icons/svg/2983/2983687.svg">
            Listen Now
        </button>
        <button type="button" onclick="window.open('{{ getenv('APK_URL') }}', '_self')">
            <img src="https://image.flaticon.com/icons/svg/270/270780.svg">
            Download Android App
        </button>
    </div>

    <div class="stats">
        Now streaming {{ number_format($stats['artists']) }} artists, {{ number_format($stats['albums']) }} albums, and {{ number_format($stats['tracks']) }} tracks, including music by:
    </div>

    <div class="artists row justify-content-center">
        @for ($i = 0; $i < 15; $i++)
            @if (!isset($artists[$i]))
                <?php break; ?>
            @endif
            <div class="artist col-md-2 sparkle" style="background-image: url('{{ $artists[$i]['image_url'] }}')">
                <div class="overlay"></div>
                <a href="/<?php echo str_replace(' ', '_', trim(preg_replace('/[^a-zA-Z0-9 ]/', '', $artists[$i]['name']))); ?>">
                    {{ $artists[$i]['name'] }}
                </a>
            </div>
        @endfor
    </div>
</div>
</body>
</html>