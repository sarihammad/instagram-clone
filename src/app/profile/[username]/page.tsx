import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';
import FollowButton from '@/components/FollowButton';

export default async function ProfilePage({
  params: { username },
}: {
  params: { username: string };
}) {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      posts: {
        orderBy: { createdAt: 'desc' },
      },
      followers: true,
      following: true,
    },
  });

  if (!user) {
    notFound();
  }

  const isCurrentUser = session?.user?.name === username;
  const isFollowing = session?.user?.id
    ? user.followers.some((f) => f.followerId === session.user.id)
    : false;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-8">
        <div className="relative h-32 w-32 overflow-hidden rounded-full">
          <Image
            src={user.image || '/default-avatar.png'}
            alt={user.username}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <div className="mb-4 flex items-center gap-4">
            <h1 className="text-2xl font-semibold">{user.username}</h1>
            {!isCurrentUser && (
              <FollowButton userId={user.id} isFollowing={isFollowing} />
            )}
          </div>

          <div className="flex gap-6">
            <div>
              <span className="font-semibold">{user.posts.length}</span> posts
            </div>
            <div>
              <span className="font-semibold">{user.followers.length}</span>{' '}
              followers
            </div>
            <div>
              <span className="font-semibold">{user.following.length}</span>{' '}
              following
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-1">
        {user.posts.map((post) => (
          <div key={post.id} className="relative aspect-square overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.caption || ''}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
