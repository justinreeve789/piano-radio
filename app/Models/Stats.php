<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stats extends Model
{
    use HasFactory;

    protected $primaryKey = 'key';

    public static function last_updated() {
        return self::min('updated_at');
    }

    public static function track_count() {
        return self::where('key', 'track_count')->pluck('value')->first();
    }

    public static function album_count() {
        return self::where('key', 'album_count')->pluck('value')->first();
    }

    public static function artist_count() {
        return self::where('key', 'artist_count')->pluck('value')->first();
    }
}
