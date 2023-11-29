const socketClient = io();

const message = document.getElementById("message");
const received_messages = document.getElementById("received_messages");

const users = [
  { id: 1, name: "Carlos Perren", username: "cperren" },
  { id: 2, name: "Juan Perez", username: "jperez" },
  { id: 3, name: "Carolina Ferrero", username: "cferrero" },
];

let user = "";

socketClient.on("user_connected", (data) => {
  Swal.fire({
    text: `${data.user.name} se ha conectado!`,
    toast: true,
    position: "top-right",
  });
});

socketClient.on("messagesLogs", (data) => {
  let messages = "";
  data.forEach((message) => {
    messages += `[${message.user.username}] ${message.message}<br />`;
  });
  received_messages.innerHTML = messages;
});

// Emite un tópico message con el nuevo mensaje al pulsar el botón Enviar, manda
// además el nombre del usuario conectado con esta instancia del chat
const sendMessage = () => {
  if (message.value.trim() !== "") {
    socketClient.emit("message", { user: user, message: message.value.trim() });
    message.value = "";
  }
};

const authenticate = () => {
  Swal.fire({
    title: "Identificación",
    input: "text",
    text: "Ingresar usuario:",
    inputValidator: (value) =>
      !value && "se debe especificar un nombre de usuario!",
    allowOutsideClick: false,
  }).then((res) => {
    // user = res.value

    user = users.find((user) => user.username === res.value);
    if (user === undefined) {
      Swal.fire({
        text: "Usuario no válido",
        toast: true,
        position: "top-right",
      }).then((res) => {
        authenticate();
      });
    } else {
      socketClient.emit("user_connected", { user: user });
    }
  });
};

authenticate();