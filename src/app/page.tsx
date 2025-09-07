
import { redirect } from "next/navigation";

export default function Home() {
 // Always redirect root to /login
  redirect("/login");
}
