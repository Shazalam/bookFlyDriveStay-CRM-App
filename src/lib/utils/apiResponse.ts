import { NextResponse } from "next/server";

export function apiResponse<T>(
  data: T,
  status: number = 200,
  headers: Record<string, string> = {}
) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}
