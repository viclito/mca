import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, FileVideo, Layers, LibraryBig, ArrowRight } from "lucide-react";
import { PendingAdmins } from "@/components/PendingAdmins";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import connectDB from "@/lib/db";
import Degree from "@/lib/models/Degree";
import Subject from "@/lib/models/Subject";
import Content from "@/lib/models/Content";
import Unit from "@/lib/models/Unit";
import Semester from "@/lib/models/Semester";
import User from "@/lib/models/User";

async function getStats() {
    try {
        await connectDB();
        
        const [degrees, subjects, content, admins] = await Promise.all([
            Degree.countDocuments(),
            Subject.countDocuments(),
            Content.countDocuments(),
            User.countDocuments({ role: { $in: ['admin', 'super_admin'] }, isApproved: true })
        ]);

        return {
            degrees,
            subjects,
            content,
            admins
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return {
            degrees: 0,
            subjects: 0,
            content: 0,
            admins: 0
        };
    }
}

async function getRecentActivity() {
    try {
        await connectDB();
        
        // Fetch recent items from each collection
        const [degrees, semesters, subjects, units, contents] = await Promise.all([
            Degree.find().sort({ createdAt: -1 }).limit(2).lean(),
            Semester.find().sort({ createdAt: -1 }).limit(2).lean(),
            Subject.find().sort({ createdAt: -1 }).limit(2).lean(),
            Unit.find().sort({ createdAt: -1 }).limit(2).lean(),
            Content.find().sort({ createdAt: -1 }).limit(2).lean(),
        ]);

        // Combine all activities
        const activities = [
            ...degrees.map(item => ({ type: 'Degree', name: item.name, createdAt: item.createdAt, href: '/admin/degrees' })),
            ...semesters.map(item => ({ type: 'Semester', name: item.name, createdAt: item.createdAt, href: '/admin/semesters' })),
            ...subjects.map(item => ({ type: 'Subject', name: item.name, createdAt: item.createdAt, href: '/admin/subjects' })),
            ...units.map(item => ({ type: 'Unit', name: item.name, createdAt: item.createdAt, href: '/admin/units' })),
            ...contents.map(item => ({ type: 'Content', name: item.title, createdAt: item.createdAt, href: '/admin/content' })),
        ];

        // Sort by creation date and take top 10
        return activities
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);
    } catch (error) {
        console.error("Error fetching recent activity:", error);
        return [];
    }
}

function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
}

export default async function AdminDashboardPage() {
  const [stats, recentActivity] = await Promise.all([
    getStats(),
    getRecentActivity()
  ]);

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="hidden md:block">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm md:text-base text-muted-foreground">Overview of your educational content and platform stats.</p>
      </div>

      {/* Pending Admin Approvals */}
      <PendingAdmins />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Degrees</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.degrees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Items</CardTitle>
            <FileVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.content}</div>
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent activity.</p>
                ) : (
                    <div className="space-y-3">
                        {recentActivity.map((activity, index) => {
                            const IconComponent = 
                                activity.type === 'Degree' ? GraduationCap :
                                activity.type === 'Semester' ? LibraryBig :
                                activity.type === 'Subject' ? BookOpen :
                                activity.type === 'Unit' ? Layers :
                                FileVideo;
                            
                            return (
                                <Link 
                                    key={index} 
                                    href={activity.href}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <IconComponent className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {activity.type}: {activity.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {getRelativeTime(activity.createdAt)}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
        <Card className="col-span-3">
             <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                 <Link href="/admin/degrees" className="block">
                    <Button variant="outline" className="w-full justify-start">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Add New Degree
                    </Button>
                 </Link>
                 <Link href="/admin/semesters" className="block">
                    <Button variant="outline" className="w-full justify-start">
                        <LibraryBig className="mr-2 h-4 w-4" />
                        Add New Semester
                    </Button>
                 </Link>
                 <Link href="/admin/subjects" className="block">
                    <Button variant="outline" className="w-full justify-start">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Add New Subject
                    </Button>
                 </Link>
                 <Link href="/admin/units" className="block">
                    <Button variant="outline" className="w-full justify-start">
                        <Layers className="mr-2 h-4 w-4" />
                        Add New Unit
                    </Button>
                 </Link>
                 <Link href="/admin/content" className="block">
                    <Button variant="outline" className="w-full justify-start">
                        <FileVideo className="mr-2 h-4 w-4" />
                        Add New Content
                    </Button>
                 </Link>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
