import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

interface User {
  profileImage: string;
}

interface UpdateUserResponse {
  success: boolean;
  message: string;
  user: User;
}

interface UpdateUserRequest {
  data: {
    name?: string;
    bio?: string;
  };
}

export const userApi = createApi({
  reducerPath: "userApi", // unique key for the reducer
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
  tagTypes: ["User"],
  endpoints: (builder) => ({
    uploadProfile: builder.mutation<User, FormData>({
      query: (formData) => ({
        url: "users/upload-profile",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    updateUser: builder.mutation<UpdateUserResponse, UpdateUserRequest>({
      query: (data ) => ({
        url: `users/updateUser`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useUploadProfileMutation, useUpdateUserMutation } = userApi;
