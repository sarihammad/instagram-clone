import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get recent activity from users the current user follows
    const [likes, comments, follows] = await Promise.all([
      // Recent likes on user's posts
      prisma.like.findMany({
        where: {
          post: {
            userId: session.user.id,
          },
          NOT: {
            userId: session.user.id, // Exclude self-likes
          },
        },
        select: {
          id: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
          post: {
            select: {
              id: true,
              images: {
                select: {
                  url: true,
                },
                take: 1,
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),

      // Recent comments on user's posts
      prisma.comment.findMany({
        where: {
          post: {
            userId: session.user.id,
          },
          NOT: {
            userId: session.user.id, // Exclude self-comments
          },
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
          post: {
            select: {
              id: true,
              images: {
                select: {
                  url: true,
                },
                take: 1,
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),

      // Recent follows
      prisma.follow.findMany({
        where: {
          followingId: session.user.id,
        },
        select: {
          createdAt: true,
          follower: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),
    ]);

    // Combine and sort all activities by date
    const activities = [
      ...likes.map((like) => ({
        type: "like" as const,
        id: like.id,
        createdAt: like.createdAt,
        user: like.user,
        post: like.post,
      })),
      ...comments.map((comment) => ({
        type: "comment" as const,
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: comment.user,
        post: comment.post,
      })),
      ...follows.map((follow) => ({
        type: "follow" as const,
        id: `${follow.follower.id}-${follow.createdAt.getTime()}`,
        createdAt: follow.createdAt,
        user: follow.follower,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json(activities);
  } catch (error) {
    console.error("[GET_ACTIVITY]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
