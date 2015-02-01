self.port.on("injectSendButton", function (data) {
  var imagesrc = data.image;
  var servers = data.servers;
  var addto = document.getElementById('watch-related');
  if (addto) {
    var targets = document.querySelector('#watch-related li');

    var ouritem = document.createElement('li');
    ouritem.className = 'video-list-item';
    ouritem.appendChild(document.createTextNode('Send to'));

    if (servers.length > 1) {
      var serverlist = document.createElement('select');
      serverlist.id = 'selectXBMCserver';
      servers.forEach(function (server, i) {
        var sopt = document.createElement('option');
        sopt.value = i;
        sopt.appendChild(document.createTextNode(server.label));
        serverlist.appendChild(sopt);
      });
      ouritem.appendChild(serverlist);
    }

    ouritem.appendChild(document.createElement('br'));

    var a = document.createElement('a');
    a.href = "#";
    a.title = 'Send to Kodi';
    a.onclick = function () {
      var server;
      var servselect = document.getElementById('selectXBMCserver');
      if (servselect) {
        server = servers[servselect.value];
      } else {
        server = servers[0];
      }
      var serverstring = server.host + ':' + server.port;
      self.port.emit('openurl', {
        "url": window.location.href,
        "server": serverstring
      });
      return false;
    };
    var image = document.createElement('img');
    image.src = imagesrc;
    image.alt = 'Send to Kodi';
    a.appendChild(image);
    ouritem.appendChild(a);
    addto.insertBefore(ouritem, targets);
  }
});
