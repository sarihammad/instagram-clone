import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId, follow } = await request.json();

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    if (follow) {
      // Create follow relationship
      await prisma.follow.create({
        data: {
          followerId: session.user.id as string,
          followingId: userId,
        },
      });
    } else {
      // Delete follow relationship
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id as string,
            followingId: userId,
          },
        },
      });
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("[FOLLOW]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
