<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrackSourcesFailedAttempt extends Model
{
    use HasFactory;

    public function trackSource() {
        return $this->belongsTo('App\Models\TrackSource');
    }
}
