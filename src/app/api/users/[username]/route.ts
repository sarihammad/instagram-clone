import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const user = await prisma.user.findUnique({
      where: { username: params.username },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        website: true,
        isPrivate: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
        followers: session?.user
          ? {
              where: {
                followerId: session.user.id,
              },
            }
          : false,
        blockedUsers: session?.user
          ? {
              where: {
                blockedId: session.user.id,
              },
            }
          : false,
        blockedBy: session?.user
          ? {
              where: {
                blockerId: session.user.id,
              },
            }
          : false,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if blocked
    if (user.blockedUsers.length > 0 || user.blockedBy.length > 0) {
      return NextResponse.json({
        ...user,
        isBlocked: true,
        posts: [],
      });
    }

    // Get posts if user is public or if current user follows them
    const canViewPosts =
      !user.isPrivate ||
      session?.user?.id === user.id ||
      user.followers.length > 0;

    const posts = canViewPosts
      ? await prisma.post.findMany({
          where: {
            userId: user.id,
          },
          select: {
            id: true,
            images: {
              select: {
                url: true,
              },
              take: 1,
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      : [];

    return NextResponse.json({
      ...user,
      isFollowing: user.followers.length > 0,
      posts,
    });
  } catch (error) {
    console.error("[GET_PROFILE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
