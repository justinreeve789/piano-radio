<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel='stylesheet' href='https://unpkg.com/plyr@3/dist/plyr.css'>
    <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css'>
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Roboto:wght@100&amp;display=swap'>
    <link rel="stylesheet" href="{{ mix('css/app.css') }}">
    <link rel="stylesheet" href="{{ mix('css/settings_piano.css') }}">
    <link rel="stylesheet" href="{{ mix('css/settings_christmaspiano.css') }}">
    <link rel="icon" href="https://image.flaticon.com/icons/svg/2983/2983687.svg">
    <title>{{ env('APP_NAME' )}}</title>
    <script src="https://cdn.jsdelivr.net/npm/ismobilejs@1/dist/isMobile.min.js"></script>
    @include('partials.analytics')
</head>
<body class="site-{{ strtolower(env('APP_SETTINGS_MODEL')) }}">
<div id="app">
    <app></app>
</div>
<script>
    const adminComponent = 'Admin{{ env('APP_SETTINGS_MODEL') }}';
    const settingsComponent = 'Settings{{ env('APP_SETTINGS_MODEL') }}';
    @if (isset($type) && isset($id))
    const selectedType = '{{ $type }}';
    const selectedId = '{{ $id }}';
    @else
    const selectedType = '';
    const selectedId = '';
    @endif
</script>
<script src="https://unpkg.com/plyr"></script>
<script src="https://unpkg.com/vue-playr"></script>
<script src="{{ mix('js/app.js') }}"></script>
</body>
</html>