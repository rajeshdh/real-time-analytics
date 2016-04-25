# Real-Time Web Analytics with NodeJs, Socket.io, and VueJs

## a real-time web analytics dashboard, similar to what you would find on Google Analytics. 


1. A user loads our page
2. A new socket connection is created via the client-side JavaScript
3. The client-side JavaScript sends the NodeJs + Socket.io server information about the user (which page they are on and which website referred them to ours) over that socket connection
4. The server adds the connection to a list of active ones and computes the total counts for the pages and referring sites
5. The server then sends the computed statistics to the dashboard over a socket connection to display the information


## How to Install

```javascript
Clone the github repo

npm Install
node app.js
```