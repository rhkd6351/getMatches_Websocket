const res = require("express/lib/response");
const SocketIO = require("socket.io");

module.exports = (server, app) => {
  const io = SocketIO(server, {
    path: "/socket.io",
    cors: { origin: "*", methods: ["GET", "POST"] },
  });
  app.set("io", io);
  const room = io.of("/room");

  room.on("connection", (socket) => {
    console.log("유저 접속");

    const req = socket.request;
    const id = socket.id;
    const roomID = socket.handshake.query.roomID;
    const name = socket.handshake.query.name;
    const headOfTeam = false;
    const clientsCount =
      room.adapter.rooms.get(roomID) && room.adapter.rooms.get(roomID).size;

    // const {
    //   headers: { referer },
    // } = req;

    let response = {
      msg: "",
      date: new Date(),
      user: id,
    };

    if (clientsCount && clientsCount >= 2) {
      console.log("최대 참여 가능 인원을 초과하였습니다");
      response.msg = "인원을 초과하였습니다";
      socket.emit("msg", response);
      socket.disconnect();
    } else {
      if (clientsCount == 0) headOfTeam = true;
      socket.join(roomID);
      response.msg = id + "님이 참여하였습니다";
      io.of("room").to(roomID).emit("msg", response);
    }

    socket.on("disconnect", () => {
      console.log("room 네임스페이스 접속 해제");
      response.msg = id + "님이 퇴장하였습니다";
      io.of("room").to(roomID).emit("msg", response);
      socket.leave(roomID);
    });

    socket.on("startGame", (data) => {
      response.date = new Date();
      response.data = "game start";
      io.of("room").to(roomID).emit("startGame", response);
    });

    socket.on("endGame", (data) => {
      response.date = new Date();
      response.data = "game end";
      io.of("room").to(roomID).emit("endGame", response);
    });

    socket.on("pick", (data) => {
      response.date = new Date();
      response.data = data.matchNum;
      response.remainMatches = data.remainMatches;
      io.of("room").to(roomID).emit("pick", response);
    });

    socket.on("endTurn", (data) => {
      response.date = new Date();
      response.data = "end turn";
      io.of("room").to(roomID).emit("endTurn", response);
    });

    socket.on("msg", (data) => {
      response.msg = data;
      response.date = new Date();
      io.of("room").to(roomID).emit("msg", response);
    });
  });
};
