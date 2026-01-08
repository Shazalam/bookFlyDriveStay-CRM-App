import { connectDB } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";
import Agent from "@/app/models/Agent";
import logger from "@/lib/utils/logger";
import { apiSuccess, apiError, ErrorCode } from "@/lib/utils/apiResponse";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    // -----------------------------
    // Validation
    // -----------------------------
    if (!email || !password) {
      return apiError(
        ErrorCode.REQUIRED_FIELD,
        "Email and password are required",
        400
      );
    }

    // -----------------------------
    // Find Agent
    // -----------------------------
    const agent = await Agent.findOne({ email }).select("+password");

    if (!agent) {
      logger.warn("Login failed: agent not found", { email });

      return apiError(
        ErrorCode.INVALID_CREDENTIALS,
        "Invalid email or password",
        401
      );
    }

    // -----------------------------
    // Check account allowed
    // -----------------------------
    if (!agent.isAllowed) {
      logger.warn("Login blocked: agent disabled", { email });

      return apiError(
        ErrorCode.UNAUTHORIZED,
        "Account disabled by admin",
        403
      );
    }

    // -----------------------------
    // Verify password
    // -----------------------------
    const isMatch = await comparePassword(password, agent.password);

    if (!isMatch) {
      logger.warn("Login failed: wrong password", { email });

      return apiError(
        ErrorCode.INVALID_CREDENTIALS,
        "Invalid email or password",
        401
      );
    }

    // -----------------------------
    // Generate JWT
    // -----------------------------
    const token = signToken({
      id: agent._id,
      email: agent.email,
      name:agent.name,
      role: agent.role,
    });

    logger.info("Agent login successful", {
      agentId: agent._id.toString(),
      email: agent.email,
      role: agent.role,
    });

    // -----------------------------
    // Success Response
    // -----------------------------
    const response = apiSuccess(
      {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
      },
      "Login successful",
      200
    );

    // -----------------------------
    // Secure Cookie
    // -----------------------------
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";

    logger.error("Login error", { error: message });

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Login failed. Please try again later.",
      500,
      process.env.NODE_ENV === "development" ? message : undefined
    );
  }
}
