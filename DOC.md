# Project Documentation

## Frontend (`blogify-frontend/src`)

### Root
- **`App.jsx`**  
  - `GooeyFilter` – Defines global SVG filter for gooey UI effects.  
  - `PublicLayout` – Public layout wrapper with `Navbar`, `Footer`, and `Outlet` content area.  
  - `App` (default export) – Configures routes, theme, and auth provider for the SPA.
- **`main.jsx`**  
  - Bootstraps React app and mounts `App` into the DOM, sets up `BrowserRouter` and top-level providers (per Vite/React entry pattern).
- **`index.css`**  
  - Global styles and Tailwind utility layers used throughout the app.

### `components/`
- **`Navbar.jsx`**  
  - `Navbar` – Top navigation bar, handles navigation links and user auth state display.
- **`Footer.jsx`**  
  - `Footer` – Application footer with basic site info/links.
- **`ProtectedRoute.jsx`**  
  - `ProtectedRoute` – Route guard that checks auth context and redirects unauthenticated users.
- **`ThemePreview.jsx`**  
  - `ThemePreview` – Renders a preview of a selected theme (colors/fonts) for the blog UI.

#### `components/ui/`
- **`Button.jsx`**  
  - `Button` – Reusable button component with consistent styling and variants.  
- **`GlassCard.jsx`**  
  - `GlassCard` – Glassmorphism-styled card container used in multiple pages.

### `context/`
- **`AuthContext.jsx`**  
  - `AuthProvider` – Context provider managing authentication state, user, and token.  
  - `useAuth` – Hook to access auth state and actions like login/logout.
- **`BlogDataContext.jsx`**  
  - `BlogDataProvider` – Context provider for shared blog-related data (posts, filters, etc.).  
  - `useBlogData` – Hook to access blog data and refresh helpers.
- **`ThemeContext.jsx`**  
  - `ThemeProvider` – Supplies current theme (colors, font) across the app.  
  - `useTheme` – Hook to get/set theme and expose theme configuration.

### `lib/`
- **`blogsData.js`**  
  - Exposes static/blog data helpers (e.g., sample/seed blog entries for UI usage).
- **`mockData.js`**  
  - Contains mock data structures for local/testing usage only (not used in prod APIs).  
- **`utils.js`**  
  - `hexToRgba` – Converts hex color to RGBA string with alpha.  
  - `cn` – Conditional class name utility (Tailwind-friendly).  
  - Other small helpers for formatting and general utilities.

### `pages/`
- **`Landing.jsx`**  
  - `Landing` – Public landing page: hero, search, category selector, blog grid, newsletter, and modals.
- **`Profile.jsx`**  
  - `Profile` – Authenticated user profile/settings page, uses `ProtectedRoute`.
- **`BlogDetails.jsx`**  
  - `BlogDetails` – Displays a single blog post by slug, including comments and metadata.
- **`Auth.jsx`**  
  - `Auth` – Sign-in/sign-up UI that integrates with backend auth APIs.
- **`ForgotPassword.jsx`**  
  - `ForgotPassword` – Sends password reset email using backend auth endpoints.
- **`ResetPassword.jsx`**  
  - `ResetPassword` – Handles password reset form using token link.
- **`NotFound.jsx`**  
  - `NotFound` – 404 page for unmatched routes.

#### `pages/Dashboard/`
- **`DashboardLayout.jsx`**  
  - `DashboardLayout` – Shell layout (sidebar/topbar) wrapping nested dashboard routes.
- **`DashboardHome.jsx`**  
  - `DashboardHome` – Dashboard overview (stats, recent posts, etc.).
- **`WriteBlog.jsx`**  
  - `VideoNode` – Custom Tiptap node for embedding videos in the editor.  
  - `AudioNode` – Custom Tiptap node for embedding audio in the editor.  
  - `EditorToolbar` – Memoized toolbar for formatting, lists, quotes, media uploads, undo/redo.  
  - `WriteBlog` (default export) – Rich text blog editor with media upload, category/tag management, scheduling, and publish/draft handling.
- **`ViewBlogs.jsx`**  
  - `ViewBlogs` – Lists blogs authored by the user with actions like edit, delete, publish/unpublish.
- **`Comments.jsx`**  
  - `Comments` – Dashboard page for moderating comments (approve/delete, view per post).
- **`Tags.jsx`**  
  - `Tags` – Tag management: create, edit, delete tags and show usage counts.
- **`Categories.jsx`**  
  - `Categories` – Category management: add/update/remove categories and use in posts.

