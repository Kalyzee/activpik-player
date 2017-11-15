/**
*  Kalyzée HTML5 Player V1.0
*
*
*/
var kalyzeeVideoPlayer = function(id, options){


  var _listeners = new Array();

  var quality = "sd";

  var _id = id;

  var _playerModel = new Html5PlayerModel(id);

  var _this = this;
  var _controlbarElement = document.getElementById("controlbar");
  var _containerElement = document.getElementById("container");

  var _videoContainerElement = document.getElementById("video-container");
  var _timeProgressElement = $(".kpl-time.kpl-progressbar .kpl-progress");

  var _currentTimeElement = $(".kpl-current-time");

  var _timeProgressBarElement = $(".kpl-time.kpl-progressbar");
  var _volumeProgressBarElement = $(".kpl-volume.kpl-progressbar")
  var _volumeProgressElement = $(".kpl-volume.kpl-progressbar .kpl-progress");
  var _playButton = $(".kpl-play-pause-button")[0];
  var _buttonVolume = $(".kpl-button.kpl-volume");
  var _hdButton = $(".kpl-button.kpl-hd");

  var _videoOverlayElement = document.getElementById("video-overlay");


  var _hideControlBarLock = false;

  var _timerControlBar = null;

  var _controlsActive = true

  /**
  *
  */
  var _timecodedEventsBegin = [];
  var _timecodedEventsEnd = [];
  var _lastTime = -0.25;
  var _seekLock = false;

  /**
  * Player chapters
  */
  var _chapters = [];

  var _buttons = [];

  var _defaultOptions = {chapters : [], time: -1, ratioVideo:16/9};
  var _options = $.extend({}, _defaultOptions, options) ;
  var _addlisteners = function(eventName, listener){
    if (_listeners[eventName] === undefined){
      _listeners[eventName] = new Array();
    }
    _listeners[eventName].push(listener);
  }

  var _fireListeners = function(eventName, callback){
    for (listener in _listeners[eventName]){
        if (typeof(_listeners[eventName][listener]) === "function" ){
            callback(_listeners[eventName][listener]);
        }
    }
  }

  this.play = function(){
    _playerModel.play();
  }

  this.pause = function(){
    _playerModel.pause();
  }

  this.init = function(){
    this.initControls();
    this.initEvents();
    this.initPlugins();
    this.initVideoOverLay();

  }

  this.initVideoOverLay = function(){

        $(window).resize(function(event){
            _this.resizeVideoOverlay();
            _this.fireOnResize();
        });

        _this.fireOnResize();
        _this.resizeVideoOverlay();
  }

  this.resizeVideoOverlay = function(){
      var ratioVideo = _options.ratioVideo;
      var ratioPlayer = $("#video").width()/$("#video").height();
      if (ratioPlayer > ratioVideo){
        var width = $("#video").height()*ratioVideo;
        $(_videoOverlayElement).css("top", 0);
        $(_videoOverlayElement).css("bottom", 0);
        $(_videoOverlayElement).css("left", $("#video-container").width()/2 - width/2);
        $(_videoOverlayElement).css("right", $("#video-container").width()/2 - width/2);

      }else {
        var height = $("#video").width()/ratioVideo;
        $(_videoOverlayElement).css("top", $("#video-container").height()/2 - height/2);
        $(_videoOverlayElement).css("bottom", $("#video-container").height()/2 - height/2);
        $(_videoOverlayElement).css("left", 0);
        $(_videoOverlayElement).css("right", 0);
      }


  }


  this.initEvents = function(){
      _playerModel.addEventListener("pause", function(event){
        _this.fireOnPause();
      }, false);

     _playerModel.addEventListener("play", function(event){
          _this.fireOnPlay();
      }, false);

     _playerModel.addEventListener("canplay", function(event){
          _this.fireOnCanPlay();
      }, false);

     _playerModel.addEventListener("loadeddata", function(event){
          _this.fireOnLoadedData();
      }, false);

      _playerModel.addEventListener("loadedmetadata", function(event){
          _this.fireOnLoadedMetaData();
      }, false);

    _this.onTimeUpdate(_updateTime);
    _this.onTimeUpdate(_onTimeTimecodedEventManager);
    _this.onSeek(_onSeekTimecodedEventManager);

  }


  this.enableHD = function(){
    _playerModel.enableQuality("hd");
    _hdButton.removeClass("kpl-sd");
  }

  this.enableSD = function(){
      _playerModel.enableQuality("sd");
      _hdButton.addClass("kpl-sd");
  }

  /**
  *
  *
  * @returns "hd" if HD
  * @return "sd" if SD
  */
  this.getFormat = function(){
    return quality;
  }

  /**
  *
  * @returns true if HD is available
  */
  this.isHDAvailable = function(){
    return _playerModel.isHDAvailable();
  }


  /**
  * Switch to HD
  * @returns true if HD is available
  */
  this.toggleHD = function(){
    if (this.getFormat() == "hd"){
      this.enableSD();
    }else{
      this.enableHD();
    }
  }

  this.togglePlay = function(){
    if (_playerModel.isPaused()){
      _this.play();
    }else{
      _this.pause();
    }
  }

  this.isPaused = function(){
    return _playerModel.isPaused();
  }

  this.toggleFullScreen = function(){
    if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
        _this.enterFullScreen();
      }else{
        _this.exitFullScreen();
      }
  }

  this.exitFullScreen = function(){
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }

    _this.fireOnResize();

  }

  this.enterFullScreen = function(){
      if (_containerElement.requestFullscreen) {
        _containerElement.requestFullscreen();
      } else if (_containerElement.msRequestFullscreen) {
        _containerElement.msRequestFullscreen();
      } else if (_containerElement.mozRequestFullScreen) {
        _containerElement.mozRequestFullScreen();
      } else if (_containerElement.webkitRequestFullscreen) {
        _containerElement.webkitRequestFullscreen();
    }
    _this.fireOnResize();

  }


  this.addChapter = function(time, title){
    _chapters.push({"time": time, "title": title});
  }

  this.goToChapter = function(chapter){
    this.seek(chapter.time);
  }

  /**
    chapter : {time : 10, title: 'Title'}
  */
  this.showChapter = function(chapter){
    var poiElement = document.createElement("div");
    poiElement.className = "kpl-poi";
    poiElement.setAttribute("data-time", chapter.time);
    _timeProgressBarElement.append(poiElement);
    $(poiElement).css("left", chapter.time/_playerModel.getDuration()*100+"%")
    $(poiElement).click(function(){
      _this.seek($(this).attr("data-time"));
    });
  }

  this.showChapters = function(){
    $(".kpl-poi").remove();
    for (i = 0; i < _chapters.length; i++) {
      this.showChapter(_chapters[i]);
    }
  }

  this.initChapters = function(){
    this.showChapters();
  }

  this.initControls = function(){
      for (chapter in _options.chapters){
         this.addChapter(_options.chapters[chapter].time, _options.chapters[chapter].title);

      }
      _playButton.onclick = function(){
          _this.togglePlay();
      };

      _playerModel.init();

      /*$(_videoElement).click(function(){
        _this.togglePlay();
      })*/

      _playerModel.addEventListener("timeupdate", function(event){
          $(_timeProgressElement).width(_playerModel.getCurrentTime() /_playerModel.getDuration()*100+"%");
          _this.fireOnTimeUpdate();
          _this.initChapters();

      }, false);

      _playerModel.addEventListener("waiting", function(event){

      }, false);

      _playerModel.addEventListener("pause", function(event){
          _playButton.classList.remove("kpl-pause");
          _playButton.classList.add("kpl-play");
      }, false);

      _playerModel.addEventListener("play", function(event){
          _playButton.classList.remove("kpl-play");
          _playButton.classList.add("kpl-pause");

      }, false);

      _playerModel.addEventListener("volumechange", function(event){
          if (_playerModel.isMuted()) {
            $(_buttonVolume).addClass("kpl-mute");
            _volumeProgressElement.width(0);
          }else{
              $(_buttonVolume).removeClass("kpl-mute");
              _volumeProgressElement.width(_playerModel.getVolume()*100+"%");
          }


      }, false);


      _playerModel.addEventListener("ended", function(){
        _this.fireOnEnd();
      });

      $(_timeProgressBarElement).click(function(e){
          var parentOffset = $(this).offset();
           var relX = e.pageX - parentOffset.left;
          _this.seek((relX)/$(_timeProgressBarElement).width()*_playerModel.getDuration());

      });

      $(_volumeProgressBarElement).click(function(e){
          var parentOffset = $(this).offset();
           var relX = e.pageX - parentOffset.left;
          _this.setVolume((relX)/$(_volumeProgressBarElement).width());

      });

      $(_volumeProgressBarElement).mousedown(function(e){
          var parentOffset = $(this).offset();
           var relX = e.pageX - parentOffset.left;
          _this.setVolume((relX)/$(_volumeProgressBarElement).width());

      });

      $(_volumeProgressElement).width(_playerModel.getVolume()*100+"%");

      $(_buttonVolume).click(function(){
         if (_playerModel.isMuted()){
             _playerModel.setMuted(false);
         }else{
             _playerModel.setMuted(true);
         }

      })

      $(".kpl-fullscreen").click(function(){
        _this.toggleFullScreen();
      })

      _hdButton.click(function(){
        _this.toggleHD();
      })



      var displayHideControlRegisterEvents = function(element){
        $(element).mouseenter(function(){

            if (_controlsActive){
              _this.showControls();
            }

        });

        $(element).mouseleave(function(){
          _timerControlBar = setTimeout(function(){
              _this.hideControls();
            },500)
          }).mouseenter(function(){
              clearTimeout(_timerControlBar);
          });

      };


        displayHideControlRegisterEvents(_videoContainerElement);
        displayHideControlRegisterEvents(_videoOverlayElement);

  }

  this.showControls = function(){
      $(_controlbarElement).fadeIn()
      _this.fireOnShowControls();
  }

  this.hideControls = function(){
    $(_controlbarElement).fadeOut()
    _this.fireOnHideControls();
  }

  this.isControlbarVisible = function(){
    return $(_controlbarElement).is(":visible");
  }

  this.seek = function(time){
    if((time > 0 && time < _playerModel.getDuration()) )
      _this.fireOnSeek(time);
      _playerModel.seek(time);
  }

  this.setVolume = function(volume){
    if (volume >= 0 && volume <= 1){
      _playerModel.setVolume(volume);
    }
  }

  this.fireOnTimeUpdate = function() {
    _fireListeners("onTime", function(callback) {
      callback({"time": parseInt(Math.round(_playerModel.getCurrentTime()*4))/4});
    });
  }

  this.fireOnCanPlay = function(){
      _fireListeners("onCanPlay", function(callback){
        callback();
      });
  }

  this.fireOnLoadedData = function(){
      _fireListeners("onLoadedData", function(callback){
        callback();
      });
  }

  this.fireOnLoadedMetaData = function(){
      _fireListeners("onLoadedMetaData", function(callback){
        callback();
      });
  }

  this.onVolumeChange = function(callback){
    _addlisteners("onVolumeChange", callback);
  }

  this.onHideControls = function(callback){
    _addlisteners("onHideControls", callback);

  }

  this.onShowControls = function(callback){
    _addlisteners("onShowControls", callback);
  }

  this.onCanPlay = function(callback){
    _addlisteners("onCanPlay", callback);
  }

  this.onLoadedData = function(callback){
    _addlisteners("onLoadedData", callback);
  }

  this.onLoadedData = function(callback){
    _addlisteners("onLoadedMetaData", callback);
  }

  /**
  * Never display controls
  */
  this.disableControls = function(){
    _controlsActive = false;
    _this.hideControls();
  }

  /**
  *  Reactive controls
  */
  this.enableControls = function(){
   _controlsActive = true;
   _this.showControls();
  }

  this.fireOnHideControls = function(){
    _fireListeners("onHideControls", function(callback){
        callback();
    });
  }

  this.fireOnShowControls = function(){
      _fireListeners("onShowControls", function(callback){
      callback();
    });
  }

  this.fireOnVolumeChange = function(){
      _fireListeners("onVolumeChange", function(callback){
        callback();
      });
  }

  this.onTimeUpdate = function(callback){
    _addlisteners("onTime", callback);
  }

  this.fireOnSeek = function(time) {
    _fireListeners("onSeek", function(callback) {
      callback({"from": parseInt(Math.round(_playerModel.getCurrentTime()*4)), "to": parseInt(Math.round(time*4))});
    });
  }

  this.onResize = function(callback){
    _addlisteners("onResize", callback);
  }

  this.fireOnResize = function(){
      _fireListeners("onResize", function(callback){
        callback();
      });
  }

  this.onSeek = function(callback){
    _addlisteners("onSeek", callback);
  }


  this.onPause = function(callback){
    _addlisteners("onPause", callback);
  }

  this.fireOnPause = function(time){
      _fireListeners("onPause", function(callback){
        callback();
      });
  }


  this.onPlay = function(callback){
    _addlisteners("onPlay", callback);
  }


  this.fireOnPlay = function(time){
      _fireListeners("onPlay", function(callback){
        callback();
      });
  }

  this.onEnd = function(callback){
    _addlisteners("onEnd", callback);
  }


  this.fireOnEnd = function(){
      _fireListeners("onEnd", function(callback){
        callback();
      });
  }

  this.initPlugins = function(){
      for (i in options.plugins){
        options.plugins[i].initPlugin(this);
      }
  }

  this.getCurrentTime = function(){
    return _playerModel.getCurrentTime();
  }


  this.getVideoContainer = function(){
    return _videoContainerElement;
  }

  this.getVideoOverlayContainer = function(){
    return _videoOverlayElement;
  }

  /**
  * Create a button
  */
  this.createButton = function(name, id, classname){
    var button = document.createElement(button);
    button.setAttribute("class", classname);
    button.setAttribute("id", "player-button-"+id);

    this.getVideoContainer().appendChild(button);

    _buttons[id] = button;

    return button;
  }


  this.getButtonById = function(id){
    return _buttons[id];
  }


  /**
  * Liste des chapitres
  */
  this.getChapters = function(){
    return _chapters;
  }


  var _pushOnEventArrayAtTime = function(array, time, event){
    if (array[time] === undefined){
      array[time] = [];
    }
    array[time].push(event);
  }

