// src/app/page.tsx
// import Image from "next/image";

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import FeedPost from '@/components/FeedPost';
import StoryList from '@/components/StoryList';
import Suggestions from '@/components/Suggestions';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Get users with active stories
  const usersWithStories = await prisma.user.findMany({
    where: {
      OR: [
        // Users the current user follows
        {
          followers: {
            some: {
              followerId: session.user.id,
            },
          },
        },
        // Current user
        {
          id: session.user.id,
        },
      ],
    },
    select: {
      id: true,
      username: true,
      image: true,
      stories: {
        where: {
          expiresAt: {
            gt: new Date(), // Only get stories that haven't expired
          },
        },
        select: {
          id: true,
          imageUrl: true,
          createdAt: true,
          expiresAt: true,
          user: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  // Get feed posts
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        // Posts from users the current user follows
        {
          user: {
            followers: {
              some: {
                followerId: session.user.id,
              },
            },
          },
        },
        // Current user's posts
        {
          userId: session.user.id,
        },
      ],
    },
    select: {
      id: true,
      caption: true,
      location: true,
      createdAt: true,
      images: {
        select: {
          id: true,
          url: true,
          order: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
      likes: {
        select: {
          id: true,
          userId: true,
        },
      },
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="flex gap-8 py-8 px-4">
      {/* Main content */}
      <div className="flex-1 max-w-[630px]">
        <div className="mb-8">
          <StoryList users={usersWithStories} />
        </div>
        <div className="space-y-6">
          {posts.map((post) => (
            <FeedPost key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-[320px] flex-shrink-0">
        <div className="fixed w-[320px]">
          <Suggestions />
        </div>
      </div>
    </div>
  );
}
