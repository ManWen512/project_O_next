// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { postApi } from "@/services/post";
import { friendsApi } from "@/services/friends";
import { userApi } from "@/services/user";

export const store = configureStore({
  reducer: {
    [postApi.reducerPath]: postApi.reducer,
    [friendsApi.reducerPath]: friendsApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(postApi.middleware)
      .concat(friendsApi.middleware)
      .concat(userApi.middleware),
});

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
