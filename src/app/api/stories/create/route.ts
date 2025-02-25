import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";
import { addHours } from "date-fns";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return new NextResponse("No image provided", { status: 400 });
    }

    // Upload image to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    });

    // Create story in database (expires in 24 hours)
    const story = await prisma.story.create({
      data: {
        imageUrl: blob.url,
        userId: session.user.id,
        expiresAt: addHours(new Date(), 24),
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error("[STORY_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
