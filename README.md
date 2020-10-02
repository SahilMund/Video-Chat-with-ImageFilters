## <u>Zoom-Clone</u>

####    Dependencies for this project :-
```
"dependencies": {
    "ejs": "^3.1.5",
    "express": "^4.17.1",
    "peer": "^0.5.3",
    "socket.io": "^2.3.0",
    "uuid": "^8.3.0"
  },
  
```
  * express :- This is the server/web framework we are using.
  * socket.io :-Allows us to communicate back and forth with the actual server (helps in asynchronous real time communication)
  * uuid :- Allows us to create the dynamic url's for every specific room.
       ``` e.g - 9974d73d-ea39-406a-bb91-1db2cb2bc4f4```
  * ejs :- this  View engine we are gonna use "embedded javascript"

### HTTP Vs Socket.io:-

Socket.IO enables real-time, bidirectional and event-based communication but http didn't.
### What is WebRTC ?

WebRTC is a free, open-source project that provides web browsers and mobile applications with real-time communication via simple application programming interfaces.


WebRTC is something taht connects two peers and enable them to share audio and video.

###   To access our own video and audio through the browser webcam:-
```
  navigator.mediaDevices.getUserMedia({
    video : true,
    audio : true
})
```
This above code is a promise(this is a event which is either resloved or rejected) and this promise is actuall as the web browser asks the user to allow the camera and video permission.
If the user allows this promise will resolved else rejected.
### Explaination :

##### This is gonna run any time when an user connects to our webpage
```
io.on('connection',socket =>{

})
  ```
##### It is an event listener which is gonna call when a user join the room and passing the roomid and userid
```
socket.on('join-room',(roomId,userId)=>{
        
})
  ```

  ##### We are joining the room with new user
  ```
   socket.join(roomId)
  ```

  ##### We are sending the message to to the room using roomId and this msg is a broadcast message (i.e. it send to all the other users in the room except me)
  ```
    socket.to(roomId).broadcast.emit('User Connected',userId)
  ```

### room.ejs :-

##### Using socket.io in frontend
```
  <script src="/socket.io/socket.io.js" defer></script>
  ```



<!-- peer Js -->
# <u>Peer.js</u>

It has the ability to create connections between different users using webRTC and also they have the server that helps to create dynamic id's to connecting between different users.

to install the peer js libraray:
```
npm i -g peer
```

including the library
```
<script defer src="https://unpkg.com/peerjs@1.2.0/dist/peerjs.min.js"></script>
```

#### Peer Server :-
to setup the server:
```
peerjs --port 3001
```

 Peer server does is that it takes all the webRTC information for  the user and convert it into the id and which we can pass between differen networks.

###  A peer can connect to other peers and listen for connections.
```
const peer = new Peer([id], [options]);
```

## [id] : STRING
Other peers can connect to this peer using the provided ID. If no ID is given, one will be generated by the brokering server. The ID must start and end with an alphanumeric character (lower or upper case character or a digit). In the middle of the ID spaces, dashes (-) and underscores (_) are allowed.

It's not recommended that you use this ID to identify peers, as it's meant to be used for brokering connections only. You're recommended to set the metadata option to send other identifying information.

## [options]: OBJECT
keySTRING

API key for the cloud PeerServer. This is not used for servers other than 0.peerjs.com.

PeerServer cloud runs on port 443. Please ensure it is not blocked or consider running your own PeerServer instead.

* hostSTRING
Server host. Defaults to 0.peerjs.com. Also accepts '/' to signify relative hostname.

* portNUMBER
Server port. Defaults to 443.

* pingIntervalNUMBER
Ping interval in ms. Defaults to 5000.

* pathSTRING
The path where your self-hosted PeerServer is running. Defaults to '/'.

* secureBOOLEAN
true if you're using SSL.
Note that our cloud-hosted server and assets may not support SSL.

* configOBJECT
Configuration hash passed to RTCPeerConnection. This hash contains any custom ICE/TURN server configuration. Defaults to { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }], 'sdpSemantics': 'unified-plan' }

* debugNUMBER
Prints log messages depending on the debug level passed in. Defaults to 0.

    * 0 Prints no logs.
    * 1 Prints only errors.
    * 2 Prints errors and warnings.
    * 3 Prints all logs.

### Example :-
```
const myPeer = new Peer(undefined,{
    host:'/',
    port:'3001',
})
```


  
We really dont want to listen ourselves ,that's why we have to mute our video

```
myVideo.muted = true;
  ```

###### connecting to  our video
```
navigator.mediaDevices.getUserMedia({
    video : true,
    audio : true
})
  ```

  ## <u> In this project we create a custom peer server</u>
  
  
##### 1.  custom peerjs server setup  Combining with existing express app:- (index.js)


```

const {ExpressPeerServer} = require('peer');

const peerServer = ExpressPeerServer(server ,{
    debug:true
})

  ```

  ##### 2.  middleware for running the peer server :- (index.js)
  ```
  
app.use('/peerjs',peerServer);
```
 ##### 3.Check it: http://127.0.0.1:9000/peerjs
    It should returns JSON with name, description and website fields.

    
##### 4.  Connecting to the server from client PeerJS:
```
  const myPeer = new Peer(undefined,{
    path:'/peerjs',
    host:'localhost',
    port:'3000'
})
  ```