<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Artist extends Model
{
    use HasFactory;

    public function albums() {
        return $this->hasMany('App\Models\Album');
    }

    public function artistTags() {
        return $this->hasMany('App\Models\ArtistTag');
    }
}