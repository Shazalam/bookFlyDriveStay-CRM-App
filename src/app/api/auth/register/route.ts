import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import Agent from "@/app/models/Agent";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    
    // ✅ Password strength validation
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            "Weak password: must be 8+ chars, include uppercase, lowercase, number, and special character",
        },
        { status: 400 }
      );
    }
    
    // check if exists
    const existing = await Agent.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Agent already exists" }, { status: 400 });
    }

    // hash password
    const hashed = await hashPassword(password);

    const agent = await Agent.create({
      name,
      email,
      password: hashed,
    });

    return NextResponse.json({
      success: true,
      agent: { id: agent._id, name: agent.name, email: agent.email },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
