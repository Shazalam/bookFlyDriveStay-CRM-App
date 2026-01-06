import RentalCompany from "@/app/models/RentalCompany";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/utils/apiResponse";
import logger from "@/lib/utils/logger";

// =========================================
// GET — Fetch all rental companies
// =========================================
export async function GET() {
  try {
    await connectDB();

    logger.info("Fetching rental companies...");

    // Ensure a default company always exists
    const count = await RentalCompany.countDocuments();

    if (count === 0) {
      logger.warn("No rental companies found — creating default 'Other' entry");
      await RentalCompany.create({ name: "Other" });
    }

    const companies = await RentalCompany.find().sort({ name: 1 });

    logger.info(`Fetched ${companies.length} rental companies`);

    return apiSuccess(
      companies,
      "Rental companies fetched successfully",
      200
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";

    logger.error("Failed to fetch rental companies", { error: message });

    return apiError(
      ErrorCode.DATABASE_ERROR,
      "Failed to fetch rental companies",
      500,
      process.env.NODE_ENV === "development" ? message : undefined
    );
  }
}



// =========================================
// POST — Create new rental company
// =========================================
export async function POST(req: Request) {
  try {
    await connectDB();

    const { name } = await req.json();

    logger.info("Create rental company request received", { name });

    // -----------------------------
    // Validation
    // -----------------------------
    if (!name || typeof name !== "string" || name.trim() === "") {
      logger.warn("Create rental company failed — invalid name", { name });

      return apiError(
        ErrorCode.REQUIRED_FIELD,
        "Company name is required",
        400
      );
    }

    const normalized = name.trim();

    // -----------------------------
    // Check Duplication
    // -----------------------------
    const existing = await RentalCompany.findOne({
      name: { $regex: new RegExp(`^${normalized}$`, "i") }
    });

    if (existing) {
      logger.warn("Duplicate company creation attempt", { name: normalized });

      return apiError(
        ErrorCode.ALREADY_EXISTS,
        "This rental company already exists. Please select it or choose 'Other'.",
        409
      );
    }

    // -----------------------------
    // Create Company
    // -----------------------------
    const newCompany = await RentalCompany.create({ name: normalized });

    logger.info("Rental company created successfully", {
      id: newCompany._id.toString(),
      name: newCompany.name
    });

    return apiSuccess(
      newCompany,
      "Rental company created successfully",
      201
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";

    logger.error("Failed to create rental company", { error: message });

    return apiError(
      ErrorCode.DATABASE_ERROR,
      "Failed to create rental company",
      500,
      process.env.NODE_ENV === "development" ? message : undefined
    );
  }
}
