'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MapPin, Grid } from 'lucide-react';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';

type Post = {
  id: string;
  images: { id: string; url: string }[];
  caption: string | null;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  user: {
    username: string;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
};

type Location = {
  name: string;
  lat: number;
  lng: number;
  posts: Post[];
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

export default function LocationMap() {
  const { data: session } = useSession();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        const data = await response.json();
        setLocations(data.locations);

        // Set initial center to the first location or user's location
        if (data.locations.length > 0) {
          setCenter({
            lat: data.locations[0].lat,
            lng: data.locations[0].lng,
          });
        } else {
          // Get user's location as fallback
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setCenter({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            () => {
              // Default to a central location if geolocation fails
              setCenter({ lat: 40.7128, lng: -74.006 });
            }
          );
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (!session?.user) return null;

  if (loadError) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-65px)]">
        <p className="text-red-500">Error loading maps</p>
      </div>
    );
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-65px)]">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-65px)] flex">
      {/* Map */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          center={center}
          options={options}
        >
          {locations.map((location) => (
            <MarkerF
              key={`${location.lat}-${location.lng}`}
              position={{ lat: location.lat, lng: location.lng }}
              onClick={() => setSelectedLocation(location)}
              icon={{
                url: '/map-marker.png',
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          ))}
        </GoogleMap>
      </div>

      {/* Location details sidebar */}
      {selectedLocation && (
        <div className="w-96 border-l overflow-y-auto">
          <div className="p-4 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <h2 className="font-semibold">{selectedLocation.name}</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {selectedLocation.posts.length} posts
            </p>
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-2 gap-0.5 p-0.5">
            {selectedLocation.posts.map((post) => (
              <Link
                key={post.id}
                href={`/p/${post.id}`}
                className="relative aspect-square group"
              >
                {post.images[0] ? (
                  <Image
                    src={post.images[0].url}
                    alt={post.caption || ''}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Grid className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-6 text-white">
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                      </svg>
                      <span className="font-semibold">{post._count.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold">
                        {post._count.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
