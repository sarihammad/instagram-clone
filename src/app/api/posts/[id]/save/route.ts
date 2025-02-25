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

    // Check if already saved
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: params.id,
        },
      },
    });

    if (existingSave) {
      return new NextResponse("Already saved", { status: 400 });
    }

    // Save post
    const savedPost = await prisma.savedPost.create({
      data: {
        userId: session.user.id,
        postId: params.id,
      },
    });

    return NextResponse.json(savedPost);
  } catch (error) {
    console.error("[SAVE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Unsave post
    await prisma.savedPost.delete({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: params.id,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[UNSAVE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
