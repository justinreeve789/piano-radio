<?php

namespace App\Models\Settings;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

abstract class Settings extends Model
{
    use HasFactory;

    public $settings;

    public function getConditions() {
    }

    public function parseInput(Request $request) {
    }

    public function is_equal_to($setting, $value) {
        return (isset($this->settings[$setting]) && $this->settings[$setting] == $value);
    }

    public function generateSqlConditions() {
    }
}
