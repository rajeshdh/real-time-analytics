// require Express and Socket.io

var express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  path = require('path'),
  config = require('./config.js');
  
  
// the object that will hold info about the active users currently on the site
var visitorsData = {};

app.set('port', (process.env.PORT || 1337));


// serve the static assests from public directory

app.use(express.static(path.join(__dirname, 'public/')));


// serve the index.html page when someone visits any of the following endpoints:
//    1. /
//    2. /about
//    3. /contact

app.get(/\/(about|contact)?$/, function(req, res) {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

// serve up the dashboard when someone visits /dashboard
app.get('/dashboard', function(req, res) {
  res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});


io.on('connection', function(socket) {
  if (socket.handshake.headers.host === config.host
  && socket.handshake.headers.referer.indexOf(config.host + config.dashboardEndpoint) > -1) {

    // if someone visits '/dashboard' send them the computed visitor data
    io.emit('updated-stats', computeStats());

  }

  // a user has visited our page - add them to the visitorsData object
  socket.on('visitor-data', function(data) {
    visitorsData[socket.id] = data;

    // compute and send visitor data to the dashboard when a new user visits our page
    io.emit('updated-stats', computeStats());
  });

  socket.on('disconnect', function() {
    // a user has left our page - remove them from the visitorsData object
    delete visitorsData[socket.id];

    // compute and send visitor data to the dashboard when a user leaves our page
    io.emit('updated-stats', computeStats());
  });
});



// wrapper function to compute the stats and return a object with the updated stats
function computeStats(){
    return {
        pages: computePageCounts(),
        referrers: computeRefererCounts(),
        activeUsers: getActiveUsers()
    };
}

// get the total number of usres on each page of our site
function computePageCounts() {
  
  var pageCounts = {};
  for (var key in visitorsData) {
    var page = visitorsData[key].page;
    if (page in pageCounts) {
      pageCounts[page]++;
    } else {
      pageCounts[page] = 1;
    }
  }
  return pageCounts;
}

// get the total number of users per referring site
function computeRefererCounts() {
    
    var referrerCounts = {};
    for (var key in visitorsData) {
        var referringSite = visitorsData[key].referringSite || '(direct)';
        if (referringSite in referrerCounts) {
            referrerCounts[referringSite]++;
        } else {
            referrerCounts[referringSite] = 1;
        }
    }
    return referrerCounts; 
}

function getActiveUsers(){
    return Object.keys(visitorsData).length;
}

http.listen(app.get('port'), function() {
    console.log('listening on *:' + app.get('port'));
});