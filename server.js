var express = require('express');
var password = require('./protection');
var app = express();
var request = require('request');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('Chatterbox', 'root', '', {
  host:'localhost',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }

});

sequelize.authenticate().complete(
  function(err){
    if(!!err){
      console.log(err)
    }
    else{
      console.log('connected');
    }
  }
);

var authenticated = false;



var Friends = sequelize.define('friends', {
  userId: {
    type: Sequelize.INTEGER,
    field: 'userId'
  },
  friendId: {
    type: Sequelize.INTEGER,
    field: 'friendId'
  }

});

var MessageRoom = sequelize.define('messageroom', {
  messageId: {
    type: Sequelize.INTEGER,
    field: 'messageId'
  },
  roomId: {
    type: Sequelize.INTEGER,
    field: 'roomId'
  }
});

var Message = sequelize.define('messages', {
  message: {
    type: Sequelize.TEXT,
    field: 'message'
  }

});

var MessageUser = sequelize.define('messageuser', {
  messageId: {
    type: Sequelize.INTEGER,
    field: 'messageId'
  },
  userId: {
    type: Sequelize.INTEGER,
    field: 'userId'
  }
});

var RoomAllowed = sequelize.define('roomallowed', {
  idRoom: {
    type: Sequelize.INTEGER,
    field: 'idRoom'
  },
  idUser: {
    type: Sequelize.INTEGER,
    field: 'idUser'
  }
});

var RoomOwner = sequelize.define('roomowner', {
  idOwner: {
    type: Sequelize.INTEGER,
    field: 'idOwner'
  },
  idRoom: {
    type: Sequelize.INTEGER,
    field: 'idRoom'
  }
});

var Rooms = sequelize.define('rooms', {
  name: {
    type: Sequelize.STRING,
    field: 'name'
  }
});

var User = sequelize.define('user', {
  FName: {
    type: Sequelize.STRING,
    field: 'FName'
  },
  LName: {
    type: Sequelize.STRING,
    field: 'LName'
  },
  userName: {
    type: Sequelize.STRING,
    field: 'userName'
  },
  password: {
    type: Sequelize.STRING,
    field: 'password'
  }
});


var url = require('url');

app.use(express.static(__dirname + '/public/client'));

/**
 * Get request from client for initial data.
 */
app.get('/classes/messages', function(req,res){
  var where = req.query.where || "lobby";
  var newWhere = "SET @A:=" + '"' + where + '"' + "; CALL Chatterbox.selectMessages(@A);";
  sequelize.query(newWhere, {type: sequelize.QueryTypes.SELECT}).then(function(messages){
    console.log(messages);
    res.end(JSON.stringify(messages));
  });
});

app.get('/classes/friends', function(req, res){
  var username = req.query.username;
  sequelize.query('SET @A:=' + "'" + username + "'" + '; CALL Chatterbox.selectFriend(@A);').then(function(friends) {
    res.end(JSON.stringify(friends));
  });
});



app.post('/classes/messages', function(req, res) {
  var data = "";
  req.on('data', function(chunk) {
    data += chunk;
  });

  req.on('end', function() {
    var newData = JSON.parse(data);
    //we might not need line 136
    Message.sync().then(function () {
      return Message.query('SET @A:=' + "'" + newData.message + "'" + '; SET @B:='+ "'" + newData.userName + "'" + '; SET @C:=' + "'" + newData.roomname + "'" + '; SET @D:=1234; CALL insertIntoMessages(@A, @B, @C);')
    });
    res.status(200);
    res.writeHead(200);
    res.end(JSON.stringify({ObjectID: 1}));
  });
});




app.post('/classes/friends', function(req, res) {
  var data = "";
  req.on('data', function(chunk) {
    data += chunk;
  });

  req.on('end', function() {
    var newData = JSON.parse(data);
    //we might not need 157
    Friends.sync().then(function () {
      return Friends.query('SET @A:=' + "'" + newData.username + "'" + '; SET @B:=' + "'" +  newData.friendId + "'" +  '; CALL createFriend(@A, @B);');
    });
    res.status(200);
    res.writeHead(200);
    res.end(JSON.stringify({ObjectID: 1}));
  });
});


app.post('/classes/addUser', function(req, res) {
  var data = "";
  req.on('data', function(chunk) {
    data += chunk;
  });

  req.on('end', function() {
    var newData = JSON.parse(data);
    var password = password.hex_md5(newData.password);


    User.sync().then(function () {
      return Message.query('SET @A:=' + "'" + newData.userName + "'" + '; SET @B:=' + "'" + newData.FName + "'" + '; SET @C:='+ "'" + newData.LName + "'" + '; SET @D:=' + password + '; CALL insertNewUser(@A, @B, @C, @D);')
    });
    res.status(200);
    res.writeHead(200);
    res.end(JSON.stringify({ObjectID: 1}));
  });
});

app.post('/classes/authenticate', function(req, res) {
  var data = "";
  req.on('data', function(chunk) {
    data += chunk;
  });

  req.on('end', function() {
    var newData = JSON.parse(data);
    var password = password.hex_md5(newData.password);


    User.sync().then(function() {
      return Message.query('SELECT password FROM user WHERE username = ' + "'" + newData.username + "'", {type: sequelize.QueryTypes.SELECT}).then(function(validatePassword) {
        if (password === validatePassword) {
          authenticated = true;
          res.end(JSON.stringify({validation: true}));
        }
        else {
          authenticated = false;
          res.end(JSON.stringify({validation: false}));
        }
      });
      res.status(200);
      res.writeHead(200);
      res.end(JSON.stringify({ObjectID: 1}));
    });
  });
});

app.post('/classes/addRoom', function(req, res) {
  var data = "";
  req.on('data', function(chunk) {
    data += chunk;
  });

  req.on('end', function() {
    var newData = JSON.parse(data);
    Message.sync().then(function () {
      return Message.query('SET @A:=' + "'" + newData.username + "'" + '; SET @B:=' + "'" + newData.roomname + "'" + '; CALL createRoom(@A, @B);')
    });
    res.status(200);
    res.writeHead(200);
    res.end(JSON.stringify({ObjectID: 1}));
  });
});

app.get('/classes/rooms', function(req, res){
  var username = req.query.username;
  Rooms.query('SET @A:=' + "'" + username + "'" + '; CALL selectRooms(@A)').then(function(rooms) {
    res.end(JSON.stringify(rooms));
  });
});

app.post('/classes/addRoomAllowed', function(req, res) {
  var data = "";
  req.on('data', function(chunk) {
    data += chunk;
  });

  req.on('end', function() {
    var newData = JSON.parse(data);

    Rooms.sync().then(function () {
      return Rooms.query('SET @A:=' + "'" + newData.username + "'" + '; SET @B:=' + "'" + newData.roomname + "'" + '; CALL insertRoomAllowed(@A, @B);')
    });
    res.status(200);
    res.writeHead(200);
    res.end(JSON.stringify({ObjectID: 1}));
  });
});




app.listen(8080);
//app.listen(process.env.port || 8080);