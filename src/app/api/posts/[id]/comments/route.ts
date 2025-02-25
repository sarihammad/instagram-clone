import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(
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
      include: {
        user: true,
      },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Check if post is from a private account and user is not following
    if (post.user.isPrivate && post.user.id !== session.user.id) {
      const isFollowing = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: post.user.id,
          },
        },
      });

      if (!isFollowing) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    const { content } = await request.json();

    if (!content?.trim()) {
      return new NextResponse("Comment content is required", { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        postId: params.id,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[CREATE_COMMENT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Check if post is from a private account and user is not following
    if (post.user.isPrivate && post.user.id !== session?.user?.id) {
      const isFollowing = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session?.user?.id || "",
            followingId: post.user.id,
          },
        },
      });

      if (!isFollowing) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId: params.id,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("[GET_COMMENTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
