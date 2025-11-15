import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
}

interface CreateFriendRequest {
  requesterId: string;
  recipientId: string;
}

// Create post slice
export const friendsApi = createApi({
  reducerPath: "friendsApi", // unique key for the reducer
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL }),
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
    getPendingFriends: builder.query<Friends[], string>({
      query: (id) => `friends/pending/${id}`,
      providesTags: ["Friend"],
    }),
    //GET pending Friends
    getAllPendingFriends: builder.query<Friends[], string>({
      query: (id) => `friends/allpending/${id}`,
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
