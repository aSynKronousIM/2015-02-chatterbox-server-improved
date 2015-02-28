var express = require('express');
var app = express();
var request = require('request');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('mysql://127.0.0.1:3306/chatterbox', {});

var Friends = sequelize.define('friends', {
  username: {
    type: Sequelize.STRING,
    field: 'username'
  },
  friend: {
    type: Sequelize.STRING,
    field: 'friend'
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

app.use(express.static(__dirname+'/public/client'));


/**
 * Get request from client for initial data.
 */
app.get('/classes/messages', function(req,res){
  var order = req.query.order;
  console.log("Created: ", order);
  var where = req.query.where || "lobby";
  console.log("Where: ", where);
  var limit = req.query.limit || 100;
  Message.query('SELECT message FROM messages WHERE limit=' + limit + 'AND ROOMNAME = ' + where, {type: sequelize.QueryTypes.SELECT}).then(function(messages) {
    res.end(JSON.stringify(messages));
  Message.query({limit: limit, order: 'createdAt DESC', where: {roomname: where}}).then(function(messages) {
    res.end(JSON.stringify(messages));
  });
});

app.get('/classes/friends', function(req, res){
  var username = req.query.username;
  Friends.findAll({where: {username: username}}).then(function(friends) {
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


    Message.sync().then(function () {
      return Message.create({
        message: newData.text
       });
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
    Friends.sync().then(function () {
      return Friends.create({
        username: newData.username,
        friend: newData.friend
      });
    });
    res.status(200);
    res.writeHead(200);
    res.end(JSON.stringify({ObjectID: 1}));
  });
});

app.listen(process.env.port || 8080);