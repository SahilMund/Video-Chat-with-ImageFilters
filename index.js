const express = require('express');
const app = express();  // initialising express application
const {v4:uuidV4} = require('uuid');    // renaming v4 function as uuidV4 -and this is gonna give us a dynamic url 

const server = require('http').Server(app)  // creating a http server with our express framework that can be used with socket.io 
const io = require('socket.io')(server) // configuring our server with socket.io

app.set('view engine', 'ejs');
app.use(express.static( 'public'));


// custom peerjs server setup
const {ExpressPeerServer} = require('peer');
const peerServer = ExpressPeerServer(server ,{
    debug:true
})
app.use('/peerjs',peerServer);                                           

                                                          

app.get("/thankYou", (req, res) => {
    res.send("Thank You For using me");
});
  
// routers 
app.get('/',(req,res)=>{
   res.redirect(`/${uuidV4()}`);
})
app.get('/:room',(req,res)=>{
    res.render('room',{roomId : req.params.room});
})


// creating a conncetion with socket.io .This is gonna run any time when an user connects to our webpage
io.on('connection',socket =>{
    socket.on('join-room',(roomId,userId)=>{
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected',userId)

        socket.on('disconnect',()=>{
            socket.to(roomId).broadcast.emit('user-disconnected',userId)
        })
    })
})


//  listening to the port

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server running on port ${port}.....`))