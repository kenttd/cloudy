import connectDB from "@/database";

export async function register() {
  await connectDB();
  if (typeof window === "undefined") {
  }
}
