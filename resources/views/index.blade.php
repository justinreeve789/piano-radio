<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="csrf-token" content="{{csrf_token()}}">
    <link rel='stylesheet' href='https://unpkg.com/plyr@3/dist/plyr.css'>
    <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css'>
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Roboto:wght@100&amp;display=swap'>
    <link rel="stylesheet" href="{{ mix('css/app.css') }}" />
    <title>{{env('APP_NAME')}}</title>
</head>
<body>
<div id="app">
    <app></app>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://unpkg.com/plyr"></script>
<script src="https://unpkg.com/vue-playr"></script>
<script src="{{ mix('js/app.js') }}"></script>
</body>
</html>