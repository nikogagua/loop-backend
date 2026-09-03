# Loop — Backend

Loop is a Reddit-style posting app. Users can register, verify their email, create text/image posts, and manage their own content. This repo is the backend REST API.

**Live API:** https://loop-backend-mvpx.onrender.com
**Frontend repo:** [loop-frontend](link-to-that-repo)
**Live app:** https://loop-frontend-roan.vercel.app

## Features

- JWT authentication (register, login)
- Email verification (required before creating posts)
- Password reset via email
- Role-based access (user/admin)
- Posts: create, read, update, delete (with ownership checks)
- Image upload via Cloudinary (create/replace/remove)
- Pagination on the posts feed

## Tech Stack

- **Runtime/Framework:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Auth:** JWT, bcrypt
- **File uploads:** Multer + Cloudinary
- **Email:** Resend
- **Hosting:** Render

## Getting Started

1. Clone the repo
2. `npm install`
3. Create a `.env` file with the following variables:

PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
BACKEND_URL=http://localhost:3000

4. `npm run dev`

## API Endpoints

### Auth — `/api/auth`

| Method | Route                    | Description                    | Auth required |
| ------ | ------------------------ | ------------------------------ | ------------- |
| POST   | `/register`              | Create a new account           | No            |
| POST   | `/login`                 | Log in                         | No            |
| GET    | `/me`                    | Get current user info          | Yes           |
| GET    | `/verify-email/:token`   | Verify email via emailed link  | No            |
| POST   | `/resend-verification`   | Resend verification email      | Yes           |
| POST   | `/forgot-password`       | Request a password reset email | No            |
| POST   | `/reset-password/:token` | Set a new password             | No            |

### Posts — `/api/post`

| Method | Route          | Description                    | Auth required                 |
| ------ | -------------- | ------------------------------ | ----------------------------- |
| GET    | `/`            | Get all posts (paginated)      | No                            |
| GET    | `/:id`         | Get a single post              | No                            |
| GET    | `/my-posts`    | Get the logged-in user's posts | Yes                           |
| POST   | `/create-post` | Create a post                  | Yes (verified email required) |
| PUT    | `/:id`         | Update your own post           | Yes (owner)                   |
| DELETE | `/:id`         | Delete a post                  | Yes (owner or admin)          |

## What I Learned

Building Loop's backend taught me JWT authentication end-to-end (signing, verifying, and the tradeoffs vs. sessions), how to design a REST API with proper permission checks, handling file uploads and cloud storage with Multer/Cloudinary, sending transactional email, and deploying a Node app to production — including debugging real-world issues like case-sensitive filesystems on Linux hosts and MongoDB Atlas network access.
