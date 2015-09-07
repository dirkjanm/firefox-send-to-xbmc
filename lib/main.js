/*
   Copyright (c) 2014 Sano Webdevelopment
   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
   The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   */
//Includes
var Request = require("sdk/request").Request;
var data = require("sdk/self").data;
var addonUri = require("sdk/self").uri;
var pageMod = require("sdk/page-mod");
var notifications = require("sdk/notifications");
var tabs = require("sdk/tabs");
var store = require("sdk/simple-storage");
var pwds = require("sdk/passwords");
var cm = require("sdk/context-menu");

// Playlist handling.
var plists = require('./playlists.js');

//Menu variables
var manager;
var topmenu;
var separator;
var playon;
var queueon;
//YouTube workers list
var ytworkers = [];

//Launch configuration manager
function launchConfigTab() {
  tabs.open({
    url: data.url('preferences.html')
  });
}

//Save the new configuration
function saveNewConfig(servers) {
  pwds.search({
    url: addonUri,
    onComplete: function (credentials) {
      credentials.forEach(pwds.remove);
      saveServers(servers);
    },
    onError: function (error) {
      //console.log(error);
      saveServers(servers);
    }
  });
}

//Save the servers
function saveServers(servers) {
  //Now store new passwords
  store.storage.servers = [];
  servers.forEach(function (server) {
    store.storage.servers.push({
      label: server.label,
      host: server.host,
      port: server.port
    });
    if (server.username !== '' && server.password !== '') {
      pwds.store({
        realm: server.host + ':' + server.port,
        username: server.username,
        password: server.password
      });
    }
  });
  refreshMenus();
}

//Refresh context menus with new servers
function refreshMenus() {
  //Remove all old items from the menu
  playon.items.forEach(function (it) {
    it.destroy();
  });
  /*
     queueon.items.forEach(function (it) {
     it.destroy();
     });
     */
  //Create new items and add them to the new menu
  var newitems = initSubMenus();
  newitems[0].forEach(function (it) {
    playon.addItem(it);
  });
  /*
     newitems[1].forEach(function (it) {
     queueon.addItem(it);
     });
     */
}

//Create submenus
function initSubMenus() {
  //Parse all servers
  var servers = getServers();
  var items = [];
  var items2 = [];
  servers.forEach(function (server) {
    var it = cm.Item({
      label: server.label,
      data: server.host + ':' + server.port
    });
    items.push(it);
  });
  /*
     servers.forEach(function (server) {
     var it = cm.Item({
label: server.label,
data: server.host + ':' + server.port
});
items2.push(it);
});
*/
  return [items, items2];
}

//Load passwords and send all the data to config manager
function getPasswords(worker) {
  pwds.search({
    url: addonUri,
    onComplete: function (credentials) {
      credslist = {};
      credentials.forEach(function (cred) {
        credslist[cred.realm] = {
          username: cred.username,
          password: cred.password
        };
      });
      worker.port.emit('init', {
        servers: getServers(),
        credentials: credslist
      });
    },
    onError: function (error) {
      //console.log(error);
      worker.port.emit('init', {
        servers: getServers(),
        credentials: {}
      });
    }
  });
}

//Set up the top context menu with submenus
function setUpTopMenu(mitems) {
  playon = cm.Menu({
    label: "Play on",
    image: data.url('play.png'),
    contentScript: 'self.on("click", function (node, data) {' +
      ' self.postMessage({url:node.href,pathname:node.pathname,server:data,type:node.nodeName,src:node.currentSrc});' +
      '});',
    items: mitems[0],
    onMessage: function (data) {
      if(data.type==='A'){
        //Link
        parseUrl(data.url, data.pathname, data.server, "play");
      }else{
        //Video
        parseUrl(data.src, '', data.server, "play");
      }
    }
  });
  /*
     queueon = cm.Menu({
label: "Queue on",
image: data.url('queue.png'),
contentScript: 'self.on("click", function (node, data) {' +
' self.postMessage({url:node.href,pathname:node.pathname,server:data});' +
'});',
items: mitems[1],
onMessage: function (data) {
parseUrlQueue(data.url, data.pathname, data.server);
}
});
*/
  topmenu = cm.Menu({
    label: "Send to Kodi",
    context: cm.SelectorContext('a,video,audio'),
    image: data.url('kodi-icon.ico'),
    contentScriptFile: data.url("rightclickparser.js"),
    items: [playon, /*queueon,*/ separator, manager]
  });
}

//Get all servers from the config
function getServers() {
  if (!store.storage.servers)
    store.storage.servers = [];

  return store.storage.servers;
}

//Display a message to the user
function displayMessage(m_title, message, type) {
  //if (!prefs.shownotify && type != 'error') return; //User doesn't want notifications
  notifications.notify({
    title: m_title,
    text: message
  });
}

