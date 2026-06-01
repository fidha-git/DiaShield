import api from "./api";

export const getChatHistory = async () => {
  const response = await api.get("/chat-history");
  console.log("Chat History:", response.data);
  return response.data;
};

export const sendMessage = async (message) => {
  const response = await api.post("/chat", {
    message: message,
  });

  console.log("AI Response:", response.data);
  return response.data;
};