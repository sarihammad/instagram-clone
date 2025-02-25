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

    // Get user stats
    const [
      totalPosts,
      totalLikes,
      totalComments,
      totalFollowers,
      totalFollowing,
      recentActivity,
    ] = await Promise.all([
      // Total posts
      prisma.post.count({
        where: {
          userId: session.user.id,
        },
      }),

      // Total likes received
      prisma.like.count({
        where: {
          post: {
            userId: session.user.id,
          },
        },
      }),

      // Total comments received
      prisma.comment.count({
        where: {
          post: {
            userId: session.user.id,
          },
        },
      }),

      // Total followers
      prisma.follow.count({
        where: {
          followingId: session.user.id,
        },
      }),

      // Total following
      prisma.follow.count({
        where: {
          followerId: session.user.id,
        },
      }),

      // Recent activity (last 30 days)
      prisma.post.findMany({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          createdAt: true,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);

    // Calculate engagement rate (average likes + comments per post)
    const engagementRate =
      totalPosts > 0
        ? ((totalLikes + totalComments) / totalPosts / totalFollowers) * 100
        : 0;

    // Format activity data for chart
    const activityData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      const dayPosts = recentActivity.filter(
        (post) =>
          post.createdAt.toISOString().split("T")[0] ===
          date.toISOString().split("T")[0]
      );

      return {
        date: date.toISOString().split("T")[0],
        posts: dayPosts.length,
        likes: dayPosts.reduce((sum, post) => sum + post._count.likes, 0),
        comments: dayPosts.reduce((sum, post) => sum + post._count.comments, 0),
      };
    });

    return NextResponse.json({
      totalPosts,
      totalLikes,
      totalComments,
      totalFollowers,
      totalFollowing,
      engagementRate,
      activityData,
    });
  } catch (error) {
    console.error("[GET_STATS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
