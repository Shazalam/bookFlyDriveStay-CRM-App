import { verifyToken } from "@/lib/auth";
import { apiSuccess, apiError, ErrorCode } from "@/lib/utils/apiResponse";
import logger from "@/lib/utils/logger";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    const token = cookie?.match(/token=([^;]+)/)?.[1];

    // -----------------------------
    // No token found
    // -----------------------------
    if (!token) {
      logger.warn("Authentication failed: Token missing in request cookies");

      return apiError(
        ErrorCode.UNAUTHENTICATED,
        "Authentication token missing",
        401
      );
    }

    // -----------------------------
    // Verify token
    // -----------------------------
    let decoded;

    try {
      decoded = verifyToken(token) as {
        id?: string;
        email?: string;
        name?: string;
        role?: string;
      };

      console.log("decode =",decoded)
    } catch (err) {
      logger.error(`Token verification failed: ${(err as Error).message}`);

      return apiError(
        ErrorCode.EXPIRED_TOKEN,
        "Invalid or expired token",
        401
      );
    }

    if (!decoded?.id || !decoded?.email) {
      logger.warn(
        `Invalid token payload received. Payload: ${JSON.stringify(decoded)}`
      );

      return apiError(
        ErrorCode.INVALID_TOKEN,
        "Invalid token payload",
        401
      );
    }

    // -----------------------------
    // Success
    // -----------------------------
    logger.info(
      `User authenticated successfully: ${decoded.email} (ID: ${decoded.id})`
    );

    return apiSuccess(
      {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name ?? "",
        role: decoded.role ?? "agent",
      },
      "User authenticated",
      200
    );

  } catch (err) {
    logger.error(
      `Unexpected error in authentication route: ${(err as Error).message}`
    );

    return apiError(
      ErrorCode.EXPIRED_TOKEN,
      "Invalid or expired token",
      401
    );
  }
}
