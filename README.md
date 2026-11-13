# Piano Radio (`pianoradio.org`)

A niche, highly customizable instrumental piano streaming platform and multi-genre radio engine.

## Overview

**Piano Radio** was built to solve a very specific problem: the lack of strict mood and genre control on mainstream streaming services like Spotify. 

Mainstream recommendation algorithms often drift off course -- playing tracks that are too loud or out of character when you're trying to study, relax, or sleep. Piano Radio provides precise control over mood and style, ensuring a consistent, uninterrupted instrumental experience (no vocals, ever).

## Key Features

* **Strictly Instrumental:** Tailored specifically for solo piano and piano-accompanied instrumentals—zero vocals.
* **YouTube-Only Artist Integration:** Beyond labeled commercial artists, the platform indexes talented independent pianists with quality recordings hosted exclusively on YouTube.
* **Advanced Customization & Mood Slider:** Fine-tune your listening experience using a custom mood slider powered by Spotify data and audio analysis. Toggle between preferences like solo piano, piano + instrumental, Christmas, sacred, and classical music.
* **Artist-Specific Stations:** Every indexed artist features their own dedicated, synchronized radio station (e.g., [Justin K. Reeve's Station](https://pianoradio.org/Justin_K_Reeve/listen)).
* **Android Companion App:** A dedicated app allowing background playback while your screen is off or while multitasking on your phone.
* **Multi-Genre Extensible Core:** The underlying codebase can easily be repurposed for other genres by defining a new data model and settings layout (as seen with the metal and epic music spin-offs).

---

## Technical Details & Architecture

### Media Handling & Fallbacks
* **No Direct Hosting:** The site does not host any audio files directly. Instead, it embeds and runs background YouTube or SoundCloud players.
* **Self-Healing Links:** If a track becomes unavailable, it is automatically removed. The backend routinely crawls and attempts to locate viable alternative tracks until a replacement is found.

### Synchronized Daily Playlists & Bitmasks
* **Bitmask Generation:** User customization settings translate into a distinct bitmask.
* **Deterministic Seeding:** Combined with a date-based random seed, this bitmask determines the daily schedule. 
* **State Preservation:** If a user changes their settings and later returns to their original preferences, they rejoin the exact time index of the playlist everyone else with those same settings is currently hearing.

### Fair Airtime Algorithm
* A **logarithmic formula** governs how many tracks by a single artist can appear in a given daily playlist, purposely ensuring that lesser-known and independent artists receive fair airtime.

### Automated Scraping & Discovery Pipeline
* The platform automatically updates its artist catalog using data crawled from Spotify and YouTube.
* It attempts to discover artist social profiles (Facebook, Instagram, Bandcamp) and sheet music collections. *Note: While automated, entries go through a human review step before official publication.*

---

## Future Roadmap

* Developing a unified global search engine for artists, albums, and songs across all genre instances.
* Expanding the automated discovery and metadata curation pipeline.
* Launching additional genre instances.
* Add a Docker container for rapid deployment.

---

## License & Usage

Enjoy listening, exploring, and discovering new piano artists! Feel free to check out the site or test out the companion Android app.
