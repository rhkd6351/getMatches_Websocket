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

    let roomID = socket.handshake.query.roomID;
    let name = socket.handshake.query.name;
    let isPart = socket.handshake.query.isPart;
    let headOfTeam = false;
    let clientsCount =
      room.adapter.rooms.get(roomID) && room.adapter.rooms.get(roomID).size;

    console.log(room);

    // const {
    //   headers: { referer },
    // } = req;

    let response = {
      msg: "",
      date: new Date(),
      user: name,
    };

    //참가자는 참여코드가 유효한지 확인 (참여자 숫자로 구분)
    if (isPart && isPart == true) {
      response.msg = "참여 코드를 확인해주세요.";
      socket.emit("error", response);
      socket.disconnect();
    } else {
      headOfTeam = true;
    }

    //인원초과 여부 확인
    if (clientsCount && clientsCount >= 2) {
      response.msg =
        "입장 가능한 인원이 초과되었습니다. \n다른 방을 만들어주세요.";
      socket.emit("error", response);
      socket.disconnect();
    } else {
      // if (!clientsCount) headOfTeam = true;
      socket.join(roomID);

      response.msg = `초대링크를 공유해서 친구들을 초대해주세요! 참여코드: ${roomID}`;
      io.of("room").to(roomID).emit("system", response);

      response.msg = name + "님이 입장하셨습니다.";
      io.of("room").to(roomID).emit("system", response);
      io.of("room").to(roomID).emit("enter", name);
    }

    socket.on("disconnect", () => {
      response.date = new Date();
      response.msg = name + "님이 퇴장하였습니다";
      io.of("room").to(roomID).emit("system", response);
      io.of("room").to(roomID).emit("exit", name);
      socket.leave(roomID);
    });

    socket.on("start", (data) => {
      response.date = new Date();
      response.msg = data;
      io.of("room").to(roomID).emit("start", response);
      response.msg = `게임 시작! 한 턴에 최대 ${data}개를 가져갈 수 있습니다. 3초 안에 가져가세요!`;
      io.of("room").to(roomID).emit("system", response);
    });

    socket.on("pick", (data) => {
      response.date = new Date();
      response.msg = data;
      // response.remainMatches = data.remainMatches;
      io.of("room").to(roomID).emit("pick", response);
    });

    //클라이언트에서 토글방식으로 동작
    socket.on("endTurn", (data) => {
      response.date = new Date();
      response.msg = data;
      io.of("room").to(roomID).emit("endTurn", response);
      response.msg = `${name} 님이 턴을 종료하였습니다.`;
      io.of("room").to(roomID).emit("system", response);
    });

    socket.on("endGame", (data) => {
      response.date = new Date();
      response.msg = `${data}님이 승리하였습니다! 게임이 종료되었습니다.`;
      io.of("room").to(roomID).emit("system", response);

      response.msg = data;
      io.of("room").to(roomID).emit("endGame", response);
    });

    socket.on("msg", (data) => {
      response.msg = data;
      response.date = new Date();
      io.of("room").to(roomID).emit("msg", response);
    });
  });
};
