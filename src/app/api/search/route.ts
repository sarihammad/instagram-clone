import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
        NOT: {
          id: session?.user?.id, // Exclude current user
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        followers: {
          where: {
            followerId: session?.user?.id,
          },
        },
      },
      take: 20,
    });

    // Transform the results to include isFollowing
    const results = users.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      image: user.image,
      isFollowing: user.followers.length > 0,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("[SEARCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
