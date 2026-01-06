import { apiSuccess, apiError, ErrorCode } from "@/lib/utils/apiResponse";
import logger from "@/lib/utils/logger";


export async function POST() {
  try {
    // -----------------------------
    // Create base response
    // -----------------------------
    const response = apiSuccess(
      null,
      "Logged out successfully",
      200
    );

    // -----------------------------
    // Clear JWT cookie
    // -----------------------------
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0), // remove immediately
      path: "/",
    });

    logger.info("User logged out successfully");

    return response;

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unexpected error";

    logger.error(`Logout API error: ${message}`);

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Logout failed. Please try again later.",
      500,
      process.env.NODE_ENV === "development" ? message : undefined
    );
  }
}
