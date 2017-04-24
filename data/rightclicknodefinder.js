self.on("click", function (node, data) {
  var usenode = findNode(node);
  if(usenode !== false){
      self.postMessage({url:usenode.href,pathname:usenode.pathname,server:data,type:usenode.nodeName,src:usenode.currentSrc});
  }
});
function testLinkNode(node){
  return /youtu|\/watch|\.(mp4|mkv|mov|mp3|avi|flv|wmv|asf|flac|mka|m4a|aac|ogg|pls|jpg|png|gif|jpeg|tiff)/.test(node.href);
}
function testVideoNode(node){
  return /youtu|\/watch|\.(mp4|mkv|mov|mp3|avi|flv|wmv|asf|flac|mka|m4a|aac|ogg|pls|jpg|png|gif|jpeg|tiff)/.test(node.currentSrc);
}
function findNode(node) {
  switch(node.nodeName){
    case 'A':
      return node;
    case 'VIDEO':
      return node;
    default:
      var cnode = node.parentNode;
      while(cnode !== null && typeof cnode !== 'undefined'){
        if(cnode.nodeName == 'A'){
          if(testLinkNode(cnode)){
            return cnode;
          }
        }
        if(cnode.nodeName == 'VIDEO' || cnode.nodeName == 'AUDIO'){
          if(testVideoNode(cnode)){
            return cnode;
          }
        }
        cnode = cnode.parentNode;
      }
      //No node found!
      return false;
  }
}