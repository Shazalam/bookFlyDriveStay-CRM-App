import { sendEmail } from "@/lib/email/sendEmail";
import { apiSuccess, apiError, ErrorCode } from "@/lib/utils/apiResponse";
import logger from "@/lib/utils/logger";

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    logger.info("Email send request received", { to, subject });

    // -----------------------------
    // Validation
    // -----------------------------
    if (!to || !subject || !html) {
      logger.warn("Email send failed — missing required fields", { to, subject });

      return apiError(
        ErrorCode.REQUIRED_FIELD,
        "Missing required fields: to, subject, html",
        400
      );
    }

    // -----------------------------
    // Email format validation
    // -----------------------------
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      logger.warn("Email send failed — invalid recipient email", { to });

      return apiError(
        ErrorCode.INVALID_EMAIL,
        "Invalid recipient email address",
        400
      );
    }

    // -----------------------------
    // Send email
    // -----------------------------
    await sendEmail(to, subject, html);

    logger.info("Email sent successfully", { to, subject });

    return apiSuccess(
      null,
      "Email sent successfully",
      200
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";

    logger.error("Failed to send email", { error: message });

    return apiError(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      "Failed to send email. Please try again later.",
      500,
      process.env.NODE_ENV === "development" ? message : undefined
    );
  }
}
