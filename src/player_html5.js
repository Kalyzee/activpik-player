/**
*   Html5Player Model
*/
var Html5PlayerModel = function(id){

    var _videoElement = document.getElementById(id);

    var _this = this;

    this.init = function(){
        $(_videoElement).click(function(){
            _this.togglePlay();
        });
    }

    this.togglePlay = function(){
        if (this.isPaused()){
            this.play();
        }
        else{
            this.pause();
        }
    }
    this.play = function(){
        _videoElement.play();
    }

    this.pause = function(){
        _videoElement.pause();
    }


    this.seek = function(time){
        _videoElement.currentTime = time;
    }

    this.getCurrentTime = function(){
        return _videoElement.currentTime;
    }

    this.setVolume = function(volume){
      _videoElement.volume = volume;
    }

    this.getVolume = function(){
        return _videoElement.volume;
    }

    this.isHDAvailable = function(){
        return $(_videoElement).find("[data-quality='hd']").length>0;
    }

    this.enableQuality = function(qualityName){
        var time = _this.getCurrentTime();
        _videoElement.src = $(_videoElement).find("source[data-quality='"+qualityName+"'][src*='."+$(_videoElement)[0].currentSrc.split('.').pop()+"']").get(0).src;
        _videoElement.load();
        _videoElement.play();
        //this.seek(time);
        quality=qualityName;
    }

    /**
    *   Event Listener Fully compatible with HTML5 Specs
    */
    this.addEventListener = function(eventName, callback){
        _videoElement.addEventListener(eventName, callback);
    }

    this.isMuted = function(){
        return _videoElement.muted;
    }

    this.isPaused = function(){
        return _videoElement.paused;
    }

    this.setMuted = function(muted){
        _videoElement.muted = muted;
    }

    this.getDuration = function(){
        return _videoElement.duration;
    }

}
