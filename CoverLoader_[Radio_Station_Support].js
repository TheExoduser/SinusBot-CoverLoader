registerPlugin({
	name: 'CoverLoader',
	version: '1.1',
	description: 'Update every cover art of playing tracks, even from radio stations. Powered by api.deezer.com',
	author: 'Kevin Händel <kevinhaendel@gmail.com>',
	requiredModules: ['http'],
	vars: [{
		name: 'setLocalTracksCoverArt',
		title: 'In addition to streams, do you want to set the cover art of local saved tracks?',
		type: 'select',
		options: [
			'No',
			'Yes'
		]
	},
	{
		name: 'updateLocalTracksCoverArt',
		title: 'If you enabled the option above, do you want to update the cover art if they changed?',
		type: 'select',
		options: [
			'No',
			'Yes'
		]
	},
	{
		name: 'setAsAvatar',
		title: 'Do you want to set the downloaded cover art as avatar? (If "No", Covatar won\'t set the updated cover art)',
		type: 'select',
		options: [
			'No',
			'Yes'
		]
	}]
}, function(sinusbot, config) {
	var event = require('event');
	var engine = require('engine');
	var http = require('http');

	// Since there is no way to detect when the thumbnail is downloaded, we have to use this "trick" ...
	var avatarMiniCache = undefined;
	var avatarCheckInverval = undefined;

	event.on('track', function(track) {
		if (track.type() == '' || track.type() == 'track') {
			avatarMiniCache = undefined;
			if (avatarCheckInverval) {
				clearInterval(avatarCheckInverval);
				avatarCheckInverval = undefined;
			}
			if (config.setLocalTracksCoverArt) {
				if (!track.thumbnail() || config.updateLocalTracksCoverArt) {
					if (track.title() != '' && track.artist() != '') {
						var searchString = track.artist().split(' feat.')[0].split(' & ')[0] + ' - ' + track.title().replace(new RegExp('`', 'g'), "'").replace(new RegExp('´', 'g'), "'");
						engine.log('Searching cover art for ' + track.artist() + ' - ' + track.title() + ' ...');
						//sinusbot.http({
						http.simpleRequest({
							method: 'GET',
							url: 'http://api.deezer.com/search?q=' + encodeURIComponent(searchString) + '&limit=1',
							timeout: 30000
						}, function(error, response) {
							if (typeof response != 'undefined' && response.statusCode == 200) {
								var sres = JSON.parse(response.data);
								if (sres && sres.data && sres.data.length > 0) {
									var deezTrack = sres.data[0];
									if (deezTrack.album && deezTrack.album.cover_medium) {
										track.setThumbnailFromURL(deezTrack.album.cover_medium.substr(0, deezTrack.album.cover_medium.lastIndexOf(".")) + ".png");
										if (config.setAsAvatar) {
											avatarMiniCache = track.thumbnail();
											var maxTries = 15;
											avatarCheckInverval = setInterval(function() {
												if (track.thumbnail() != avatarMiniCache) {
													clearInterval(avatarCheckInverval);
													avatarCheckInverval = undefined;
													if (!engine.setAvatarFromTrack(track)) {
														engine.setDefaultAvatar();
													}
													avatarMiniCache = undefined;
												}
												if (maxTries > 0) {
													maxTries--;
												} else {
													clearInterval(avatarCheckInverval);
													avatarCheckInverval = undefined;
													avatarMiniCache = undefined;
												}
											}, 1000);
										}
										engine.log('Updated cover art!');
									}
								} else {
									engine.log('No cover art found!');
								}
							}
						});
					}
				}
			}
		}
	});
	
	event.on('trackInfo', function(track) {
		if (track.type() == 'url') {
			avatarMiniCache = undefined;
			if (avatarCheckInverval) {
				clearInterval(avatarCheckInverval);
				avatarCheckInverval = undefined;
			}
			if (track.tempTitle() != '' && track.tempArtist() != '') {
				var searchString = track.tempArtist().replace(new RegExp('`', 'g'), "'").replace(new RegExp('´', 'g'), "'").replace(/ ?((\[|\().*feat\. ?.*(\]|\)))|( ?feat\..*)/g, '') + ' - ' + track.tempTitle().replace(new RegExp('`', 'g'), "'").replace(new RegExp('´', 'g'), "'").replace(/ ?((\[|\().*feat\. ?.*(\]|\)))|( ?feat\..*)/g, '');
				engine.log('Searching cover art for ' + track.tempArtist() + ' - ' + track.tempTitle() + ' ...');
				http.simpleRequest({
					method: 'GET',
					url: 'http://api.deezer.com/search?q=' + encodeURIComponent(searchString) + '&limit=1',
					timeout: 30000
				}, function(error, response) {
					if (typeof response != 'undefined' && response.statusCode == 200) {
						var sres = JSON.parse(response.data);
						if (sres && sres.data && sres.data.length > 0) {
							var deezTrack = sres.data[0];
							if (deezTrack.album && deezTrack.album.cover_medium) {
								track.setThumbnailFromURL(deezTrack.album.cover_medium.substr(0, deezTrack.album.cover_medium.lastIndexOf(".")) + ".png");
								if (config.setAsAvatar) {
									avatarMiniCache = track.thumbnail();
									var maxTries = 15;
									avatarCheckInverval = setInterval(function() {
										if (track.thumbnail() != avatarMiniCache) {
											clearInterval(avatarCheckInverval);
											avatarCheckInverval = undefined;
											if (!engine.setAvatarFromTrack(track)) {
												engine.setDefaultAvatar();
											}
											avatarMiniCache = undefined;
										}
										if (maxTries > 0) {
											maxTries--;
										} else {
											clearInterval(avatarCheckInverval);
											avatarCheckInverval = undefined;
											avatarMiniCache = undefined;
										}
									}, 1000);
								}
								engine.log('Updated cover art!');
							}
						} else {
							engine.log('No cover art found!');
						}
					}
				});
			}
		}
	});
});
