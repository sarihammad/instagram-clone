import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    if (post.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete post (this will cascade delete images, likes, comments, etc.)
    await prisma.post.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[POST_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
