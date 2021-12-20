const fs = require("fs");
// const socket = require("socket.io");
const express = require("express");
const http = require("http");
const socket = require("./socket");
const cors = require("cors");

const app = express();
app.set("port", process.env.PORT || 8080);
app.set("view engine", "html");
app.use(cors());

const server = http.createServer(app);
// const io = socket(server);

app.use("/css", express.static("./static/css"));
app.use("/js", express.static("./static/js"));

app.get("/", (req, res) => {
  fs.readFile("./static/index.html", (err, data) => {
    if (err) res.send("error");
    else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(data);
      res.end();
    }
  });
});

const io = socket(server, app);

server.listen(80, () => {
  console.log("서버 실행중");
});

// io.sockets.on("connection", (socket) => {
//   console.log("유저 접속");

//   socket.on("send", (data) => {
//     console.log("메시지 : " + data.msg);
//   });

//   socket.on("disconnect", () => {
//     console.log("접속종료");
//   });
// });
