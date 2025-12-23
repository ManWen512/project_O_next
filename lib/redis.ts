// import "server-only";
// import { createClient } from "redis";

// // Extend the global type to include our Redis client
// declare global {
//   // eslint-disable-next-line no-var
//   var redis: ReturnType<typeof createClient> | undefined;
// }

// const client =
//   global.redis ||
//   createClient({
//     username: "default",
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//       host: process.env.REDIS_HOST,
//       port: Number(process.env.REDIS_PORT),
//     },
//   });

// client.on("error", (err) => console.log("Redis Client Error", err));

// if (!client.isOpen) {
//   client.connect();
// }

// // Prevent multiple instances during development hot reloading
// if (process.env.NODE_ENV !== "production") {
//   global.redis = client;
// }

// export const redis = client;