### `services/`
- **`authService.js`**  
  - `API_BASE_URL` – Base URL for API endpoints used by all services.  
  - `login(credentials)` – Calls backend `/api/auth/login` to authenticate user.  
  - `register(data)` – Calls backend `/api/auth/register` to create new user.  
  - `logout()` – Clears auth cookie/token on the backend.  
  - `getCurrentUser()` – Fetches current user details using stored token/cookie.  
  - `forgotPassword(email)` – Triggers `/api/auth/forgot-password` email flow.  
  - `resetPassword(token, data)` – Submits new password to `/api/auth/reset-password/:token`.  

- **`postService.js`**  
  - `getAll(params)` – Fetches paginated list of posts from `/api/posts`.  
  - `getById(id)` – Fetches single post by ID.  
  - `getBySlug(slug)` – Fetches single post by slug.  
  - `create(data)` – Creates a new post.  
  - `update(id, data)` – Updates an existing post.  
  - `remove(id)` – Deletes a post.  
  - `publish(id)` / `unpublish(id)` – Toggles post publication state.  
  - `schedule(id, payload)` – Schedules a post for future publishing.  
  - `getScheduled()` – Returns all scheduled posts.  
  - `addMultimedia(id, file)` / `removeMultimedia(id, mid)` – Manage multimedia assets on a post.  
  - `updateTags(id, tags)` – Updates tag list for a post.  
  - `updateCategories(id, categoryIds)` – Updates categories for a post.  
  - `updateSeo(id, seoPayload)` / `getSeoPreview(id)` – Manages SEO metadata for a post.  
  - `viewStat(id)` – Sends a view stat event for analytics.  
  - `uploadMedia(file, type)` – Upload helper used by `WriteBlog` for editor media.

- **`categoryService.js`**  
  - `getAll()` – Fetches all categories.  
  - `getSelectList()` – Fetches lightweight list for dropdowns (id/name).  
  - `create(data)` / `update(id, data)` / `remove(id)` – CRUD for categories.

- **`tagService.js`**  
  - `getAll()` – Fetches all tags.  
  - `getSelectList()` – Returns tags as simple list for selectors.  
  - `create(data)` / `update(id, data)` / `remove(id)` – CRUD for tags.

- **`commentService.js`**  
  - `getByPost(postId)` – Fetches comments for a specific post.  
  - `create(postId, data)` – Adds a new comment on a post.  
  - `update(commentId, data)` – Updates a comment.  
  - `remove(commentId)` – Deletes a comment.  
  - `moderate(commentId, payload)` – Approve/reject comment via moderation API.

- **`fontService.js`**  
  - `getFonts()` – Fetches available fonts/theme options from backend settings.  
  - `updateFont(userId, font)` – Updates font preference in blog settings.

- **`tagService.js`**  
  - See above under tags management.

---

## Backend (`backend/src`)

### Root
- **`app.js`**  
  - Creates and configures Express app: CORS, JSON parsing, cookies, Passport.  
  - Serves `/uploads` statically and mounts Swagger UI at `/api-docs`.  
  - Registers API routes:  
    - `/api/auth` → `auth.routes.js`  
    - `/api/users` & `/api/v1/users` → `user.routes.js`  
    - `/api/posts` → `post.routes.js`  
    - `/api/categories` → `category.routes.js`  
    - `/api/tags` → `tag.routes.js`  
    - `/api` → `comment.routes.js`, `dailyMetric.routes.js`  
    - `/api/v1/settings` → `blogSettings.routes.js`  
    - `/api/upload` → `upload.routes.js`  
  - Adds `/health` status endpoint.  
  - Global 404 and error handlers plus `errorLogger` middleware.  
  - `startServer` – Connects to MongoDB and starts HTTP server.

### `config/`
- **`env.js`**  
  - Loads environment variables (PORT, MONGO_URI, JWT secrets, etc.).
- **`db.js`**  
  - `connectDB` – Connects Mongoose to MongoDB and handles connection logging/errors.
- **`passport.js`**  
  - Configures Passport JWT strategy using user model, extracts token from cookies/headers.

### `middleware/`
- **`auth.js`**  
  - `authenticateJwt` – Protects routes by verifying JWT and attaching user to `req`.  
  - `authenticateOptional` – Optionally parses JWT if present, allows anonymous access.  
- **`role.js`**  
  - `requireRole(roles)` – Middleware to enforce role-based access control.  
- **`errorLogger.js`**  
  - Logs errors (message/stack/request info) for later analysis.  
- **`upload.middleware.js`**  
  - Configures Multer or similar for handling file uploads; exposes `upload` middleware.

### `models/` (Mongoose Schemas)
- **`user.model.js`**  
  - `UserSchema` – Fields: name, email, password hash, roles, avatar, timestamps, etc.  
  - Adds methods for password hashing/verification and serialization.  
