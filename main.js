function zeroPad (value, length) {
	value = String(value);
	while (value.length < length) {
		value = '0' + value;
	}
	return value;
}

function wfmtDateToDate (sDate) {
	var dateParts = sDate.match(/^\s*(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)\s*$/);
	var dateObj;
	if (! dateParts) {
		return new Date;
	}
	return new Date(dateParts[3], parseInt(dateParts[1])-1, dateParts[2], dateParts[4], dateParts[5], dateParts[6]);
}

function Song () {
	this.time;
	this.artist;
	this.composer;
	this.conductor;
	this.name;
}

function wfmtToSong (playlistSong) {
	var song = new Song();
	song.time = wfmtDateToDate(playlistSong._start_time);
	song.artist = playlistSong.artistName.replace(/"/g,'');
	song.composer = playlistSong.composerName;
	song.conductor = playlistSong.conductor
	song.name = playlistSong.trackName.replace(/"/g,'');
	return song;
}

function extractHour (playlist, remoteHour, localHour) {
	var extract = [];
	for (var x = 0; x < playlist.length; x++) {
		if (playlist[x].time.getHours() == remoteHour) {
			playlist[x].time.setHours(localHour)
			extract.push(playlist[x]);
		}
	}
	console.log("Extracted");
	console.log(extract);
	return extract
}

function parseList (playlist, date) {
	var extract;
	var localList = [];
	switch (date.getDay()) {
		// Sunday - wfmt 5-8a = kmst 8-11p
		case 0:
			localList = localList.concat(extractHour(playlist, 5, 20));
			localList = localList.concat(extractHour(playlist, 6, 21));
			localList = localList.concat(extractHour(playlist, 7, 22));
			localList = localList.concat(extractHour(playlist, 8, 23));
			break;
		// Sunday - wfmt 7-9a = kmst 10-11p
		default:
			localList = localList.concat(extractHour(playlist, 7, 22));
			localList = localList.concat(extractHour(playlist, 8, 23));
	}
	console.log("Local list:");
	console.log(localList);
	return localList;
}

function getTimeStr (date) {
	return zeroPad(date.getHours(), 2) + ':'
		+ zeroPad(date.getMinutes(), 2) + ':'
		+ zeroPad(date.getSeconds(), 2);
}

function getDateStr (date) {
	return zeroPad(date.getMonth()+1, 2) + '/'
		+ zeroPad(date.getDate(), 2) + '/'
		+ date.getFullYear();
}

function printList (playlist) {
	var preStr = "Date\tTime\tTitle\n";
	for (var x = 0; x < playlist.length; x++) {
		preStr += getDateStr(playlist[x].time);
		preStr += '\t' + getTimeStr(playlist[x].time);
		preStr += '\t' + playlist[x].name;
		preStr += '\n';
	}
	$('#playlist').text(preStr);
}

function submit() {
	var wfmt_playlist;
	var baseUrl="https://api.composer.nprstations.org/v1/widget/55913d0c8fa46b530f88384b/playlist"
	var pdate = $("#datepicker").val();
	var splitdate = pdate.split('/');
	var datestamp;
	
	if (splitdate.length < 3) {
		alert("Please enter a valid date");
		return;
	}
	datestamp = splitdate[2] + '-' + splitdate[0] + '-' + splitdate[1];
	
	$.get(baseUrl, {datestamp:datestamp}, function (res) {
		var importList = res.playlist[0].playlist
		var playlist = [];
		for (var x = 0; x < importList.length; x++) {
			playlist.push(wfmtToSong(importList[x]));
		}
		console.log(playlist);
		var localList = parseList(playlist, new Date(splitdate[2], parseInt(splitdate[0])-1, splitdate[1]));
		printList(localList);
	});
}
$(document).ready(function main () {
	$("#datepicker").datepicker();
	//var baseUrl="https://api.composer.nprstations.org/v1/widget/55913d0c8fa46b530f88384b/playlist?t=1449017160141&prog_id=55918f8833f3e8d54ee26252&datestamp=2015-12-01";
	var nowDate = new Date();
	$("#datepicker").val((nowDate.getMonth()+1) + '/' + zeroPad(nowDate.getDate(), 2) + '/' + nowDate.getFullYear());
});