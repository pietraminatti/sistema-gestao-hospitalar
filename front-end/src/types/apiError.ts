export interface ApiError extends Error {
  name: "ApiError";
  message: string;
}
