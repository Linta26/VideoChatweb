const { Server } = require("socket.io");
//server runs on 8000 port
const io = new Server(8000,{
    cors: true,
});
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();


io.on("connection",(socket)=>{
    console.log('Socket Connected', socket.id);
    socket.on('room:join',data =>{   //map email to socket for joining room
        const {email, room} = data
        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        io.to(room).emit("user:joined",{email, id: socket.id});
        socket.join(room);
        io.to(socket.id).emit("room:join",data);
    });
//initiate call
    socket.on("user:call", ({ to, offer }) => {
        io.to(to).emit("incomming:call", { from: socket.id, offer });
      });

      socket.on("call:accepted", ({ to, ans }) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans });
      });
      socket.on("peer:nego:needed", ({ to, offer }) => { //nogotiation req to webrtc
        console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
      });
    
      socket.on("peer:nego:done", ({ to, ans }) => { //finalize peer connection
        console.log("peer:nego:done", ans);
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
      });
    
});