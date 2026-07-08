import client from "./axiosClient";

export const askAi = async (question) => {
  const response = await client.post("/ai/ask", {
    question,
  });

  return response.data;
};