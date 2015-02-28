/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var dataArr = {results: [{username:'Rioa', text: 'hello', roomname: 'lobby', createdAt: 'Mon Feb 23 2015 16:43:01 GMT-0800'},
  {username:'Rioa', text: 'hello', roomname: 'lobby', createdAt: 'Mon Feb 23 2015 16:43:01 GMT-0800'},
  {username:'Rioa', text: 'hello', roomname: 'lobby', createdAt: 'Mon Feb 23 2015 16:43:01 GMT-0800'},
  {username:'Rioa', text: 'hello', roomname: 'lobby', createdAt: 'Mon Feb 23 2015 16:43:01 GMT-0800'},
]};

//var redis = require('redis');
//var client = redis.createClient();

exports.requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your public can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  //message object
  //name
  //text
  //createdAt
  //room


  //console.log("Serving request type " + request.method + " for url " + request.url);
  //console.log("Request data " + request.text);
  //console.log("Request room " + request.room);
  //console.log("Request username " + request.usersame);

  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  //headers['Content-Type'] = "text/plain";
    headers['Content-Type'] = "JSON";
  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  if(request.method == "OPTIONS") {
    response.writeHead(statusCode, headers);
  }

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  if(request.method == "GET") {
    var obj = require('url').parse(request.url, true);
    //console.log(obj);
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(dataArr));
  }
  //
  if(request.method == "POST") {
    //var obj = require('url').parse(request.url, true);
    var data = "";
    request.on('data', function(chunk) {
      data += chunk;
      //console.log(this);
      //console.log(chunk.toString());
    });

    request.on('end', function() {
      //console.log("data", typeof data);
      //console.log("data parse", JSON.parse(data));
      var newData = JSON.parse(data);
      newData.createdAt = new Date();
      dataArr.results.push(newData);
      console.log(dataArr.results);
      var responseObj = {"success" : "Updated Successfully", "status" : 200};
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(responseObj));
      //response.end();
    });
  }


  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  response.end("success");
};


// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this public to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "Content-Type": "application/json",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

