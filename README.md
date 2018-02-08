# Based on Send to XBMC/Kodi Firefox plugin
https://addons.mozilla.org/en-US/firefox/addon/send-to-xbmc/

## About
Sends YouTube videos, video and music links to Kodi for playback. Adds a right click menu for links pointing to YouTube and audio/video files for direct playback on your TV with Kodi or VLC.
Works with XBMC Eden and later, as well as with Kodi Helix and newer and VLC.

Version 2.0 of the plugin was made open source and placed on GitHub.
This version rewrote the whole server management part of the plugin, adding support for multiple servers and adding the basics for a lot of extra features

Version 3.0 is a complete rewrite of the extension into a WebExtension, granting compatibility with Firefox 57.

## Setup XBMC/Kodi
Under System -> Services: 
 * Web Server -> Make sure it's enabled and a password is set 
 * Remote control -> Enable: "Allow remote control by programs on other systems" 
Go back to Home to save changes

Plug your Kodi info into the FireFox addon... IP can be obtained from System -> System info (Appears when System is highlighted )

## Setup VLC
 * This addon requires running instance of VLC with enabled Web interface to controll it.
   (To enable once-per run in VLC: Menu **View > Add Interface > Web)**
 * VLC Web Interface requires (at minimum) to set password to run:
   **Tools > Preferences:**
   (at bottom left, in **Show settings**) mark **All** and in:
   **Interface > Main interfaces > Lua > Password**
   enter the same password as defined in this addon.
   **That's it! It's ready to rock!**

    _That is - if VLC's Web interface started: You can verify by going to http://[VLC_IP_adress]:8080/ in your browser. 
       If not - try restarting VLC and enable Web again._
   
 * To permanantly enable VLC Web Interface for every run, mark **Web** in
   **Interface > Main interfaces**


## Features

- Supported formats 

  * YouTube
  * Twitch
  * Vimeo
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

- Everything VLC supports (URL is sent without parsing)

## Planned features
* ~~Multiserver support~~ `[Added v2.0]`
* Queue videos in playlist
* Manage playlist
* ~~Plugin button in Toolbar~~ `[Added v3.0]`
* Maybe: Some simple remote control functions

## Building

Make sure you have the web-ext tool [installed](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext).

Run the plugin with `web-ext run`
Build the plugin with `web-ext build`
Alternatively, in `about:debugging` you can install the extension as temporary extension by loading the `manifest.json` from the webextension directory.

## License

MIT
