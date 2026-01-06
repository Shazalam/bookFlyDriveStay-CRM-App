import axios from "axios";

export function handleAxiosError(err: any, fallback = "Something went wrong") {
  if (axios.isAxiosError(err)) {
    const res = err.response?.data;

    if (res?.error?.message) return res.error.message;
    if (typeof res === "string") return res;
  }
  return fallback;
}
