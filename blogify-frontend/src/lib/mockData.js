
export const dashboardStats = {
  totalLikes: 1250,
  totalComments: 342,
  totalDrafts: 5,
};

export const engagementData = [
  { name: 'Mon', likes: 40, views: 240 },
  { name: 'Tue', likes: 30, views: 139 },
  { name: 'Wed', likes: 20, views: 980 },
  { name: 'Thu', likes: 27, views: 390 },
  { name: 'Fri', likes: 18, views: 480 },
  { name: 'Sat', likes: 23, views: 380 },
  { name: 'Sun', likes: 34, views: 430 },
];

export const categoryData = [
  { name: 'Tech', value: 400 },
  { name: 'Lifestyle', value: 300 },
  { name: 'Travel', value: 300 },
  { name: 'Food', value: 200 },
];

export const mockBlogs = [
  {
    id: 1,
    title: "The Future of React 19",
    category: "Tech",
    tags: ["react", "javascript", "frontend"],
    publishedAt: "2023-10-24",
    status: "Published",
  },
  {
    id: 2,
    title: "Top 10 Hiking Trails",
    category: "Travel",
    tags: ["hiking", "nature", "adventure"],
    publishedAt: "2023-11-02",
    status: "Draft",
  },
  {
    id: 3,
    title: "Understanding Async/Await",
    category: "Tech",
    tags: ["javascript", "async", "promise"],
    publishedAt: "2023-11-15",
    status: "Published",
  },
  {
    id: 4,
    title: "Sourdough for Beginners",
    category: "Food",
    tags: ["baking", "sourdough", "bread"],
    publishedAt: "2023-11-20",
    status: "Published",
  },
  {
    id: 5,
    title: "Minimalist Living Guide",
    category: "Lifestyle",
    tags: ["minimalism", "life", "declutter"],
    publishedAt: "2023-12-01",
    status: "Draft",
  },
];

export const mockComments = [
  {
    id: 101,
    user: "Alice Cooper",
    content: "Great article! Really helped me understand the concepts.",
    postTitle: "The Future of React 19",
    status: "Approved",
    date: "2023-10-25",
  },
  {
    id: 102,
    user: "Bob Smith",
    content: "I disagree with point 3. Here is why...",
    postTitle: "The Future of React 19",
    status: "Pending",
    date: "2023-10-26",
  },
  {
    id: 103,
    user: "Charlie Brown",
    content: "Spam message click here",
    postTitle: "Top 10 Hiking Trails",
    status: "Rejected",
    date: "2023-11-05",
  },
  {
    id: 104,
    user: "Diana Prince",
    content: "Can you share the recipe?",
    postTitle: "Sourdough for Beginners",
    status: "Approved",
    date: "2023-11-21",
  },
  {
    id: 105,
    user: "Evan Wright",
    content: "First comment!",
    postTitle: "Understanding Async/Await",
    status: "Pending",
    date: "2023-11-16",
  },
];
