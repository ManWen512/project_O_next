import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export type Post = {
  _id: string;
  content: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  image?: string[];
  tags?: string[];
  visibility?: "public" | "private";
  likes: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreatePostRequest = {
  content: string;
  image?: string[];
  tags?: string[];
  visibility?: string;
  userId?: string;
};

// Create post slice
export const postApi = createApi({
  reducerPath: "postApi", // unique key for the reducer
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL }),
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    //GET POSTS
    getPosts: builder.query<Post[], void>({
      query: () => "posts",
      providesTags: ["Post"],
    }), // GET /posts
    // getPost: builder.query<Post, number>(), // GET /posts/:id
    addPost: builder.mutation<Post, FormData>({
      query: (formData) => ({
        url: "posts",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Post"],
    }), // POST /posts

    // GET PUBLIC POSTS
    getPublicPosts: builder.query<Post[], string>({
      query: (userId) => `posts/public/user/${userId}`,
      providesTags: ["Post"],
    }),

    // GET PRIVATE POSTS (user's private posts)
    getPrivatePosts: builder.query<Post[], string>({
      query: (userId) => `posts/private/user/${userId}`,
      providesTags: ["Post"],
    }),

    // GET USER'S POSTS (all posts by current user)
    getUserPosts: builder.query<Post[], string>({
      query: (userId) => `posts/user/${userId}`,
      providesTags: ["Post"],
    }),

     // LIKE/UNLIKE POST
    likePost: builder.mutation<Post, { postId: string; userId: string }>({
      query: ({postId, userId}) => ({
        url: `posts/${postId}/like`,
        method: "POST",
        body: {userId},
      }),
      invalidatesTags: ['Post'],
    }),
  }),
});

// Export hooks
export const {
  useGetPostsQuery,
  useAddPostMutation,
  useGetPrivatePostsQuery,
  useGetPublicPostsQuery,
  useGetUserPostsQuery,
  useLikePostMutation,
} = postApi;