//Parse an url to send
function parseUrl(url, pathname, playhost, action) {
  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  var match = url.match(regExp);
  if (match && match[2].length == 11) {
    plists.add_item();
    sendYouTube(match[2], playhost, action);
    return;
  }

  var regExp2 = /^.*(youtube.com\/watch.*[\?\&]v=)([^#\&\?]*).*/;
  var match2 = url.match(regExp2);
  if (match2 && match2[2].length == 11) {
    plists.add_item();
    sendYouTube(match2[2], playhost, action);
    return;
  }

  if(pathname === ''){
    //Dont extra check the extension
    plists.add_item();
    prepareSend(url, playhost, action);
    return;
  }

  var ext = pathname.split('.').pop();
  //Supported extensions
  if (/^(mp4|mkv|mov|mp3|avi|flv|wmv|asf|flac|mka|m4a|aac|ogg|pls|jpg|png|gif|jpeg|tiff)$/.test(ext)) {
    plists.add_item();
    prepareSend(url, playhost, action);
    return;
  }

  displayMessage('Error', 'The following url is not supported: ' + url, 'error');
}

//Send a YouTube video
function sendYouTube(ytid, playhost, action) {
  var url = 'plugin://plugin.video.youtube/?action=play_video&videoid=' + ytid;
  prepareSend(url, playhost, action);
}

//Get password for server
function prepareSend(fileurl, server, action) {
  pwds.search({
    realm: server,
    onComplete: function (credentials) {
      if (credentials.length > 0) {
        sendToXBMC(fileurl, server, credentials[0], action);
      } else {
        sendToXBMC(fileurl, server, {}, action);
      }
    }
  });
}

var actions_queue = [];

//Send request to Kodi
function sendToXBMC(fileurl, server, credentials, action) {

  if (server === '') {
    displayMessage('Error', 'You have to set up your Kodi address first in the Addon Settings', 'error');
    return false;
  }

  if (credentials.username && credentials.username !== '') {
    rurl = 'http://' + encodeURIComponent(credentials.username) + ':' + encodeURIComponent(credentials.password) + '@' + server + '/jsonrpc';
  } else {
    rurl = 'http://' + server + '/jsonrpc';
  }

  var is_queue_empty = actions_queue.length === 0;
  // Determine what to do depending on the action.
  if (action === "play") {
    actions_queue.push({ 'action': "add_queue", 'handler': "handleComplete", 'url': rurl, "file": fileurl });
    actions_queue.push({ 'action': "play", 'handler': "handleComplete", 'url': rurl, "file": "" });
  }

  if (action === "add_queue")
    actions_queue.push({ 'action': "add_queue", 'handler': "handleComplete", 'url': rurl, "file": fileurl });

  if (action === "clear_queue")
    actions_queue.push({ 'action': "clear", 'handler': "handleComplete", 'url': rurl, "file": "" });

  if (action === "synchronize")
    actions_queue.push({ 'action': "synchronize", 'handler': "handle_get_items", 'url': rurl, "file": "" });

  displayMessage('Sending', 'Sending to Kodi...', 'info');

  if (is_queue_empty)
    request_xbmc(actions_queue.shift());
}

function request_xbmc(request) {
  var play_item = {
    "jsonrpc":"2.0",
    "method":"Player.Open",
    "params": {
      "item":{
        "position": plists.get_size(),
        "playlistid": plists.playlist_id
      }
    }
  };

  var add_playlist_item = {
    "jsonrpc": "2.0",
    "method": "Playlist.Add",
    "params": {
      "playlistid": plists.playlist_id,
      "item": {
        "file": request.file
      }
    }
  };

  var clear_playlist = {
    "jsonrpc": "2.0",
    "method": "Playlist.Clear",
    "params": {
      "playlistid": plists.playlist_id
    }
  };

  var get_playlist_items = {
    "jsonrpc": "2.0",
    "method": "Playlist.GetItems",
    "params": {
      "playlistid": plists.playlist_id
    }
  };

  var action = {};

  // Determine what to do depending on the action.
  if (request.action === "play")
    action = play_item;

  if (request.action === "add_queue")
    action = add_playlist_item;

  if (request.action === "clear_queue")
    action = clear_playlist;

  if (request.action === "synchronize")
    action = get_playlist_items;

  action.id = 1;
  Request({
    url: request.url,
    content: JSON.stringify(action),
    contentType: 'application/json',
    onError: function (resp) {
      console.log(resp);
    },
    onComplete: function (handler) {
      var h = handler;

      return function (resp) {
        handle_response(resp, h);

        if (actions_queue.length > 0)
          request_xbmc(actions_queue.shift());
      };
    }(request.handler)
  }).post();
}

function handle_get_items(resp) {
  resp = JSON.parse(resp);
  plists.resize(resp.result.limits.total);
};

function handle_response(resp, handler) {
  if (resp.status == 200) {
    if (resp.json) {
      eval(handler + '(JSON.stringify(resp.json))');
      return;
    }
    if (typeof resp.json.error !== 'undefined') {
      if (typeof resp.json.error.data !== 'undefined' && resp.json.error.data.stack.message) {
        displayMessage('Kodi Error ' + resp.json.error.code, 'Kodi reported: ' + resp.json.error.data.stack.message + '', 'error');
        return;
      }
      if (typeof resp.json.error.message !== 'undefined') {
        displayMessage('Kodi Error ' + resp.json.error.code, 'Kodi reported: ' + resp.json.error.message + '', 'error');
        return;
      }
      displayMessage('Kodi Error ', 'Kodi reported error code ' + resp.json.error.code + '', 'error');
      return;
    }
  }

  if (resp.status === 0) {
    displayMessage('Network error', 'Could not contact Kodi. Check your configuration. ' + resp.json.error.code, 'error');
    return;
  }

  displayMessage('Status error ' + resp.status, 'Could not contact Kodi. Check your configuration. HTTP Status: ' + resp.status + ' ' + resp.statusText + '', 'error');
  return;
}

//Handle return from XBMC
function handleComplete(resp) {
  displayMessage('Success', 'Sent to Kodi', 'ok');
}

function checkUpdate() {
  //Update? Just see if we can find the deprecated config entries
  if (!store.storage.servers || store.storage.servers.length === 0) {
    store.storage.servers = [];
    var xbmcip = require('sdk/preferences/service').get(['extensions', require('sdk/self').id, 'xbmcip'].join('.'));
    var xbmcport = require('sdk/preferences/service').get(['extensions', require('sdk/self').id, 'xbmcport'].join('.'));
    if (typeof xbmcip !== "undefined" && xbmcip !== '') {
      if (typeof xbmcport === "undefined" || xbmcport === '') xbmcport = "80";
      //Previous version detected
      var defaultserver = {
        label: 'Default',
        host: xbmcip,
        port: xbmcport
      };
      var olduser = require('sdk/preferences/service').get(['extensions', require('sdk/self').id, 'xbmcuser'].join('.'));
      var oldpwd = require('sdk/preferences/service').get(['extensions', require('sdk/self').id, 'xbmcpass'].join('.'));
      //Store new default server
      store.storage.servers.push(defaultserver);
      if (typeof olduser !== "undefined" && typeof oldpwd !== "undefined" && olduser !== '' && oldpwd !== '') {
        //Now store these credentials properly
        pwds.store({
          realm: defaultserver.host + ':' + defaultserver.port,
          username: olduser,
          password: oldpwd
        });
      }
    }
  }
}

//Main exports
exports.main = function () {
  separator = cm.Separator();
  manager = cm.Item({
    label: 'Manage servers',
    contentScript: 'self.on("click", self.postMessage)',
    onMessage: launchConfigTab
  });

  checkUpdate();
  setUpTopMenu(initSubMenus());

  // Adding a simple playlist.
  plists.playlist_id = plists.add_playlist();

  pageMod.PageMod({
    include: "*.youtube.com",
    contentScriptFile: data.url("youtube.js"),
    onAttach: function (worker) {
      worker.port.emit('injectSendButton', {
        play_img: data.url('play.png'),
        queue_img: data.url('queue.png'),
        servers: getServers()
      });

      worker.port.on("openurl", function (data) {
        prepareSend("", data.server, "synchronize");
        parseUrl(data.url, '', data.server, "play");
      });

      worker.port.on("add_playlist", function (data) {
        prepareSend("", data.server, "synchronize");
        sendYouTube(data.urls.shift(), data.server, "play");
        for (url in data.urls)
          sendYouTube(data.urls[url], data.server, "add_queue");
      });

      worker.port.on("add_mix_to_playlist", function (data) {
        for (url in data.urls)
          sendYouTube(url, data.server, "add_queue");
      });

      worker.port.on("add_to_playlist", function (data) {
        parseUrl(data.url, '', data.server, "add_queue");
      });

      //Keep a list of the active workers to be able to notify them in case the configuration changes
      ytworkers.push(worker);
      worker.on('detach',function(){
        var index = ytworkers.indexOf(this);
        if(index != -1) {
          ytworkers.splice(index, 1);
        }
      });
    },
  });

  pageMod.PageMod({
    include: data.url('preferences.html'),
    contentScriptFile: [data.url("jquery-2.1.1.min.js"), data.url('preferences.js')],
    onAttach: function(worker) {
      worker.port.on("updateservers", function (servers) {
        //Update the server configuration
        saveNewConfig(servers);
        //Poke the YouTube workers that the configuration changed
        if(ytworkers.length > 0){
          ytworkers.forEach(function (ytworker, i) {
            try {
              ytworker.port.emit('refreshButton',{
                image: data.url('kodi-logo-official.png'),
                servers: servers
              });
            }
            catch(e){
              //console.log(e);
            }
          });
        }
      });
      //Now get passwords, servers to fill them in on the page
      getPasswords(worker);
    }
  });
};
