# Send to XBMC Firefox plugin
https://addons.mozilla.org/en-US/firefox/addon/send-to-xbmc/

## About
Sends YouTube videos, video and music links to XBMC for playback. Adds a right click menu for links pointing to YouTube and audio/video files for direct playback on your TV with XBMC.
Works with XBMC Eden and later.

Version 2.0 of the plugin was made open source and placed on GitHub.
This version rewrote the whole server management part of the plugin, adding support for multiple servers and adding the basics for a lot of extra features

## Features

- Supported formats 

  * YouTube
  * mp4
  * mkv
  * mov
  * mp3
  * avi
  * flv
  * wmv
  * asf
  * flac
  * mka
  * m4a
  * aac
  * ogg
  * pls
  * jpg
  * png
  * gif
  * jpeg
  * tiff

- Supports multiple servers

## Planned features
* ~~Multiserver support~~ `[Added v2.0]`
* Queue videos in playlist
* Manage playlist
* Maybe: Plugin button in Toolbar
* Maybe: Some simple remote control functions

## Building

Make sure you have the Add-on SDK [installed](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation) and that you have `cfx` activated.

Run the plugin with `cfx run`
Create an xpi that you can drag and drop to your browser with `cfx xpi`

## License

MIT
