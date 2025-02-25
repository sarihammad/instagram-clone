'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  X,
  ChevronLeft,
  ImageIcon,
  MapPin,
  Users,
  Crop,
  Maximize2,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

type Step = 'select' | 'crop' | 'filter' | 'create';

export default function CreatePostModal({ onClose }: { onClose: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [currentStep, setCurrentStep] = useState<Step>('select');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'square' | 'original'>(
    'square'
  );
  const [zoom, setZoom] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setCurrentStep('crop');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    multiple: true,
  });

  const handleBack = () => {
    if (currentStep === 'create') {
      setCurrentStep('filter');
    } else if (currentStep === 'filter') {
      setCurrentStep('crop');
    } else if (currentStep === 'crop') {
      setCurrentStep('select');
      setFiles([]);
    }
  };

  const filters = [
    { name: 'Normal', class: '' },
    { name: 'Clarendon', class: 'brightness-125 contrast-110' },
    { name: 'Gingham', class: 'brightness-110 hue-rotate-330' },
    { name: 'Moon', class: 'grayscale brightness-110' },
    { name: 'Lark', class: 'brightness-110 sepia-10' },
    { name: 'Reyes', class: 'sepia brightness-110 contrast-85' },
    { name: 'Juno', class: 'saturate-150 hue-rotate-350' },
    { name: 'Slumber', class: 'sepia-50 brightness-105' },
    { name: 'Crema', class: 'sepia-50 brightness-110 contrast-90' },
    { name: 'Ludwig', class: 'sepia-25 contrast-105' },
    { name: 'Aden', class: 'sepia-20 brightness-110' },
    { name: 'Perpetua', class: 'brightness-110 saturate-110' },
  ];

  const handleSubmit = async () => {
    try {
      setUploading(true);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });
      formData.append('caption', caption);
      if (location) formData.append('location', location);
      if (filter) formData.append('filter', filter);
      formData.append('aspectRatio', aspectRatio);
      formData.append('zoom', zoom.toString());

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 'crop') {
      setCurrentStep('filter');
    } else if (currentStep === 'filter') {
      setCurrentStep('create');
    }
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(e.target.value));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl overflow-hidden max-h-[calc(100vh-40px)] max-w-4xl w-full">
        {/* Header */}
        <div className="border-b flex items-center justify-between p-4">
          <button
            onClick={currentStep === 'select' ? onClose : handleBack}
            className="hover:opacity-70 transition-opacity"
            aria-label={currentStep === 'select' ? 'Close' : 'Back'}
          >
            {currentStep === 'select' ? (
              <X className="w-6 h-6" />
            ) : (
              <ChevronLeft className="w-6 h-6" />
            )}
          </button>
          <h1 className="font-semibold text-base">
            {currentStep === 'select'
              ? 'Create new post'
              : currentStep === 'crop'
              ? 'Crop'
              : currentStep === 'filter'
              ? 'Edit'
              : 'Create new post'}
          </h1>
          {currentStep === 'create' ? (
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="text-blue-500 font-semibold disabled:opacity-50 hover:text-blue-600 transition-colors"
            >
              Share
            </button>
          ) : (
            <button
              onClick={handleNext}
              className={`text-blue-500 font-semibold hover:text-blue-600 transition-colors ${
                currentStep === 'select' ? 'invisible' : ''
              }`}
            >
              Next
            </button>
          )}
        </div>

        <div className="flex">
          {/* Left side - Image preview/upload */}
          <div className="w-[700px] aspect-square bg-black flex items-center justify-center">
            {currentStep === 'select' ? (
              <div
                {...getRootProps()}
                className="text-center p-8 cursor-pointer"
              >
                <input {...getInputProps()} />
                <ImageIcon className="w-24 h-24 mx-auto mb-4 text-white" />
                {isDragActive ? (
                  <p className="text-xl text-white font-semibold">
                    Drop the files here
                  </p>
                ) : (
                  <>
                    <h3 className="text-xl text-white font-semibold mb-2">
                      Drag photos and videos here
                    </h3>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Select from computer
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="relative w-full h-full">
                <Image
                  ref={imageRef}
                  src={URL.createObjectURL(files[currentImageIndex])}
                  alt="Preview"
                  fill
                  className={`object-contain transition-transform ${filter} ${
                    aspectRatio === 'square' ? 'object-cover' : ''
                  }`}
                  style={{ transform: `scale(${zoom})` }}
                />
                {files.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                    {files.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          index === currentImageIndex
                            ? 'bg-blue-500'
                            : 'bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - Controls */}
          {currentStep === 'crop' ? (
            <div className="w-[350px] p-4 space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() =>
                      setAspectRatio(
                        aspectRatio === 'square' ? 'original' : 'square'
                      )
                    }
                    className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
                  >
                    {aspectRatio === 'square' ? (
                      <>
                        <Maximize2 className="w-5 h-5" />
                        Original
                      </>
                    ) : (
                      <>
                        <Crop className="w-5 h-5" />
                        Square
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-2">
                  <label htmlFor="zoom" className="text-sm font-medium">
                    Zoom
                  </label>
                  <input
                    type="range"
                    id="zoom"
                    min="1"
                    max="2"
                    step="0.1"
                    value={zoom}
                    onChange={handleZoomChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ) : currentStep === 'filter' ? (
            <div className="w-[350px] overflow-y-auto">
              <div className="grid grid-cols-3 gap-2 p-4">
                {filters.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setFilter(f.class)}
                    className={`aspect-square relative rounded overflow-hidden ${
                      filter === f.class ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <Image
                      src={URL.createObjectURL(files[currentImageIndex])}
                      alt={f.name}
                      fill
                      className={`object-cover ${f.class}`}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 p-2">
                      <span className="text-white text-sm">{f.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : currentStep === 'create' ? (
            <div className="w-[350px] p-4">
              <div className="space-y-4">
                <textarea
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full h-24 resize-none border rounded-lg p-3 focus:outline-none focus:border-gray-400"
                  maxLength={2200}
                />
                <div className="flex items-center gap-2 border rounded-lg p-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Add location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 focus:outline-none"
                  />
                </div>
                <button className="flex items-center justify-between w-full p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <span>Tag people</span>
                  <Users className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
