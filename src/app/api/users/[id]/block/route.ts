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
      return new NextResponse("Cannot block yourself", { status: 400 });
    }

    const userToBlock = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!userToBlock) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if already blocked
    const existingBlock = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId: params.id,
        },
      },
    });

    if (existingBlock) {
      return new NextResponse("Already blocked", { status: 400 });
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Remove any existing follow relationships
      await tx.follow.deleteMany({
        where: {
          OR: [
            {
              followerId: session.user.id,
              followingId: params.id,
            },
            {
              followerId: params.id,
              followingId: session.user.id,
            },
          ],
        },
      });

      // Create block relationship
      const block = await tx.blockedUser.create({
        data: {
          blockerId: session.user.id,
          blockedId: params.id,
        },
      });

      return block;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[BLOCK_USER]", error);
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

    // Delete block relationship
    await prisma.blockedUser.delete({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId: params.id,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[UNBLOCK_USER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
