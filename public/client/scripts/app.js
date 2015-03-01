$(document).on('ready', function () {
  var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';
  var hostTag = 'http://127.0.0.1:8080';
  var authenticated = false;

  var tagOrComment = new RegExp(
    '<(?:'
      // Comment body.
    + '!--(?:(?:-*[^->])*--+|-?)'
      // Special "raw text" elements whose content should be elided.
    + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
    + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
      // Regular name
    + '|/?[a-z]'
    + tagBody
    + ')>',
    'gi');

  function removeTags(html) {
    var oldHtml;
    do {
      oldHtml = html;
      html = html.replace(tagOrComment, '');
    } while (html !== oldHtml);
    return html.replace(/</g, '&lt;');
  }


  var friends = {};

  var newUpdate = function() {
    var currentRoom = $('#currentRoom').text();
    var roomName = $('#currentRoom').text();
    $.ajax( hostTag + '/classes/messages', {
      type: 'GET',
      data: {where: roomName},
      dataType: 'json',
      success: function(response) {
        var div = $('<div></div>');
        for (var i = 0, count = response.length; i < count; i++) {
          var message;
          if (response[i].message !== undefined && response[i].message !== null) {
            message = response[i].message;
          }
          else {
            message = ""
          }
          var createdAt = removeTags(response[i].createdAt);
          var roomName;
          if (response[i].roomname !== undefined && response[i].roomname !== null) {
            roomName = response[i].roomname
          }
          else {
            roomName = "unknown";
          }
          var userName;
          if (response[i].username !== undefined && response[i].username !== null) {
            userName = response[i].username;
          }
          else {
            userName = undefined;
          }

          var content = $('<p></p>');
          if (friends[userName] === undefined) {
            content.append('Username: ' + '<div class="clickMe">' + userName + '</div>' + '<br>');
          }
          else {
            content.append('Username: ' + '<strong>' + userName + '</strong>' + '<br>');
          }
          content.append('Message: ' + message + '<br>');
          content.append('Create At: ' + createdAt + '<br>');
          content.append('Room Name: ' + roomName + '<br>');
          div.append(content);
        }
        $('.content').html(div);
      },
      contentType: 'application/json',
      error: function(errorMessage, errorType, error) {
      }
    });
  };
  var updateFriends = function(){
    $.ajax( hostTag + '/classes/friends', {
      type: 'GET',
      data: {username: $('#currentUserName').text()},
      dataType: 'json',
      contentType: 'application/json',
      success: function(response) {

        var content = $('<ul></ul>');
        for (var i = 0, count = response.length; i < count; i++) {
          if(friends[response[i].friend] === undefined) {
            friends[response[i].friend] = true;
            content.append("<li>"+response[i].friend+"</li>");
          }
        }
        $('#friends').html(content);
      },
      error: function(errorMessage, errorType, error) {
      }
    });
  };


  $('body').on('click', '.clickMe', function(event) {
    event.preventDefault();
    var friend = $(this).text();
    if(friends[friend] === undefined) {
      friends[friend] = true;
      var obj = {
        "username": $('#currentUserName').text(),
        "friend": friend
      };

      var JSONobj = JSON.stringify(obj);

      $.ajax( hostTag + '/classes/friends', {
        type: 'POST',
        data: JSONobj,
        dataType: 'json',
        contentType: 'application/json',
        success: function() {
          friends = {};
          updateFriends();
        },
        error: function() {
          console.log('data was not submitted');
        }
      });
    }
  });

  $('body').on('click', '.singUp', function(event) {
    event.preventDefault();
    var username = $('#username').val();
    var fname = $('#FName').val();
    var lname = $('#LName').val();
    var password = $('#password').val();
    var obj = {
      "username": username,
      "FName": fname,
      "LName": lname,
      "password": password
    };

    var JSONobj = JSON.stringify(obj);

    $.ajax( hostTag + '/classes/signUp', {
      type: 'POST',
      data: JSONobj,
      dataType: 'json',
      contentType: 'application/json',
      success: function() {
        //redirect back to original page with log in created
      },
      error: function() {
        //redirect to same page to sign up again, log in already taken
      }
    });
  });

  $('body').on('submit', '.name', function(event) {
    event.preventDefault();
    authenticate();
    $('#username').val("");
  });

  $('body').on('submit', '.room', function(event) {
    event.preventDefault();
    $('#currentRoom').text($('#roomname').val());
    newUpdate();
    $('#roomname').val("")
  });

  $('body').on('click', '.refresh', function() {
    newUpdate();
  });

  $('body').on('submit', '.message', function(event) {
    event.preventDefault();
    var obj = {
      "username": $('#currentUserName').text(),
      "text": $('#text').val(),
      "roomname": $('#currentRoom').text()
    };

    var JSONobj = JSON.stringify(obj);

    $.ajax( hostTag + '/classes/messages', {
      type: 'POST',
      data: JSONobj,
      dataType: 'json',
      contentType: 'application/json',
      success: function() {
        newUpdate();
      },
      error: function() {
        console.log('data was not submitted');
      }
    });
    $('#text').val("");
  });

  var authenticate = function(){
    $.ajax( hostTag + '/classes/friends', {
      type: 'GET',
      data: {username: $('#username').val(), password: $('#password').val()},
      dataType: 'json',
      contentType: 'application/json',
      success: function(response) {
        authenticated = true;
        $('.logout').css('display', 'block');
        $('#currentUserName').text(response);
        $('form.name').hide();
      },
      error: function(errorMessage, errorType, error) {
      }
    });
  };


  $('body').on('submit', '#signup', function(event) {
    event.preventDefault();
    $.ajax(hostTag + '/classes/signUp', {
      type: 'POST',
      data: {username: $('#username').val(), password: $('#password').val()},
      dataType: 'json',
      contentType: 'application/json',
      success: function (response) {
        authenticated = true;
        $('label').text("Hello, ");
        $('.logout').css('display', 'block');
        $('#currentUserName').text(response);
        $('form.name').hide();
      },
      error: function (errorMessage, errorType, error) {
      }
    });
  });

  $('body').on('click', '#logout', function() {
    authenticated = false;
    $('form.name').show();
    $('#logout').css('display', 'none');
  });

  newUpdate();
  //updateFriends();
  //setInterval(newUpdate, 10000);
});
































