<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrackSource extends Model
{
    use HasFactory;

    public function track() {
        return $this->belongsTo('App\Models\Track');
    }
}