import type { NowPlayingAPI, SongData } from "../types";

import "./lib/npapi/browser-npapi.js";
import "./lib/screen.js";

import { updateNowPlaying } from "./lib/nowplaying.js";
import { putLyricsInPlace } from "./lib/lyrics.js";
import songdata from "./lib/songdata.js";

import "./lib/buttons.js";
import "./lib/event.js";
import "./lib/seekbar.js";

declare global {
	// eslint-disable-next-line no-unused-vars
	interface Window {
		title: string,
		np: NowPlayingAPI,
		getNowPlaying?: () => SongData,
		detectedLanguage?: string,
		copyLyrics?: () => (string | undefined);
		copyLyricsTranslated?: () => (string | undefined);
	}
}

window.title = "Sunamu" + (document.documentElement.classList.contains("widget-mode") ? " Widget" : "");

// Expose debug stuff
if(await window.np.isDebugMode()){
	window.getNowPlaying = () => songdata;
	window.detectedLanguage = navigator.language.split("-")[0];
	window.copyLyrics = () => songdata.lyrics?.lines?.map(x => x.text).join("\n") + `\n\n("${songdata.metadata.title}" - ${songdata.metadata.artist})`;
	window.copyLyricsTranslated = () => songdata.lyrics?.lines?.map(x => x.translation || x.text).join("\n") + `\n\n("${songdata.metadata.title}" - ${songdata.metadata.artist})`;
}

updateNowPlaying();
putLyricsInPlace();
