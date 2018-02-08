function updateServersTable(servers) {
  $('#serverlist').empty();
  if(servers.length === 0){
    $('#noservers').removeClass('hidden');
  }
  servers.forEach(function (server) {
    var row = $('<tr>')
      .append($('<td>').text(server.label))
      .append($('<td>').text(server.host))
      .append($('<td>').text(server.port))
      .append($('<td>').text(server.username))
      .append($('<td>', { "data-password": server.password }).text('[hidden]'))
      .append($('<td>').text(server.type));
    var link = $('<a>',{"href": '#addserver', "class": 'btn btn-default editbtn btn-sm'}).text('Edit');
    var deletebtn = $('<button>',{"class": 'btn btn-danger btn-sm deleterow', "type":'button'}).text('Delete');
    row.append($('<td>').append(link,' ',deletebtn));
    $('#serverlist').append(row);
  });
}

function updatePage() {
  var servers = [];
  $('#serverlist tr').each(function () {
    var server = {};
    var ritems = $('td', this);
    server.label = $(ritems[0]).text();
    server.host = $(ritems[1]).text();
    server.port = $(ritems[2]).text();
    server.username = $(ritems[3]).text();
    server.password = $(ritems[4]).data('password');
    server.type = $(ritems[5]).text();
    servers.push(server);
  });
  browser.storage.local.set({'servers':servers});
  var page = browser.extension.getBackgroundPage();
  if (typeof page.sdata == 'undefined') {
    //Set up correct menus for the first time
    page.createMenus();
  } else {
    //Set up menus again
    page.removeSendToServers(page.sdata);
    page.createMenus();
  }
  if ($('#serverlist tr').length === 0) {
    $('#noservers').removeClass('hidden');
  } else {
    $('#noservers').addClass('hidden');
  }
}

function validateForm() {
  if ($('#server-label').val() === '') {
    $('#server-label').parent().addClass('has-error');
    return false;
  }
  var ipregex = /^([0-2]?\d{0,2}\.){3}([0-2]?\d{0,2})$/;
  var hostregex = /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/;
  if ($('#server-ip').val() === '' || (!ipregex.test($('#server-ip').val()) && !hostregex.test($('#server-ip').val()))) {
    $('#server-ip').parent().addClass('has-error');
    return false;
  }
  if ($('#server-port').val() === '') {
    $('#server-port').val('8080');
  }
  return true;
}
function main(){
  let setting = browser.storage.local.get('servers');
  setting.then(function(items){
    updateServersTable(items['servers']);
  });
  $('#serverlist').on('click', '.deleterow', function (e) {
    e.preventDefault();
    $(this).parent().parent().remove();
    updatePage();
  });
  $('#serverlist').on('click', '.editbtn', function (e) {
    e.preventDefault();
    window.editingEl = $(this).parent().parent();
    window.editingEl.find('td').each(function (i) {
      var el = $(this);
      if (i === 0) {
        $('#server-label').val(el.text());
      }
      if (i === 1) {
        $('#server-ip').val(el.text());
      }
      if (i === 2) {
        $('#server-port').val(el.text());
      }
      if (i === 3) {
        $('#server-username').val(el.text());
      }
      if (i === 4) {
        $('#server-password').val(el.data('password'));
      }
      if (i === 5) {
        $('#server-type').val(el.text());
      }
    });
    $('#formmode').removeClass('addmode').addClass('editmode');
  });
  $('#server-edit').on('click', function (e) {
    e.preventDefault();
    if (!validateForm()) {
      return false;
    } else {
      $('.form-group.has-error').removeClass('has-error');
    }
    //Construct new row
    var row = $('<tr>')
      .append($('<td>').text($('#server-label').val()))
      .append($('<td>').text($('#server-ip').val()))
      .append($('<td>').text($('#server-port').val()))
      .append($('<td>').text($('#server-username').val()))
      .append($('<td>', { "data-password": $('#server-password').val() }).text('[hidden]'))
      .append($('<td>').text($('#server-type').val() ))
    var link = $('<a>',{"href": '#addserver', "class": 'btn btn-default editbtn btn-sm'}).text('Edit');
    var deletebtn = $('<button>',{"class": 'btn btn-danger btn-sm deleterow', "type":'button'}).text('Delete');
    row.append($('<td>').append(link,' ',deletebtn));

    //Replace the row being edited with the new row
    window.editingEl.replaceWith(row);
    $('#addserver')[0].reset();
    $('#formmode').removeClass('editmode').addClass('addmode');
    updatePage();
    return false;
  });
  $('#server-add').on('click', function (e) {
    e.preventDefault();
    if (!validateForm()) {
      return false;
    } else {
      $('.form-group.has-error').removeClass('has-error');
    }
    //Construct row
    var row = $('<tr>')
      .append($('<td>').text($('#server-label').val()))
      .append($('<td>').text($('#server-ip').val()))
      .append($('<td>').text($('#server-port').val()))
      .append($('<td>').text($('#server-username').val()))
      .append($('<td>', { "data-password": $('#server-password').val() }).text('[hidden]'))
      .append($('<td>').text($('#server-type').val() ));
    
    $('#debugdiv').append('server-type: ' + $('#server-type').val())
    var link = $('<a>',{"href": '#addserver', "class": 'btn btn-default editbtn btn-sm'}).text('Edit');
    var deletebtn = $('<button>',{"class": 'btn btn-danger btn-sm deleterow', "type":'button'}).text('Delete');
    row.append($('<td>').append(link,' ',deletebtn));

    //Add this row to the list of servers
    $('#serverlist').append(row);
    $('#addserver')[0].reset();
    updatePage();
    return false;
  });
  window.pagestate = 'saved';
};
$(function(){
  main();
  var passvisible = false;
  $('#showpass').on('click',function(){
    if(!passvisible){
      $('#serverlist tr').each(function(){
        var td = $($('td',this)[4]);
        td.text(td.data('password'));
      });
      $(this).text('Hide passwords');
      passvisible = true;
    }else{
      $('#serverlist tr').each(function(){
        $($('td',this)[4]).text('[hidden]');
      });
      $(this).text('Show passwords');
      passvisible = false;
    }

    return false;
  });
});
