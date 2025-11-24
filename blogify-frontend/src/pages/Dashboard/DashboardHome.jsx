
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { ThumbsUp, MessageCircle, FileEdit } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { postService } from '../../services/postService';
import { commentService } from '../../services/commentService';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-foreground">{value}</h3>
    </div>
    <div className={cn("p-3 rounded-full bg-opacity-10", colorClass)}>
      <Icon className={cn("opacity-100")} size={24} />
    </div>
  </div>
);

export default function DashboardHome() {
  const { currentTheme } = useTheme();
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalComments: 0,
    totalDrafts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch counts in parallel
        const [draftsData, commentsData] = await Promise.all([
          postService.list({ status: 'draft', limit: 1 }),
          commentService.list({ limit: 1 })
        ]);

        setStats({
          totalLikes: 0, // Aggregation requires backend support
          totalComments: commentsData.total || 0,
          totalDrafts: draftsData.total || 0
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Placeholder chart data (empty for now as we don't have history API)
  const chartData = [
    { name: 'Mon', views: 0, likes: 0 },
    { name: 'Tue', views: 0, likes: 0 },
    { name: 'Wed', views: 0, likes: 0 },
    { name: 'Thu', views: 0, likes: 0 },
    { name: 'Fri', views: 0, likes: 0 },
    { name: 'Sat', views: 0, likes: 0 },
    { name: 'Sun', views: 0, likes: 0 },
  ];

  if (loading) return <div>Loading stats...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your blog.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Likes" 
          value={stats.totalLikes} 
          icon={ThumbsUp} 
          colorClass="bg-primary/10 text-primary" 
        />
        <StatCard 
          title="Total Comments" 
          value={stats.totalComments} 
          icon={MessageCircle} 
          colorClass="bg-secondary/10 text-secondary" 
        />
        <StatCard 
          title="Drafts" 
          value={stats.totalDrafts} 
          icon={FileEdit} 
          colorClass="bg-foreground/10 text-foreground" 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Engagement Chart */}
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-lg font-semibold mb-6 text-foreground">Weekly Engagement</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentTheme.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={currentTheme.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentTheme.secondary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={currentTheme.secondary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={currentTheme.tertiary} opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: currentTheme.tertiary, borderRadius: '8px', border: '1px solid ' + currentTheme.primary, color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#aaa' }}
                />
                <Area type="monotone" dataKey="views" stroke={currentTheme.primary} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="likes" stroke={currentTheme.secondary} fillOpacity={1} fill="url(#colorLikes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Bar Chart */}
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-lg font-semibold mb-6 text-foreground">Activity Breakdown</h3>
          <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={currentTheme.tertiary} opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                <Tooltip 
                   cursor={{fill: currentTheme.tertiary, opacity: 0.3}}
                   contentStyle={{ backgroundColor: currentTheme.tertiary, borderRadius: '8px', border: '1px solid ' + currentTheme.primary, color: '#fff' }}
                   itemStyle={{ color: '#fff' }}
                   labelStyle={{ color: '#aaa' }}
                />
                <Bar dataKey="views" fill={currentTheme.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
