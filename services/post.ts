import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export type Post = {
  _id: string;
  content: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    profileImage: string;
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
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    //GET POSTS
    getPosts: builder.query<
      { posts: Post[]; page: number; totalPages: number },
      number
    >({
      query: (page = 1) => `posts?page=${page}`,
      serializeQueryArgs: () => "posts",
      merge: (currentCache, newData) => {
        // Prevent duplicate posts by ID
        const existingIds = new Set(currentCache.posts.map((p) => p._id));

        const filtered = newData.posts.filter((p) => !existingIds.has(p._id));

        currentCache.posts.push(...filtered);
        currentCache.page = newData.page;
        currentCache.totalPages = newData.totalPages;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
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
    getPublicPosts: builder.query<Post[], void>({
      query: () => `posts/public/post`,
      providesTags: ["Post"],
    }),

    // GET PRIVATE POSTS (user's private posts)
    getPrivatePosts: builder.query<Post[], void>({
      query: () => `posts/private/post`,
      providesTags: ["Post"],
    }),

    // GET USER'S POSTS (all posts by current user)
    getUserPosts: builder.query<Post[], void>({
      query: () => `posts/all/post`,
      providesTags: ["Post"],
    }),

    // LIKE/UNLIKE POST
    likePost: builder.mutation<Post, string>({
      query: (postId) => ({
        url: `posts/like/${postId}`,
        method: "POST",
      }),
      invalidatesTags: ["Post"],
    }),

    deletePost: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: (postId) => ({
          url: `posts/${postId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Post"],
      }
    ),
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
  useDeletePostMutation,
} = postApi;
