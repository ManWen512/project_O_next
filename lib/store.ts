// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { postApi } from "@/services/post";
import { friendsApi } from "@/services/friends";
import { userApi } from "@/services/user";
import { aiApi } from "@/services/aiChat";

export const store = configureStore({
  reducer: {
    [postApi.reducerPath]: postApi.reducer,
    [friendsApi.reducerPath]: friendsApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [aiApi.reducerPath]: aiApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(postApi.middleware)
      .concat(friendsApi.middleware)
      .concat(userApi.middleware)
      .concat(aiApi.middleware),
});

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
