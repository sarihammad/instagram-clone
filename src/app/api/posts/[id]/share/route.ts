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
        images: {
          orderBy: {
            order: "asc",
          },
        },
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

    const { userIds } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return new NextResponse("User IDs are required", { status: 400 });
    }

    // Create a new post for each user
    const shares = await Promise.all(
      userIds.map(async (userId) => {
        // Check if the user exists and is not blocked
        const user = await prisma.user.findUnique({
          where: { id: userId },
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

        if (!user) {
          throw new Error(`User ${userId} not found`);
        }

        if (user.blockedUsers.length > 0 || user.blockedBy.length > 0) {
          throw new Error(`Cannot share with blocked user ${userId}`);
        }

        // Create a new post
        const sharedPost = await prisma.post.create({
          data: {
            caption: `Shared from @${post.user.username}: ${
              post.caption || ""
            }`,
            userId: session.user.id,
            images: {
              create: post.images.map((image, index) => ({
                url: image.url,
                order: index,
              })),
            },
          },
        });

        return sharedPost;
      })
    );

    return NextResponse.json(shares);
  } catch (error) {
    console.error("[SHARE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
