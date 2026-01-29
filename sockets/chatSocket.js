const socketIO = require("socket.io");

let io;

const socketSetup = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "*", methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {

        socket.on("setup", (userData) => {
            socket.join(userData?.id);
            socket.emit("connected");
        });

        socket.on("join chat", (room) => {
            socket.join(room);
        });

        socket.on("typing", (room) => {
            return socket.in(room).emit("typing")
        });
        socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

        socket.on("new message", (newMessageReceived) => {

            const receiverId = newMessageReceived.receiver;

            if (!receiverId) {
                console.log("Receiver ID not defined");
                return;
            }

            // Send message to the receiver only if not the sender
            if (receiverId !== newMessageReceived.sender) {
                socket.in(receiverId).emit("message received", newMessageReceived);
            }
        });

        socket.on("disconnect", () => {
            console.log("USER DISCONNECTED");
        });

        // Fix: move `off("setup")` logic inside the right scope
        socket.off("setup", (userData) => {
            console.log("USER DISCONNECTED (setup off)");
            console.log("userData", userData)
            socket.leave(userData?.id);
        });
    });
};

module.exports = socketSetup;
