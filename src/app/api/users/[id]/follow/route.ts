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

    if (params.id === session.user.id) {
      return new NextResponse("Cannot follow yourself", { status: 400 });
    }

    const userToFollow = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        blockedUsers: {
          where: {
            blockedId: session.user.id,
          },
        },
        blockedBy: {
          where: {
            blockerId: session.user.id,
          },
        },
      },
    });

    if (!userToFollow) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (
      userToFollow.blockedUsers.length > 0 ||
      userToFollow.blockedBy.length > 0
    ) {
      return new NextResponse("Cannot follow blocked user", { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: params.id,
        },
      },
    });

    if (existingFollow) {
      return new NextResponse("Already following", { status: 400 });
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: params.id,
      },
    });

    return NextResponse.json(follow);
  } catch (error) {
    console.error("[FOLLOW_USER]", error);
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

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: params.id,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[UNFOLLOW_USER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
