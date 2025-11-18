import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import type { Post } from "./post";

interface Friends {
  _id: string; // maps from _id
  name: string;
  email: string;
  profileImage: string;
  bio: string;
  emailVerified: string;
  isVerified: boolean;
  friends: string[];
  createdAt: string;
  requester: {
    _id: string | undefined;
    name: string;
    email: string;
    profileImage: string;
    bio: string;
  };
  recipient: {
    _id: string;
    name: string;
    profileImage: string;
    bio: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
    bio: string;
    profileImage: string;
  };
  posts: Post[];
}

interface CreateFriendRequest {
  requesterId: string;
  recipientId: string;
}

// Create post slice
export const friendsApi = createApi({
  reducerPath: "friendsApi", // unique key for the reducer
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
  tagTypes: ["Friend"],
  endpoints: (builder) => ({
    //GET Friends
    getFriends: builder.query<Friends[], void>({
      query: () => "users",
      providesTags: ["Friend"],
    }),
    //GET Friend by ID
    getFriendById: builder.query<Friends, string>({
      query: (userId) => `users/${userId}`,
      providesTags: ["Friend"],
    }),
    //GET pending Friends
    getPendingFriends: builder.query<Friends[], void>({
      query: () => `friends/pending`,
      providesTags: ["Friend"],
    }),
    //GET pending Friends
    getAllPendingFriends: builder.query<Friends[], void>({
      query: () => `friends/allpending`,
      providesTags: ["Friend"],
    }),
    //GET Friends lists
    getFriendsLists: builder.query<Friends[], string>({
      query: (id) => `friends/list/${id}`,
      providesTags: ["Friend"],
    }),
    //POST friend request
    addFriends: builder.mutation<Friends, CreateFriendRequest>({
      query: (newFriend) => ({
        url: "friends/send",
        method: "POST",
        body: newFriend,
      }),
      invalidatesTags: ["Friend"],
    }),
    //PUT accept friend request
    acceptFriends: builder.mutation<Friends, string>({
      query: (id) => ({
        url: `friends/accept/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Friend"],
    }),
    //PUT reject friend request
    rejectFriends: builder.mutation<Friends, string>({
      query: (id) => ({
        url: `friends/reject/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Friend"],
    }),
  }),
});

export const {
  useGetFriendsQuery,
  useGetFriendByIdQuery,
  useGetPendingFriendsQuery,
  useGetFriendsListsQuery,
  useAddFriendsMutation,
  useAcceptFriendsMutation,
  useRejectFriendsMutation,
  useGetAllPendingFriendsQuery,
} = friendsApi;
