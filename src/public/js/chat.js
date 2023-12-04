const socketClient = io();

const userField = document.getElementById("username");
const messageField = document.getElementById("message");
const received_messages = document.getElementById("received_messages");

document.addEventListener("DOMContentLoaded", () => {
  received_messages.innerHTML = "";
});

socketClient.on("messagesLogs", (data) => {
  let messages = "";
  data.forEach((msg) => {
    messages += `[${msg.user}] ${msg.message}<br />`;
  });
  received_messages.innerHTML = messages;
});

const sendMessage = () => {
  const user = userField.value.trim();
  const messageText = messageField.value.trim();

  if (messageText !== "" && user !== "") {
    socketClient.emit("message", { user: user, message: messageText });
    messageField.value = "";
  }
};

