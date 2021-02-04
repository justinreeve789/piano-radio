<!-- Check https://caniuse.com/pointer-events -->
<div class="radio-play-button">
    <div class="description">Listen to piano radio</div>
    <i class="fas fa-play fa-5x"></i>
</div>

<div id="info">
    <div class="flip-card">
        <div class="flip-card-inner">
            <div class="flip-card-back">
                <div class="radio-container radio-settings">
                    <div class="radio-contents">
                        <div class="radio-options">
                            <i class="fas fa-times close"></i>
                        </div>

                        <div class="preference-row">
                            <label for="mood">Mood</label>
                            <input name="mood" class="slider" type="range" value="0" min="0" max="5" step="1">
                            <span class="value value-0">whatever</span>
                            <span class="value value-1">miserable</span>
                            <span class="value value-2">sad</span>
                            <span class="value value-3">neutral</span>
                            <span class="value value-4">happy</span>
                            <span class="value value-5">energetic</span>
                        </div>

                        <div class="preference-row">
                            <label for="mood">Style</label>
                            <input name="style" class="slider" type="range" value="0" min="0" max="3" step="1">
                            <span class="value value-0">whatever</span>
                            <span class="value value-1">solo</span>
                            <span class="value value-2">duet</span>
                            <span class="value value-3">instrumental</span>
                        </div>

                        <div class="preference-row">
                            <label for="sacred">Play sacred music</label>
                            <input name="sacred" class="slider" type="range" value="1" min="0" max="2" step="1">
                            <span class="value value-0">never</span>
                            <span class="value value-1">sometimes</span>
                            <span class="value value-2">always</span>
                        </div>

                        <div class="preference-row">
                            <label for="christmas">Play Christmas music</label>
                            <input name="christmas" class="slider" type="range" value="1" min="0" max="2" step="1">
                            <span class="value value-0">never</span>
                            <span class="value value-1">sometimes</span>
                            <span class="value value-2">always</span>
                        </div>

                        <div class="preference-row">
                            <label for="christmas">Play classical music</label>
                            <input name="christmas" class="slider" type="range" value="1" min="0" max="2" step="1">
                            <span class="value value-0">never</span>
                            <span class="value value-1">sometimes</span>
                            <span class="value value-2">always</span>
                        </div>

                        <div class="preference-row">
                            <label for="cover">Play cover music</label>
                            <input name="cover" class="slider" type="range" value="1" min="0" max="2" step="1">
                            <span class="value value-0">never</span>
                            <span class="value value-1">sometimes</span>
                            <span class="value value-2">always</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flip-card-front">
                <div class="radio-container radio-tracks">
                    <!-- <div class="radio-overlay"></div> -->
                    <div class="radio-contents">
                        <div class="radio-options">
                            <i class="fas fa-minus collapse"></i>
                            <i class="fas fa-cog settings"></i>
                        </div>

                        <div id="track-playing">
                            <div class="track-row track-current">
                                <img class="track-image" src="https://i.scdn.co/image/ab67616d0000b2738fabf7739b7663ab21536bf9" alt="" />
                                <div class="track-details">
                                    <span class="track-name">Sweet Child O' Mine</span>
                                    <span>by</span>
                                    <span class="track-artist">
											<a href="#">Gamazda</a>
									</span>
                                </div>
                                <div class="track-visualization">
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                    <div class="audio-bar"></div>
                                </div>
                            </div>
                        </div>

                        <h2>Previously Played</h2>

                        <div class="track-row track-other previous">
                            <img class="track-image" src="https://i.scdn.co/image/ab67616d0000b2730e1031ccc3490d90eca1e872" alt="" />
                            <div class="track-details">
                                <span class="track-name">Don't Stop Believing</span>
                                <span>by</span>
                                <span class="track-artist">
									<a href="#">Jarrod Radnich</a>
								</span>
                            </div>
                        </div>

                        <div class="track-row track-other previous">
                            <img class="track-image" src="https://i.scdn.co/image/62f44a5ebde63f377cba4ba499490457031d403c" alt="" />
                            <div class="track-details">
                                <span class="track-name">The Red Aspens</span>
                                <span>by</span>
                                <span class="track-artist">
									<a href="#">Jennifer Thomas</a>
								</span>
                            </div>
                        </div>

                        <div class="track-row track-other previous">
                            <img class="track-image" src="https://i.scdn.co/image/86f7963f6c2d3605ae1466d6187ddab252c1fa14" alt="" />
                            <div class="track-details">
                                <span class="track-name">Once Upon a December</span>
                                <span>by</span>
                                <span class="track-artist">
									<a href="#">Justin K. Reeve</a>
								</span>
                            </div>
                        </div>

                        <div class="track-row track-other previous">
                            <img class="track-image" src="https://i.scdn.co/image/4455bd021e21611e4a6669c97aab44618ea8417d" alt="" />
                            <div class="track-details">
                                <span class="track-name">Avatar</span>
                                <span>by</span>
                                <span class="track-artist">
									<a href="#">The Piano Guys</a>
								</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>



<div id="player-box" class="site">
    <div id="player-container">
        <div id="blank-overlay"></div>
        <div id="player-overlay">
            <div id="embedded-player" data-plyr-provider="youtube" data-plyr-embed-id="wIOa7WIbPzg"></div>
        </div>
    </div>
</div>



<footer>
    <div id="collapsed-track-playing">
        <i class="expand fas fa-angle-up"></i>
        <div class="track-container"></div>
    </div>

    <ul>
        <li>
            <a href="#">About</a>
        </li>
    </ul>
</footer>
<!-- Plyr resources and browser polyfills are specified in the pen settings -->