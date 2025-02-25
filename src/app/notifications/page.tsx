'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';

type User = {
  id: string;
  username: string;
  image: string | null;
};

type NotificationType =
  | 'follow'
  | 'like'
  | 'comment'
  | 'mention'
  | 'tag'
  | 'follow_request';

type Notification = {
  id: string;
  type: NotificationType;
  user: User;
  createdAt: Date;
  read: boolean;
  post?: {
    id: string;
    image: string;
  };
  comment?: string;
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'follow_requests'>('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        const data = await response.json();
        setNotifications(data.notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleFollowRequest = async (
    notificationId: string,
    action: 'accept' | 'decline'
  ) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/${action}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) throw new Error(`Failed to ${action} follow request`);

      // Remove the notification from the list
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error(`Error ${action}ing follow request:`, error);
    }
  };

  const followRequests = notifications.filter(
    (n) => n.type === 'follow_request'
  );
  const otherNotifications = notifications.filter(
    (n) => n.type !== 'follow_request'
  );

  if (!session?.user) return null;

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-8 py-4 font-semibold ${
            activeTab === 'all' ? 'border-b-2 border-black' : 'text-gray-500'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('follow_requests')}
          className={`px-8 py-4 font-semibold flex items-center ${
            activeTab === 'follow_requests'
              ? 'border-b-2 border-black'
              : 'text-gray-500'
          }`}
        >
          Follow Requests
          {followRequests.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {followRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Notifications list */}
      {activeTab === 'all' ? (
        <div className="space-y-4">
          {otherNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center p-4 ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              {/* User avatar */}
              <Link
                href={`/profile/${notification.user.username}`}
                className="shrink-0"
              >
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={notification.user.image || '/default-avatar.png'}
                    alt={notification.user.username}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>

              {/* Notification content */}
              <div className="ml-4 flex-1">
                <p className="text-sm">
                  <Link
                    href={`/profile/${notification.user.username}`}
                    className="font-semibold hover:underline"
                  >
                    {notification.user.username}
                  </Link>{' '}
                  {notification.type === 'follow' && 'started following you'}
                  {notification.type === 'like' && 'liked your post'}
                  {notification.type === 'comment' &&
                    `commented: ${notification.comment}`}
                  {notification.type === 'mention' &&
                    'mentioned you in a comment'}
                  {notification.type === 'tag' && 'tagged you in a post'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(notification.createdAt, {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {/* Post thumbnail */}
              {notification.post && (
                <Link
                  href={`/p/${notification.post.id}`}
                  className="shrink-0 ml-4"
                >
                  <div className="relative h-12 w-12">
                    <Image
                      src={notification.post.image}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
              )}
            </div>
          ))}

          {otherNotifications.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No notifications yet
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {followRequests.map((notification) => (
            <div key={notification.id} className="flex items-center p-4">
              {/* User avatar */}
              <Link
                href={`/profile/${notification.user.username}`}
                className="shrink-0"
              >
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={notification.user.image || '/default-avatar.png'}
                    alt={notification.user.username}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>

              {/* Request content */}
              <div className="ml-4 flex-1">
                <p className="text-sm">
                  <Link
                    href={`/profile/${notification.user.username}`}
                    className="font-semibold hover:underline"
                  >
                    {notification.user.username}
                  </Link>{' '}
                  wants to follow you
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(notification.createdAt, {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleFollowRequest(notification.id, 'accept')}
                  className="px-6 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600"
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    handleFollowRequest(notification.id, 'decline')
                  }
                  className="px-6 py-2 border border-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}

          {followRequests.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No follow requests
            </div>
          )}
        </div>
      )}
    </div>
  );
}
