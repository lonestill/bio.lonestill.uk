import { trackLinkClick } from "@/app/actions/track-click";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");
    const linkIndex = searchParams.get("linkIndex");

    if (!username || linkIndex === null) {
      return NextResponse.json(
        { error: "Missing username or linkIndex" },
        { status: 400 }
      );
    }

    const result = await trackLinkClick(username, parseInt(linkIndex));

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking click:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track click" },
      { status: 500 }
    );
  }
}
