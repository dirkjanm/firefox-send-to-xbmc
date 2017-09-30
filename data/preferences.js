function updateServersTable(data) {
  var servers = data.servers;
  var creds = data.credentials;
  $('#serverlist').empty();
  if(servers.length === 0){
    $('#noservers').removeClass('hidden');
  }
  servers.forEach(function (server) {
    var checkhost = server.host + ':' + server.port;
    if (creds[checkhost]) {
      server.username = creds[checkhost].username;
      server.password = creds[checkhost].password;
    } else {
      server.username = '';
      server.password = '';
    }
    var row = $('<tr>')
      .append($('<td>').text(server.label))
      .append($('<td>').text(server.host))
      .append($('<td>').text(server.port))
      .append($('<td>').text(server.username))
      .append($('<td>', { "data-password": server.password }).text('[hidden]'));
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
    servers.push(server);
  });
  self.port.emit('updateservers', servers);
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
self.port.on("init", function (data) {
  updateServersTable(data);
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
      .append($('<td>', { "data-password": $('#server-password').val() }).text('[hidden]'));
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
      .append($('<td>', { "data-password": $('#server-password').val() }).text('[hidden]'));
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
});
