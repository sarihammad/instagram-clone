import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { postId, like } = await request.json();

    if (!postId) {
      return new NextResponse("Post ID is required", { status: 400 });
    }

    if (like) {
      // Create like
      await prisma.like.create({
        data: {
          userId: session.user.id as string,
          postId,
        },
      });
    } else {
      // Delete like
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: session.user.id as string,
            postId,
          },
        },
      });
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("[LIKE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
