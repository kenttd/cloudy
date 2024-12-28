import connectDB from "@/database";

export async function register() {
  if (typeof window === "undefined") {
    await connectDB();
  }
}