/*
  var _launchEventsAtTimeCode = function(time) {
    if (_timecodedEventsBegin[time] !== undefined) {
      for (key in _timecodedEventsBegin[time]) {
        _timecodedEventsBegin[time][key].onBegin();
      }
    }
    if (_timecodedEventsEnd[time] !== undefined) {
      for (key in _timecodedEventsEnd[time]) {
        _timecodedEventsEnd[time][key].onEnd();
      }
    }
  }
*/
  // Version du 22/12/2015
  var _launchEventsAtTime = function(timecodedEventsOne, timecodedEventsTwo, time) {
    if (timecodedEventsOne[time] !== undefined)
      for (key in timecodedEventsOne[time])
        timecodedEventsOne[time][key].onBegin();
    if (timecodedEventsTwo[time] !== undefined)
      for (key in timecodedEventsTwo[time])
        timecodedEventsTwo[time][key].onEnd();
  }

  var _onSeekTimecodedEventManager = function(eventData) {
    _seekLock = true;
    _lastTime = eventData.to;
    var fromTime = eventData.from;
    var toTime = eventData.to;
    var playerDuration = parseInt(Math.round(_playerModel.getDuration()*4));

/*
    if (eventData.from > eventData.to) {
      var time;
      for (time = fromTime; time <= playerDuration; time++) {
        // console.log(time);
        for (key in _timecodedEventsEnd[time]) {
          _timecodedEventsEnd[time][key].onEnd();
        }
      }
      for (time = 0; time <= toTime; time++) {
        _launchEventsAtTimeCode(time);
      }
    } else {
      if (eventData.from < eventData.to) {
        var time;
        for (time = fromTime; time <= toTime; time++) {
          _launchEventsAtTimeCode(time);
        }
      }
    }
*/
    // Version du 22/12/2015
    if (eventData.from > eventData.to)
      for (var time = playerDuration-fromTime; time < playerDuration-toTime; time++)
        _launchEventsAtTime(_timecodedEventsEnd, _timecodedEventsBegin, playerDuration-time);
    if (eventData.from < eventData.to)
      for (var time = fromTime+1; time <= toTime; time++)
        _launchEventsAtTime(_timecodedEventsBegin, _timecodedEventsEnd, time);
    _seekLock = false;
  }

  var _updateTime = function(timeEvent){
    _currentTimeElement.html(_this.getFormattedTimeForSecondsCurrentVideo(timeEvent.time));
  }


  this.getFormattedTimeForSecondsCurrentVideo = function(seconds){
    return _this.getFormattedTimeForSecond(seconds, _this.getDuration() >= 3600);
  }
  /**
  * Convert second to hh:mm:ss
  * if (showHours is false we mask hour in string)
  */
  this.getFormattedTimeForSecond = function(seconds, showHours){
    var time = "";
    var numSeconds = parseInt(seconds);
    var hours = Math.floor(numSeconds/3600);
    var minutes = Math.floor((numSeconds - (hours * 3600)) / 60);
    var seconds = numSeconds - (hours * 3600) - (minutes * 60);
    if(showHours == undefined || showHours){
      if (hours   < 10) {hours   = "0"+hours;}
      time = hours+":";
    }

    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}


    return time+minutes+":"+seconds;
  }


  var _onTimeTimecodedEventManager = function(eventData) {
    if (!_seekLock) {
      var time;
      var toTime = parseInt(Math.round(eventData.time*4))/4;
      if (toTime == 0 && _lastTime != 0) {
        _lastTime = -0.25;
        for (key in _timecodedEventsEnd) {
          for (key2 in _timecodedEventsEnd[key]) {
            _timecodedEventsEnd[key][key2].onEnd();
          }
        }
      }
      for (time = (_lastTime+0.25)*4; time <= toTime*4; time++) {
/*
        _launchEventsAtTimeCode(time);
*/
        // Version du 22/12/2015
        _launchEventsAtTime(_timecodedEventsBegin, _timecodedEventsEnd, time);
      }
      _lastTime = toTime;
    }
  }

  var _removeOnEventArrayAtTime = function(array, time, event){
    if (array[time] !== undefined && array[time].indexOf(event) !== -1){
      array[time].splice(array[time].indexOf(event),1);
    }

  }

  /**
  *
  *   Event :
      {
        begin : "Begin time",
        end : "End time",
        onBegin : function
        onEnd : function
      }
  */
  this.addTimecodedEvents = function(event){
    _pushOnEventArrayAtTime(_timecodedEventsBegin, event.begin*4, event)
    _pushOnEventArrayAtTime(_timecodedEventsEnd, event.end*4, event)
  }


  this.removeTimecodedEvent = function(event){

    if (event && event.onEnd) {
      event.onEnd();
    }
    _removeOnEventArrayAtTime(_timecodedEventsBegin, event.begin*4, event);
    _removeOnEventArrayAtTime(_timecodedEventsEnd, event.end*4, event);


  }

  this.setPrimaryColor   = function(color){
    this.setControlbarColor(color);
  }

  this.setSecondaryColor = function(color){
    this.setButtonColor(color);
    this.setProgressBarColor(color);
  }

  this.setTertiaryColor = function(color){
      this.setProgressionColor(color);
  }

  this.setControlbarColor = function(color){
    $(_controlbarElement).css("background-color", color);
  }

  this.setButtonColor = function(color){
    $(_controlbarElement).css("color", color);
  }

  this.setProgressBarColor = function(color){
    $(_timeProgressBarElement).css("background-color", color);
    $(_volumeProgressBarElement).css("background-color", color);
  }

  this.setProgressionColor = function(color){
    $(_timeProgressElement).css("background-color", color);
    $(_volumeProgressElement).css("background-color", color);
  }

  this.getDuration = function(){
    return _playerModel.getDuration();
  }

  this.init();

  return this;
};