- **`post.model.js`**  
  - `PostSchema` – Fields: title, slug, content, headerImage, author, `categoryIds`, `tagIds`, status, `publishedAt`, `scheduledAt`, SEO fields, multimedia, view/like counts, timestamps.
- **`category.model.js`**  
  - `CategorySchema` – Fields: name, slug, description, color/icon, and references to posts.
- **`tag.model.js`**  
  - `TagSchema` – Fields: name, slug, description, usage count, and references to posts.
- **`comment.model.js`**  
  - `CommentSchema` – Fields: post, author (user or guest info), content, status (pending/approved/rejected), timestamps.
- **`dailyMetric.model.js`**  
  - `DailyMetricSchema` – Fields: date, view count, like count, post count; aggregates for analytics.
- **`blogSettings.model.js`**  
  - `BlogSettingsSchema` – Fields: theme colors, fonts, SEO defaults, pagination, and feature flags per user/blog.  
- **`savedSearch.model.js`**  
  - `SavedSearchSchema` – Fields: user, query, filters, timestamps for saved search configurations.

### `repositories/` (Data Access Layer)
- **`user.repository.js`**  
  - Functions like `createUser`, `findByEmail`, `findById`, `updateUser`, `deleteUser` – Encapsulate DB access for users.
- **`post.repository.js`**  
  - `listPosts(filters)` – Returns paginated/filterable post list.  
  - `getPostById(id)` / `getPostBySlug(slug)` – Fetch individual posts.  
  - `createPost(data)` / `updatePost(id, data)` / `deletePost(id)` – CRUD for posts.  
  - `updateTags`, `updateCategories`, `updateSeo`, `schedulePost`, `publishPost`, etc.  
- **`category.repository.js`**  
  - CRUD and lookup helpers for categories.
- **`tag.repository.js`**  
  - CRUD and lookup helpers for tags, including usage counts.
- **`comment.repository.js`**  
  - CRUD and query helpers for comments per post/user and moderation changes.
- **`dailyMetric.repository.js`**  
  - Record and aggregate daily metrics for dashboards.
- **`blogSettings.repository.js`**  
  - Read/update blog settings per user/blog (theme, pagination, SEO defaults).  
- **`savedSearch.repository.js`**  
  - Persist and read saved searches associated with a user.

### `controllers/` (Business Logic)
- **`auth.controller.js`**  
  - `register` – Validates payload, creates user, and returns auth token.  
  - `login` – Verifies credentials and issues JWT/cookie.  
  - `logout` – Clears auth cookie/token.  
  - `refreshToken` – Issues new access token from refresh token.  
  - `forgotPassword` – Generates reset token and sends email.  
  - `resetPassword` – Validates token and updates password.  

- **`user.controller.js`**  
  - `getProfile` – Returns current authenticated user profile.  
  - `updateProfile` – Updates profile fields.  
  - `listUsers` – Admin listing of users.  
  - `getUserById` / `deleteUser` – Admin user management endpoints.

- **`post.controller.js`**  
  - `list` – Handles `/api/posts` GET with filters, search, and pagination.  
  - `getById` – Returns a post by ID.  
  - `getBySlug` – Returns a post by slug.  
  - `search` – Advanced search endpoint for posts.  
  - `create` – Validates and creates new post.  
  - `update` – Updates existing post fields.  
  - `remove` – Deletes a post.  
  - `publish` / `unpublish` – Toggle publication state.  
  - `schedule` – Schedule post for future publish.  
  - `getScheduled` – Fetches scheduled posts.  
  - `addMultimedia` / `removeMultimedia` – Manage media attachments.  
  - `updateTags` / `updateCategories` – Update taxonomy for a post.  
  - `updateSeo` / `getSeoPreview` – Manage and preview SEO metadata.  
  - `viewStat` – Increments or records view stats for analytics.

- **`category.controller.js`**  
  - `list` – Returns all categories.  
  - `create` / `update` / `remove` – CRUD operations for categories.  
  - `getSelectList` – Returns simplified list for UI dropdowns.

- **`tag.controller.js`**  
  - `list` – Returns all tags.  
  - `create` / `update` / `remove` – CRUD operations for tags.  
  - `getSelectList` – Simplified list for tag selectors.

- **`comment.controller.js`**  
  - `listByPost` – Lists comments for a particular post.  
  - `create` – Adds a comment.  
  - `update` – Updates a comment.  
  - `remove` – Deletes a comment.  
  - `moderate` – Approves/rejects comments.

