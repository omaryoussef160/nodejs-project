# Blog API

A production-ready REST API for a social blogging platform. It supports authentication, user roles, posts with image uploads, comments, likes, and group collaboration.

## Features

- JWT authentication with secure password hashing
- Role-based access control for users, admins, and super-admins
- Post creation, updates, deletion, likes, and pagination
- Image uploads through ImageKit
- Nested comments on posts
- Groups with members, admins, and posting permissions
- Request validation with Joi
- Centralized error handling, rate limiting, Helmet, and CORS
- MongoDB Atlas persistence and Vercel serverless deployment

## Tech Stack

- Node.js and Express
- MongoDB and Mongoose
- JSON Web Tokens (JWT)
- Joi
- Multer and ImageKit
- Vercel

## Live API

`GET /` returns:

```json
{
  "status": "success",
  "message": "Blog API is running"
}
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/omaryoussef160/nodejs-project.git
cd nodejs-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create an environment file

Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d

IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

AUTH_RATE_LIMIT_MAX=30
API_RATE_LIMIT_MAX=500
```

> Never commit `.env` or expose database credentials and private API keys.

### 4. Run locally

```bash
npm run dev
```

The API runs at `http://localhost:3000`.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Log in and receive a JWT |

### Users

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/users/me` | Get the authenticated user |
| GET | `/users` | List users (admin or super-admin) |
| POST | `/users` | Create a user (admin or super-admin) |
| GET | `/users/:id` | Get a user by ID |
| PATCH | `/users/:id` | Update a user |
| DELETE | `/users/:id` | Delete a user |

### Posts and comments

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/posts` | Get paginated posts |
| GET | `/posts/me` | Get the authenticated user's posts |
| GET | `/posts/user/:userId` | Get a user's posts |
| POST | `/posts` | Create a post with up to 10 images |
| GET | `/posts/:id` | Get one post |
| PATCH | `/posts/:id` | Update a post |
| DELETE | `/posts/:id` | Delete a post |
| POST | `/posts/:id/like` | Like or unlike a post |
| GET | `/posts/:postId/comments` | List post comments |
| POST | `/posts/:postId/comments` | Add a comment |
| DELETE | `/posts/:postId/comments/:commentId` | Delete a comment |

### Groups

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/groups` | List groups |
| POST | `/groups` | Create a group |
| GET | `/groups/:id` | Get a group |
| PATCH | `/groups/:id` | Update a group |
| DELETE | `/groups/:id` | Delete a group |
| POST | `/groups/:id/members` | Add a member |
| DELETE | `/groups/:id/members/:userId` | Remove a member |
| POST | `/groups/:id/admins` | Add a group admin |
| PATCH | `/groups/:id/permissions` | Update member posting permissions |

## Authentication

Protected endpoints require a Bearer token:

```http
Authorization: Bearer <your-jwt-token>
```

## Deployment

The project is configured for Vercel through `vercel.json`. Add all environment variables from the `.env` example in **Vercel → Settings → Environment Variables**, then deploy from the `main` branch.

## Project Structure

```text
api/            Vercel serverless entry point
config/         Database and ImageKit configuration
controllers/    Route logic
middleware/     Authentication, validation, uploads, and errors
models/         Mongoose data models
routes/         API route definitions
validations/    Joi schemas
utils/          Shared utilities
```

## Author

Omar Youssef
