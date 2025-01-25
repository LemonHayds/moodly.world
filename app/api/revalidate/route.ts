import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Get the secret token from the request headers
  const token = request.headers.get("x-revalidate-token");

  // Check if the token matches your secret
  if (token !== process.env.REVALIDATE_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    revalidateTag("analytics");

    return NextResponse.json(
      { message: "Analytics cache cleared successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error clearing analytics cache:", error);
    return NextResponse.json(
      { error: "Failed to clear analytics cache" },
      { status: 500 }
    );
  }
}
