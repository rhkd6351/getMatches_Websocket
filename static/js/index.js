// let socket = io.connect("http://localhost:8080/room", {
//   path: "socket.io",
// });

// socket.on("connect", () => {
//   let input = document.getElementById("test");
//   input.value = "접속 됨";
// });

const send = () => {
  let message = document.getElementById("test").value;

  document.getElementById("test").value = "";

  socket.emit("msg", message);
};
