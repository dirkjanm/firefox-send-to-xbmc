var ytobserver;
self.port.on("injectSendButton", function (data) {
    var addto = document.getElementById('watch-related');
    if (addto) {
        //There is a related list on the page, which means we are on a video page
        attachSendButton(data);
        waitForRelatedList(data);
    }else{
        //There is no related list so we are not on a video page, but it might get loaded with ajax afterwards
        waitForRelatedList(data);
    }
});

//Refresh the servers when the config is updated
self.port.on("refreshButton", function (data) {
    var addto = document.getElementById('watch-related');
    if(typeof ytobserver !== 'undefined'){
        ytobserver.disconnect();
    }
    if(addto){
        //If there is an old button in the DOM, remove it
        var curel = document.getElementById('sendToKodi');
        if(curel){
            curel.parentNode.removeChild(curel);
        }
        //Now add the new button
        attachSendButton(data);
        waitForRelatedList(data);
    }else{
        //No video page yet, but keep observing for changes on the page
        waitForRelatedList(data);
    }
});

function select_server(servers) {
    var server, serverstring;
    var servselect = document.getElementById('selectXBMCserver');
    if (servselect) {
        //Multiple servers set up, use the one selected
        server = servers[servselect.value];
        serverstring = server.host + ':' + server.port;
    } else if(servers.length > 0){
        //Just one server set up, use that one
        server = servers[0];
        serverstring = server.host + ':' + server.port;
    } else {
        //No servers set up, send an empty string, the addon logic will show a nice message explaining it.
        serverstring = '';
    }

    return serverstring;
}

function get_mix() {
    var urls = [];

    var targets = document.getElementsByClassName('yt-uix-scroller-scroll-unit');
    for (i = 0; i < targets.length; i++) {
        urls.push(targets[i].getAttributeNode('data-video-id').value);
    }

    return urls;
}

function attachSendButton(data){
    var addto = document.getElementById('watch-related');
    var targets = document.querySelector('#watch-related li');
    var servers = data.servers;

    var ouritem = document.createElement('li');
    ouritem.id = 'sendToKodi';
    ouritem.appendChild(document.createTextNode('Send to Kodi'));

    //Add a dropdown to select which server we want to send to in case there is more than one
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

    var div = document.createElement('div');
    div.style = "margin-left: auto; margin-left: auto;"
    ouritem.appendChild(div);

    var a = document.createElement('a');
    a.href = "#";
    a.title = 'Send to Kodi';
    a.onclick = function () {
        self.port.emit('openurl', {
            "url": window.location.href,
            "server": select_server(servers)
        });
        return false;
    };

    var a2 = document.createElement('a');
    a2.href = '#';
    a2.title = 'Add to playlist';
    a2.onclick = function () {
        self.port.emit('add_to_playlist', {
            "url": window.location.href,
            "server": select_server(servers)
        });

        return false;
    };

    var a3 = document.createElement('a');
    a3.href = '#';
    a3.title = 'Add Mix';
    a3.onclick = function () {
        self.port.emit('add_mix_to_playlist', {
            "urls": get_mix(),
            "server": select_server(servers)
        });

        return false;
    };

    var image = document.createElement('img');
    image.src = data.play_img;
    image.alt = 'Send to Kodi';
    image.style = "margin-right: 5px; margin-left: 5px;"

    var image2 = document.createElement('img');
    image2.src = data.queue_img;
    image2.alt = 'Send to Kodi';
    image2.style = "margin-right: 10px;"

    var image3 = document.createElement('img');
    image3.src = data.queue_img;
    image3.alt = 'Send to Kodi';
    image3.style = "margin-right: 10px;"

    a.appendChild(image);
    a2.appendChild(image2);
    a3.appendChild(image3);
    div.appendChild(a);
    div.appendChild(a2);
    div.appendChild(a3);
    //Lets check again we dont have a button yet, just to be sure
    if(document.getElementById('sendToKodi') !== null){
        return;
    }
    addto.insertBefore(ouritem, targets);
}
function waitForRelatedList(data){
    var target = document.getElementsByTagName('body')[0];
    ytobserver = new MutationObserver(function(mutations) {
        //Only add the button if there is a related list and if there is no button yet
        if(document.querySelector('#watch-related li') !== null && document.getElementById('sendToKodi') === null){
            attachSendButton(data);
        }
    });
    var config = { attributes: false, childList: true, characterData: false };
    ytobserver.observe(target,config);
}
