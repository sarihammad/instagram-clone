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

    // Get users that the current user might be interested in following
    const suggestions = await prisma.user.findMany({
      where: {
        // Not the current user
        NOT: {
          id: session.user.id,
        },
        // Not already following
        followers: {
          none: {
            followerId: session.user.id,
          },
        },
        // Not blocked
        AND: [
          {
            blockedUsers: {
              none: {
                blockedId: session.user.id,
              },
            },
          },
          {
            blockedBy: {
              none: {
                blockerId: session.user.id,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        followers: {
          where: {
            follower: {
              followers: {
                some: {
                  followerId: session.user.id,
                },
              },
            },
          },
          select: {
            follower: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      take: 5,
    });

    // Transform the data to include mutual followers info
    const formattedSuggestions = suggestions.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      image: user.image,
      mutualFollowers: user.followers.map((follow) => follow.follower.username),
    }));

    return NextResponse.json(formattedSuggestions);
  } catch (error) {
    console.error("[GET_SUGGESTIONS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
