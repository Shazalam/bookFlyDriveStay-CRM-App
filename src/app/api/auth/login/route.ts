import { connectDB } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";
import Agent from "@/app/models/Agent";
import { apiResponse } from "@/lib/utils/apiResponse";

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  const agent = await Agent.findOne({ email });
  if (!agent) {
    return apiResponse({ error: "Invalid credentials" },401);
  }

  const isMatch = await comparePassword(password, agent.password);
  console.log("isMatch  =>",isMatch)
  if (!isMatch) {
    return apiResponse({ error: "Invalid credentials" },401);
  }

  // ✅ Create JWT payload
  const token = signToken({ id: agent._id, email: agent.email, name: agent.name });

   // ✅ Prepare response
  const response = apiResponse(
  {
    success: true,
    message: "Login successful",
    user: {
      id: agent._id,
      name: agent.name,
      email: agent.email,
    }, // don't expose password
  },
  200 // ✅ status code
);

  response.cookies.set("token", token, {
    httpOnly: true,     // JS cannot access
    secure: process.env.NODE_ENV === "production", // only HTTPS in prod
    sameSite: "strict", // prevent CSRF
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });

  return response;
}
