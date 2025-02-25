import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const caption = formData.get("caption") as string;
    const location = formData.get("location") as string;
    const files = formData.getAll("images") as File[];

    if (!files.length) {
      return new NextResponse("At least one image is required", {
        status: 400,
      });
    }

    // Upload images to Vercel Blob
    const uploadPromises = files.map((file) =>
      put(file.name, file, {
        access: "public",
      })
    );

    const uploadedImages = await Promise.all(uploadPromises);

    // Create post with images
    const post = await prisma.post.create({
      data: {
        caption,
        location,
        userId: session.user.id,
        images: {
          create: uploadedImages.map((image, index) => ({
            url: image.url,
            order: index,
          })),
        },
      },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
        user: true,
        likes: true,
        comments: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[POST_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
