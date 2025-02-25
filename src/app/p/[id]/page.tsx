import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';
import FeedPost from '@/components/FeedPost';

export default async function PostPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: {
          order: 'asc',
        },
      },
      user: true,
      likes: true,
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Check if the post is from a private account and user is not following
  if (post.user.isPrivate && post.user.id !== session?.user?.id) {
    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session?.user?.id || '',
          followingId: post.user.id,
        },
      },
    });

    if (!isFollowing) {
      notFound();
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <FeedPost post={post} />
    </div>
  );
}
