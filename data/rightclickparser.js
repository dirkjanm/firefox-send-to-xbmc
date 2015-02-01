self.on("context", function (node) {
  switch(node.nodeName){
    case 'A':
      return testLinkNode(node);
    break;
    case 'VIDEO':
      return testVideoNode(node);
    break;
    default:
      var cnode = node.parentNode;
      while(cnode !== null && typeof cnode !== 'undefined'){
        console.log(cnode.nodeName);
        if(cnode.nodeName == 'A'){
          return testLinkNode(cnode);
        }
        if(cnode.nodeName == 'VIDEO' || cnode.nodeName == 'AUDIO'){
          return testVideoNode(cnode);
        }
        var cnode = cnode.parentNode;
      }
      //No node found!
      return false;
    break;
  }
});
function testLinkNode(node){
  return /youtu|\/watch|\.(mp4|mkv|mov|mp3|avi|flv|wmv|asf|flac|mka|m4a|aac|ogg|pls|jpg|png|gif|jpeg|tiff)/.test(node.href);
}
function testVideoNode(node){
  return /youtu|\/watch|\.(mp4|mkv|mov|mp3|avi|flv|wmv|asf|flac|mka|m4a|aac|ogg|pls|jpg|png|gif|jpeg|tiff)/.test(node.currentSrc);
}
