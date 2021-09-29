import lang from "./lang.js";
import songdata from "./songdata.js";

import { query as Musixmatch } from "./lyricproviders/musixmatch.js";
import { query as NetEase } from "./lyricproviders/netease.js";
import { query as Genius } from "./lyricproviders/genius.js";

const container = document.getElementsByClassName("lyrics")[0];
const footer = document.getElementsByClassName("lyrics-footer")[0];

export async function queryLyrics(){
	let lyrics;
	
	const providers = {
		Musixmatch,
		NetEase,
		Genius
	};

	for(const provider in providers){
		console.debug("Fetching from " + provider);
		lyrics = await providers[provider]();
		if(lyrics) break;
	}

	if(lyrics)
		songdata.lyrics = lyrics;
}

export function putLyricsInPlace(){
	// remove all children of container
	container.classList.remove("synchronized");
	while (container.firstChild) container.removeChild(container.lastChild);

	// remove text from footer
	footer.textContent = "";

	// start checking for no lyrics
	if(!songdata.lyrics){
		// we exploit the synchronized flex to center the no lyrics line
		container.classList.add("synchronized");

		const noLyrics = document.createElement("span");
		noLyrics.classList.add("line");
		noLyrics.textContent = lang.NO_LYRICS;
		container.appendChild(noLyrics);
		noLyrics.scrollIntoView({
			inline: "center",
			block: "center",
			behavior: "smooth"
		});
		return;
	}

	// we are good with lyrics so we push them all
	if(songdata.lyrics.synchronized && songdata.capabilities.canSeek)
		container.classList.add("synchronized");

	for(const line of songdata.lyrics.lines){
		const elem = document.createElement("span");
		elem.classList.add("line");
		elem.textContent = line.text;
		container.appendChild(elem);
	}

	// we put the copyright where it is supposed to be
	footer.textContent = `Provided by ${songdata.lyrics.provider}`;
	if(songdata.lyrics.copyright)
		footer.textContent += ` • ${songdata.lyrics.copyright}`;
}

export function updateActiveLyrics(){
	if (!songdata.lyrics || !songdata.lyrics.synchronized || !songdata.capabilities.canSeek) return;
	// we get the active one
	let lineIndex = songdata.lyrics.lines.length - 1;
	for(let i = 0; i < songdata.lyrics.lines.length; i++){
		if(songdata.elapsed < songdata.lyrics.lines[i+1]?.time){
			lineIndex = i;
			break;
		}
	}

	// now we iterate through the container to unset previous active stuff
	const wasActiveBefore = container.children[lineIndex]?.classList?.contains("active");

	for(let i = 0; i < container.children.length; i++){
		if(i === lineIndex)
			container.children[i].classList?.add("active");
		else
			container.children[i].classList?.remove("active");
	}

	// now we bring the active into view
	if(!wasActiveBefore){
		container.children[lineIndex]?.scrollIntoView({
			inline: "center",
			block: "center",
			behavior: "smooth"
		});
	}
}