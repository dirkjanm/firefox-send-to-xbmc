//Function to sync the config from the legacy addon
function getConfig(){
  browser.runtime.sendMessage({action:'getconfig'}).then(reply => {
    if (reply && reply.servers) {
      creds = reply.credentials;
      servers = []
      //Merge servers and credentials
      reply.servers.forEach(function (server) {
        var checkhost = server.host + ':' + server.port;
        if (creds[checkhost]) {
          server.username = creds[checkhost].username;
          server.password = creds[checkhost].password;
        } else {
          server.username = '';
          server.password = '';
        }
        servers.push(server)
      });
      //Store them in the webextension storage
      browser.storage.local.set({"servers":servers})
    }
  });
}
//Current - always update config from legacy addon
getConfig();

//Future - Check if config sync is needed - we only do it the first time to migrate the configuration
// let setting = browser.storage.local.get('servers');
// setting.then(function(items){
//   if(typeof items['servers'] == 'undefined'){
//     getConfig();
//   }
// });



