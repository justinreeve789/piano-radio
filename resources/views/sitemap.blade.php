{!! '<'.'?xml version="1.0" encoding="UTF-8"?'.'>' !!}
@if ($style)
{!! '<'.'?xml-stylesheet href="'.e($style).'" type="text/xsl"?'.'>' !!}
@endif
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
@foreach ($items as $item)
    <url>
        <loc>{{ $item['loc'] }}</loc>
        <priority>{{ $item['priority'] }}</priority>
        <lastmod>{{ $item['lastmod'] }}</lastmod>
        <changefreq>{{ $item['freq'] }}</changefreq>
    </url>
@endforeach
</urlset>
