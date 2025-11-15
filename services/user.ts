import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface User {
    profileImage:string;
}

interface UpdateUserResponse {
  success: boolean;
  message: string;
  user: User;
}

interface UpdateUserRequest {
  userId: string;
  data: {
    name?: string;
    bio?: string;
  };
}


export const userApi = createApi({
  reducerPath: "userApi", // unique key for the reducer
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL }),
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
      query: ({ userId, data }) => ({
        url: `users/updateUser/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useUploadProfileMutation, useUpdateUserMutation} = userApi;