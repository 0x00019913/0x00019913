var stage = new Stage();

var headerFullscreen = false;

var header = document.getElementById("header");
var fullscreenButton = document.getElementById("fullscreen-button");


onFullScreenChange = function() {
  // if successfully went fullscreen
  if (document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement || document.fullscreenElement) {
    headerFullscreen = true;
    header.className = "fullscreen";
    fullscreenButton.className = "exit";
  }
  else {
    headerFullscreen = false;
    header.className = "halfscreen";
    fullscreenButton.className = "enter";
  }
  // without this, the webgl can fail to resize
  window.dispatchEvent(new Event('resize'));
}

// prevent cursor lock from mousedown/up events farther down the line
onFSButtonMouseDown = function(e) { e.stopPropagation(); }
onFSButtonMouseUp = function(e) { e.stopPropagation(); }
// turn on fullscreen
onFSButtonClick = function(e) {
  if (!headerFullscreen) {
    if (header.requestFullscreen) header.requestFullscreen();
    else if (header.webkitRequestFullScreen) header.webkitRequestFullScreen();
    else if (header.mozRequestFullScreen) header.mozRequestFullScreen();
    else if (header.msRequestFullscreen) header.msRequestFullscreen();
  }
  else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  }
}

document.addEventListener('webkitfullscreenchange', onFullScreenChange);
document.addEventListener('mozfullscreenchange', onFullScreenChange);
fullscreenButton.addEventListener('mousedown', onFSButtonMouseDown, false);
fullscreenButton.addEventListener('mouseup', onFSButtonMouseDown, false);
fullscreenButton.addEventListener('click', onFSButtonClick, false);
