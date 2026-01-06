import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import Agent from "@/app/models/Agent";
import logger from "@/lib/utils/logger";
import { apiSuccess, apiError, ErrorCode } from "@/lib/utils/apiResponse";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    // -----------------------------
    // Validation — Required Fields
    // -----------------------------
    if (!name || !email || !password) {
      return apiError(
        ErrorCode.VALIDATION_ERROR,
        "All fields are required",
        400
      );
    }

    // -----------------------------
    // Password Strength Validation
    // -----------------------------
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongRegex.test(password)) {
      return apiError(
          ErrorCode.INVALID_PASSWORD,
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
        422
      );
    }

    // -----------------------------
    // Check Existing Agent
    // -----------------------------
    const existing = await Agent.findOne({ email });

    if (existing) {
      return apiError(
        ErrorCode.ALREADY_EXISTS,
        "An agent with this email already exists",
        409
      );
    }

    // -----------------------------
    // Hash Password & Save
    // -----------------------------
    const hashed = await hashPassword(password);

    const agent = await Agent.create({
      name,
      email,
      password: hashed,
      role: "Agent",
      isAllowed: false,
    });

    logger.info("New agent registered", {
      agentId: agent._id.toString(),
      email: agent.email,
      role: agent.role,
    });

    // -----------------------------
    // Success Response
    // -----------------------------
    return apiSuccess(
      {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
        isAllowed: agent.isAllowed,
      },
      "Agent registered successfully",
      201
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error";

    logger.error("Agent registration failed", { error: message });

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to register agent. Please try again later.",
      500,
      process.env.NODE_ENV === "development" ? message : undefined
    );
  }
}
