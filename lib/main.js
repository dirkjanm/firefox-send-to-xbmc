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
//Menu variables
var manager;
var topmenu;
var separator;
var playon;
var queueon;
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
      ' self.postMessage({url:node.href,pathname:node.pathname,server:data});' +
      '});',
    items: mitems[0],
    onMessage: function (data) {
      parseUrlPlay(data.url, data.pathname, data.server);
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
    label: "Send to XBMC",
    context: cm.SelectorContext('a'),
    image: data.url('xbmc_logo.ico'),
    contentScript: 'self.on("context", function (node) {' +
      '  return /youtu|\\/watch|\\.(mp4|mkv|mov|mp3|avi|flv|wmv|asf|flac|mka|m4a|aac|ogg|pls|jpg|png|gif|jpeg|tiff)/.test(node.href);' +
      '});',
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
function parseUrlPlay(url, pathname, playhost) {
  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  var match = url.match(regExp);
  if (match && match[2].length == 11) {
    sendYouTube(match[2], playhost);
    return;
  }
  var regExp2 = /^.*(youtube.com\/watch.*[\?\&]v=)([^#\&\?]*).*/;
  var match2 = url.match(regExp2);
  if (match2 && match2[2].length == 11) {
    sendYouTube(match2[2], playhost);
    return;
  }
  var ext = pathname.split('.').pop();
  //Supported extensions
  if (/^(mp4|mkv|mov|mp3|avi|flv|wmv|asf|flac|mka|m4a|aac|ogg|pls|jpg|png|gif|jpeg|tiff)$/.test(ext)) {
    prepareSend(url, playhost);
    return;
  }
  displayMessage('Error', 'The following url is not supported: ' + url, 'error');
}
//TODO: Queue
function parseUrlQueue(url, pathname, playhost) {
  return;
}
//Send a YouTube video
function sendYouTube(ytid, playhost) {
  var url = 'plugin://plugin.video.youtube/?action=play_video&videoid=' + ytid;
  prepareSend(url, playhost);
}
//Get password for server
function prepareSend(fileurl, server) {
  pwds.search({
    realm: server,
    onComplete: function (credentials) {
      if (credentials.length > 0) {
        sendToXBMC(fileurl, server, credentials[0]);
      } else {
        sendToXBMC(fileurl, server, {});
      }
    }
  });
}
//Send request to XBMC
function sendToXBMC(fileurl, server, credentials) {
  if (server === '') {
    displayMessage('Error', 'You have to set up your XBMC address first in the Addon Settings', 'error');
    return false;
  }
  if (credentials.username && credentials.username !== '') {
    rurl = 'http://' + credentials.username + ':' + credentials.password + '@' + server + '/jsonrpc';
  } else {
    rurl = 'http://' + server + '/jsonrpc';
  }
  //console.log(rurl);
  var senddata = {
    "jsonrpc":"2.0",
    "method":"Player.Open",
    "params": {
      "item":{
        "file":fileurl
      }
    },
    "id": 1
  };
  displayMessage('Sending', 'Sending to XBMC...', 'info');
  Request({
    url: rurl,
    content: JSON.stringify(senddata),
    //TODO: Playlists
    //content: '{"jsonrpc": "2.0", "method": "Playlist.Add", "params":{ "playlistid":1, "item": {"file" : "' + fileurl + '" } }, "id" : 1}',
    contentType: 'application/json',
    onError: function (resp) {
      //console.log(resp);
    },
    onComplete: handleComplete
  }).post();
}
//Handle return from XBMC
function handleComplete(resp) {
  //console.log(resp.status);
  if (resp.status == 200) {
    if (resp.json && resp.json.result) {
      if (resp.json.result == 'OK') {
        displayMessage('Success', 'Sent to XBMC', 'ok');
        return;
      }
    }
    if (typeof resp.json.error !== 'undefined') {
      if (typeof resp.json.error.data !== 'undefined' && resp.json.error.data.stack.message) {
        displayMessage('XBMC Error ' + resp.json.error.code, 'XBMC reported: ' + resp.json.error.data.stack.message + '', 'error');
        return;
      }
      if (typeof resp.json.error.message !== 'undefined') {
        displayMessage('XBMC Error ' + resp.json.error.code, 'XBMC reported: ' + resp.json.error.message + '', 'error');
        return;
      }
      displayMessage('XBMC Error ', 'XBMC reported error code ' + resp.json.error.code + '', 'error');
      return;
    }
  }
  if (resp.status === 0) {
    displayMessage('Network error', 'Could not contact XBMC. Check your configuration.', 'error');
    return;
  }
  displayMessage('Status error ' + resp.status, 'Could not contact XBMC. Check your configuration. HTTP Status: ' + resp.status + ' ' + resp.statusText + '', 'error');
  return;
}

function checkUpdate() {
  //Update? Just see if we can find the deprecated config entries
  if (!store.storage.servers || store.storage.servers.length === 0) {
    store.storage.servers = [];
    var xbmcip = require('sdk/preferences/service').get(['extensions', require('sdk/self').id, 'xbmcip'].join('.'));
    if (typeof xbmcip !== "undefined" && xbmcip !== '') {
      //Previous version detected
      var defaultserver = {
        label: 'Default',
        host: xbmcip,
        port: require('sdk/preferences/service').get(['extensions', require('sdk/self').id, 'xbmcport'].join('.'))
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
  pageMod.PageMod({
    include: "*.youtube.com",
    contentScriptFile: data.url("youtube.js"),
    onAttach: function (worker) {
      worker.port.emit('injectSendButton', {
        image: data.url('xbmc.png'),
        servers: getServers()
      });
      worker.port.on("openurl", function (data) {
        parseUrlPlay(data.url, '', data.server);
      });
    }
  });
  pageMod.PageMod({
    include: data.url('preferences.html'),
    contentScriptFile: [data.url("jquery-2.1.1.min.js"), data.url('preferences.js')],
    onAttach: function(worker) {
      worker.port.on("updateservers", function (servers) {
        //Update the server configuration
        saveNewConfig(servers);
      });
      //Now get passwords, servers to fill them in on the page
      getPasswords(worker);
    }
  })
};
