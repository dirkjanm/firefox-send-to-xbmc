let srvget = browser.storage.local.get('servers');
srvget.then(function(settings){
  let servers = settings['servers'];
  slist = document.getElementById('serverlist');
  servers.forEach(function (server) {
    let ndiv = document.createElement('div');
    ndiv.className = 'panel-list-item';
    ndiv.appendChild(document.createTextNode(server.label));
    ndiv.onclick = function(){
      browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
        for (let tab of tabs) {
          let page = browser.extension.getBackgroundPage();
          page.parseUrlPlay(tab.url, '', server);
          window.close();
        }
      });
    }
    slist.appendChild(ndiv);
  });
});
document.getElementById('editservers').onclick = browser.extension.getBackgroundPage().openSettings;
