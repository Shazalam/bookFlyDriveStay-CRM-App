import { verifyToken } from "@/lib/auth";
import { apiResponse } from "@/lib/utils/apiResponse";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie");
  const token = cookie?.match(/token=([^;]+)/)?.[1];

  if (!token) {
    return apiResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const decoded = verifyToken(token) as { id?: string; email?: string; name?: string };

    if (!decoded?.id || !decoded?.email || !decoded?.name) {
      return apiResponse({ error: "Invalid token payload" }, 401);
    }

    return apiResponse({ user: { id: decoded.id, email: decoded.email, name: decoded.name } }, 200);
  } catch {
    return apiResponse({ error: "Invalid or expired token" }, 401);
  }
}
