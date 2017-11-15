/**
* Ouvre le player aux controles exterieurs.
* @Copyright Kalyz&e
*
*/
var KalyzeePlayerApi = function(playerObject){

	this.domains = null;
	_this = this;
	this.playerObject = playerObject;


	this.setAllowedDomains = function(domains){
		this.domains = domains;
	}


	this.subscribeMessageEvent = function(callback){
		if (window.addEventListener){
			window.addEventListener("message", callback, false);
		}else{
			window.attachEvent("message", callback, false);
		}
	}

	this.initApi = function(){
		if (parent){
			parent.postMessage({"type":"event_player_ready"},"*");
		}


		_this.subscribeMessageEvent(function(event){
			if (typeof(event.data) == "object" && event.data.type){
				var data = event.data;
				switch (data.type){
					case "play":

						_this.playerObject.play();
					break;
					case "pause":
						_this.playerObject.pause();
					break;
					case "togglePlay":
						_this.playerObject.togglePlay();
					break;
					case "stop":
						_this.playerObject.stop();
					break;
					case "seek":
						if (data.time){
							_this.playerObject.seek(data.time);
						}
					break;
					case "subscribe_on_time_update":
						_this.playerObject.onTimeUpdate(function(e){
							event.source.postMessage({"type": "event_time_update", "time": e.time} ,"*")
						});
					break;
					case "subscribe_on_seek":
						_this.playerObject.onSeek(function(e){
							event.source.postMessage({"type": "event_seek", "from": e.from, "to": e.to} ,"*")
						});
					break;
					case "subscribe_on_play":
						_this.playerObject.onPlay(function(e){
							event.source.postMessage({"type": "event_play"} ,"*")
						});
					break;
					case "subscribe_on_pause":
						_this.playerObject.onPause(function(e){
							event.source.postMessage({"type": "event_pause"} ,"*")
						});
					break;
					case "subscribe_on_volume_change":
						_this.playerObject.onVolumeChange(function(volume){
							event.source.postMessage({"type": "event_volume_change", "volume": volume} ,"*");
						});
					break;
					case "subscribe_on_end":
						_this.playerObject.onEnd(function(){
							event.source.postMessage({"type": "event_end"} ,"*");
						});
					break;
					case "interactivity":
						console.log(data);
						if (data.event){
							if(data.event == "image" ){
								popcorn.image({"src": data.src, "end": data.end, "target": "video-container", "tags": "", "top": data.top, "transition": "popcorn-fade", "height": data.height, "zindex": 997, "start": data.start, "linkSrc": data.link, "photosetId": "", "width": data.width, "left": data.left});

							}
						}



					break;
				}
			}

		});
	}


	this.initApi();
}
