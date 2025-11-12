// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { postApi } from "@/services/post";
import { friendsApi } from "@/services/friends";

export const store = configureStore({
  reducer: {
    [postApi.reducerPath]: postApi.reducer,
    [friendsApi.reducerPath]: friendsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(postApi.middleware)
      .concat(friendsApi.middleware),
});

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
