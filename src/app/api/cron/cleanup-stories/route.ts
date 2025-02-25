import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Delete expired stories
    const result = await prisma.story.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return NextResponse.json({
      message: `Deleted ${result.count} expired stories`,
    });
  } catch (error) {
    console.error("[CLEANUP_STORIES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
