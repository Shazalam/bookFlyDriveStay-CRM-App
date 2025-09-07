import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import Agent from "@/app/models/Agent";
import { apiResponse } from "@/lib/utils/apiResponse";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return apiResponse({ error: "All fields are required" }, 400);
    }

    // ✅ Password strength validation
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongRegex.test(password)) {
      return apiResponse(
        {
          error:
            "Weak password: must be 8+ chars, include uppercase, lowercase, number, and special character",
        },
        400
      );
    }

    // check if exists
    const existing = await Agent.findOne({ email });
    if (existing) {
      return apiResponse({ error: "Agent already exists" }, 400);
    }

    // hash password
    const hashed = await hashPassword(password);

    const agent = await Agent.create({
      name,
      email,
      password: hashed,
    });

    // ✅ Don’t return password in response
    return apiResponse(
      {
        success: true,
        agent: { id: agent._id, name: agent.name, email: agent.email },
      },
      201
    );
  } catch (err: any) {
    console.log("register error =>", err )
    return apiResponse({ error: err || "Server error" }, 500);
  }
}
