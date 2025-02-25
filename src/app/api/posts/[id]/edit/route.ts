import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function PUT(
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
        images: true,
      },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    if (post.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const caption = formData.get("caption") as string;
    const location = formData.get("location") as string;
    const files = formData.getAll("images") as File[];
    const deleteImageIds = (formData.get("deleteImageIds") as string)?.split(
      ","
    );

    // Start a transaction
    const updatedPost = await prisma.$transaction(async (tx) => {
      // Delete images if specified
      if (deleteImageIds?.length) {
        await tx.postImage.deleteMany({
          where: {
            id: {
              in: deleteImageIds,
            },
            postId: params.id,
          },
        });
      }

      // Upload new images if provided
      let newImages: { url: string; order: number }[] = [];
      if (files.length) {
        const uploadPromises = files.map((file) =>
          put(file.name, file, {
            access: "public",
          })
        );
        const uploadedImages = await Promise.all(uploadPromises);
        newImages = uploadedImages.map((image, index) => ({
          url: image.url,
          order: post.images.length + index,
        }));
      }

      // Update post
      return tx.post.update({
        where: { id: params.id },
        data: {
          caption,
          location,
          images: newImages.length
            ? {
                create: newImages,
              }
            : undefined,
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
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("[POST_EDIT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
