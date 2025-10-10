import RentalCompany from "@/app/models/RentalCompany";
import { connectDB } from "@/lib/db";
import { apiResponse } from "@/lib/utils/apiResponse";


// ✅ GET all rental companies
export async function GET() {
  try {
    await connectDB();

    // ✅ Ensure at least one default company exists
    const count = await RentalCompany.countDocuments();

    if (count === 0) {
      await RentalCompany.create({ name: "Other" });
      console.log("✅ Default company 'Other' inserted.");
    }

    const companies = await RentalCompany.find().sort({ name: 1 });
    return apiResponse({ success: true, data: companies });
  } catch (err: unknown) {
    console.error("GET /rental-companies error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ success: false, message }, 500);
  }
}

// ✅ POST create rental company
export async function POST(req: Request) {
  
  try {
    await connectDB();
    
    const data = await req.json();
    console.log("📥 Incoming Rental Company Data =>", data);

    if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
      return apiResponse({ success: false, message: "Invalid company name" }, 400);
    }

    // const existing = await RentalCompany.findOne({ name: data.name });
    const existing = await RentalCompany.findOne({ name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") } });
    console.log("Existing companies:", existing);
   
    if (existing) {
      return apiResponse({ success: false, message: "This rental company already exists. Please select it or select 'Other'" }, 400);
    }

    const newCompany = await RentalCompany.create({ name: data.name.trim() });
    return apiResponse({ success: true, message:"New company added successfully", data: newCompany });
  } catch (err: unknown) {
    console.error("POST /rental-companies error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ success: false, message }, 500);
  }
}
