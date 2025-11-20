import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

interface AiChat {
  data: AiChatItem[];
  success: boolean;
}

interface AiChatItem {
  _id: string;
  prompt: string;
  output: string;
  type: string;
}

interface chatResponse {
  prompt: string;
  type: string;
}

// Create post slice
export const aiApi = createApi({
  reducerPath: "aiApi", // unique key for the reducer
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
    prepareHeaders: async (headers) => {
      // Get the NextAuth session
      const session = await getSession();

      // If session has accessToken, add it to Authorization header
      if (session?.accessToken) {
        headers.set("authorization", `Bearer ${session.accessToken}`);
      }

      return headers;
    },
  }),
  tagTypes: ["ai"],
  endpoints: (builder) => ({
    //GET chats
    getChats: builder.query<AiChat, void>({
      query: () => "ai/chat",
      providesTags: ["ai"],
    }),
   
 
  }),
});

export const { useGetChatsQuery } = aiApi;
