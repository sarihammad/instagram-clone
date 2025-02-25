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

    const { postId, content } = await request.json();

    if (!postId || !content) {
      return new NextResponse("Post ID and content are required", {
        status: 400,
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id as string,
        postId,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[COMMENT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
