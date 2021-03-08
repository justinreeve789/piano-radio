<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>{{ env('APP_NAME' )}}</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link rel="stylesheet" href="{{ mix('css/home.css') }}" />
</head>
<body>
<header>
    <div class="title">
        {{ env('APP_NAME') }}
    </div>
</header>
<div id="main" class="container">
    <div class="description">
        @include('sites/piano')
    </div>

    <div class="buttons">
        <button type="button" onclick="window.open('/radio', '_radio', 'resizable=no, toolbar=no, scrollbars=no, menubar=no, status=no, directories=no, width=640, height=640, left=0, top=0');">
            <img src="https://image.flaticon.com/icons/svg/2983/2983687.svg">
            Listen Now
        </button>
    </div>

    <div class="stats">
        Now streaming {{ $stats->artists }} artists, {{ $stats->albums }} albums, and {{ $stats->tracks }} tracks, including music by:
    </div>

    <div class="artists row">
        @for ($i = 0; $i < 24; $i++)
            @if (!isset($artists[$i]))
                <?php break; ?>
            @endif
            <div class="artist col col-md-2 sparkle" style="background-image: url('{{ $artists[$i]['image_url'] }}')">
                <div class="overlay"></div>
                <a href="/artist/<?php echo str_replace(' ', '_', trim(preg_replace('/[^a-zA-Z0-9 ]/', '', $artists[$i]['name']))); ?>">
                    <span>{{ $artists[$i]['name'] }}</span>
                </a>
            </div>
        @endfor
    </div>
</div>
</body>
</html>