- **`dailyMetric.controller.js`**  
  - `recordView` – Records daily view metrics.  
  - `getMetrics` – Returns metrics for dashboards/analytics.

- **`blogSettings.controller.js`**  
  - `getSettings` – Fetches blog/user settings.  
  - `updateSettings` – Updates settings (theme, font, SEO defaults, etc.).

- **`upload.controller.js`**  
  - `uploadSingle` – Handles single file upload and returns public URL/path.  
  - `uploadMultiple` – Handles multi-file uploads.

### `routes/` (API Surface)
- **`auth.routes.js`**  
  - `POST /api/auth/register` → `authController.register`  
  - `POST /api/auth/login` → `authController.login`  
  - `POST /api/auth/logout` → `authController.logout`  
  - `POST /api/auth/refresh` → `authController.refreshToken`  
  - `POST /api/auth/forgot-password` → `authController.forgotPassword`  
  - `POST /api/auth/reset-password/:token` → `authController.resetPassword`

- **`user.routes.js`**  
  - `GET /api/users/me` → `userController.getProfile`  
  - `PUT /api/users/me` → `userController.updateProfile`  
  - `GET /api/users` → `userController.listUsers` (admin)  
  - `GET /api/users/:id` → `userController.getUserById` (admin)  
  - `DELETE /api/users/:id` → `userController.deleteUser` (admin)

- **`post.routes.js`**  
  - `GET /api/posts` → `postController.list`  
  - `GET /api/posts/search` → `postController.search`  
  - `GET /api/posts/slug/:slug` → `postController.getBySlug`  
  - `GET /api/posts/:id` → `postController.getById`  
  - `POST /api/posts/:id/stat/view` → `postController.viewStat`  
  - `POST /api/posts/:id/like` → `postController.likePost`  
  - `POST /api/posts` → `postController.create`  
  - `PUT /api/posts/:id` / `PATCH /api/posts/:id` → `postController.update`  
  - `DELETE /api/posts/:id` → `postController.remove`  
  - `POST /api/posts/:id/publish` → `postController.publish`  
  - `POST /api/posts/:id/unpublish` → `postController.unpublish`  
  - `POST /api/posts/:id/schedule` → `postController.schedule`  
  - `GET /api/posts/scheduled/all` → `postController.getScheduled`  
  - `POST /api/posts/:id/multimedia` → `postController.addMultimedia`  
  - `DELETE /api/posts/:id/multimedia/:mid` → `postController.removeMultimedia`  
  - `POST /api/posts/:id/tags` → `postController.updateTags`  
  - `PUT /api/posts/:id/categories` → `postController.updateCategories`  
  - `POST /api/posts/:id/seo` → `postController.updateSeo`  
  - `GET /api/posts/:id/preview` → `postController.getSeoPreview`

- **`category.routes.js`**  
  - `GET /api/categories` → `categoryController.list`  
  - `POST /api/categories` → `categoryController.create`  
  - `PUT /api/categories/:id` → `categoryController.update`  
  - `DELETE /api/categories/:id` → `categoryController.remove`  
  - `GET /api/categories/select` (or similar) → `categoryController.getSelectList`.

- **`tag.routes.js`**  
  - `GET /api/tags` → `tagController.list`  
  - `POST /api/tags` → `tagController.create`  
  - `PUT /api/tags/:id` → `tagController.update`  
  - `DELETE /api/tags/:id` → `tagController.remove`  
  - `GET /api/tags/select` → `tagController.getSelectList`.

- **`comment.routes.js`**  
  - `GET /api/posts/:postId/comments` → `commentController.listByPost`  
  - `POST /api/posts/:postId/comments` → `commentController.create`  
  - `PUT /api/comments/:id` → `commentController.update`  
  - `DELETE /api/comments/:id` → `commentController.remove`  
  - `POST /api/comments/:id/moderate` → `commentController.moderate`.

- **`dailyMetric.routes.js`**  
  - `POST /api/metrics/views` → `dailyMetricController.recordView`  
  - `GET /api/metrics` → `dailyMetricController.getMetrics`.

- **`blogSettings.routes.js`**  
  - `GET /api/v1/settings` → `blogSettingsController.getSettings`  
  - `PUT /api/v1/settings` → `blogSettingsController.updateSettings`.

- **`upload.routes.js`**  
  - `POST /api/upload` or similar → `uploadController.uploadSingle` using `upload` middleware.  
  - Possibly `POST /api/upload/multiple` → `uploadController.uploadMultiple`.

---

This document summarizes the folder structure, main files, key functions/components, API endpoints, and schema responsibilities for both frontend and backend. Update this file whenever new modules or endpoints are added.
