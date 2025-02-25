import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Heart, MessageCircle } from 'lucide-react';

export default async function ExplorePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Get popular posts (posts with most likes and comments)
  const posts = await prisma.post.findMany({
    where: {
      NOT: {
        userId: session.user.id, // Exclude user's own posts
      },
    },
    include: {
      images: {
        orderBy: {
          order: 'asc',
        },
      },
      user: true,
      likes: true,
      comments: true,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: [
      {
        likes: {
          _count: 'desc',
        },
      },
      {
        comments: {
          _count: 'desc',
        },
      },
    ],
    take: 30,
  });

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>

      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/p/${post.id}`}
            className="relative aspect-square group"
          >
            <Image
              src={post.images[0].url}
              alt={post.caption || ''}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex items-center space-x-6 text-white">
                <div className="flex items-center">
                  <Heart className="w-6 h-6 mr-2 fill-white" />
                  <span>{post._count.likes}</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-6 h-6 mr-2" />
                  <span>{post._count.comments}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
