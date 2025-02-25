# Instagram Clone

A modern Instagram clone built with Next.js 14, featuring AI-powered image analysis and social interactions.

## Features

- User authentication and profiles
- Photo sharing and filtering
- Like and comment functionality
- User following system
- Feed with infinite scroll
- Stories feature
- Direct messaging
- Explore page
- AI-powered image content analysis
- Responsive design (mobile-first)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun
- A modern web browser
- MongoDB database
- Cloudinary account (for image storage)

### Environment Setup

Create a `.env` file in the root directory and add your environment variables:

```env
# Authentication
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Database
MONGODB_URI=your_mongodb_uri

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Services
OPENAI_API_KEY=your_api_key_here
```

## Technologies Used

- [Next.js 14](https://nextjs.org) - React framework with App Router
- React Server Components
- TypeScript
- Tailwind CSS
- MongoDB
- NextAuth.js
- Cloudinary
- OpenAI API
- [Geist](https://vercel.com/font) font family

## Key Features Explained

### Authentication

- Secure sign up and login
- Social authentication options
- Password reset functionality

### Image Handling

- Upload and crop images
- Apply filters
- AI-powered content moderation
- Automatic tagging suggestions

### Social Features

- Follow/unfollow users
- Like and comment on posts
- Share posts in stories
- Direct messaging between users

### Feed

- Personalized feed algorithm
- Infinite scroll
- Story viewing
- Post interactions

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
