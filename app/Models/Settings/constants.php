<?php

/*
 * Setting values shared by the site settings models.
 *
 * These used to be declared at the top of each model file. Loading two of those models in
 * the same process (tests, or a worker that serves several sites) redeclared the constants,
 * which PHP 8.5 reports as a warning and Laravel turns into an exception.
 */

namespace App\Models\Settings;

const ALWAYS = 2;
const CHRISTMAS_ALWAYS = 2;
const CHRISTMAS_NEVER = 0;
const CHRISTMAS_SOMETIMES = 1;
const CLASSICAL_ALWAYS = 2;
const CLASSICAL_NEVER = 0;
const CLASSICAL_SOMETIMES = 1;
const GENRE_WHATEVER = 0;
const LABELED_ALWAYS = 2;
const LABELED_NEVER = 0;
const LABELED_SOMETIMES = 1;
const MOOD_GENTLE = 1;
const MOOD_HIGH = 3;
const MOOD_LIVELY = 3;
const MOOD_LOW = 1;
const MOOD_MEDIUM = 2;
const MOOD_NATURAL = 2;
const NEVER = 0;
const OFF = 0;
const ON = 1;
const SACRED_ALWAYS = 2;
const SACRED_NEVER = 0;
const SACRED_SOMETIMES = 1;
const SOMETIMES = 1;
const STYLE_INSTRUMENTAL = 2;
const STYLE_SOLO = 1;
