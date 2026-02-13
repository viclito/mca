"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Loader2, Trash2, Edit, Shield, MoreVertical, Key } from "lucide-react";

function EditUserForm({ user, onSubmit, onCancel, isSuperAdmin, isPending }: { user: any, onSubmit: (e: React.FormEvent) => void, onCancel: () => void, isSuperAdmin: boolean, isPending: boolean }) {
    const [isApproved, setIsApproved] = useState(user.isApproved);
    const [isStudent, setIsStudent] = useState(user.isStudent);
    const [isEmailVerified, setIsEmailVerified] = useState(user.isEmailVerified);

    return (
        <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={user.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={user.email} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue={user.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin" disabled={!isSuperAdmin}>Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batch">Batch</Label>
                    <Input id="batch" name="batch" defaultValue={user.batch} placeholder="e.g., 2025-2027" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="degree">Degree</Label>
                    <Input id="degree" name="degree" defaultValue={user.degree} placeholder="e.g., MCA" />
                  </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Input id="college" name="college" defaultValue={user.college} placeholder="College Name" />
              </div>

              <div className="flex flex-col gap-3 border p-3 rounded-md">
                 <div className="flex items-center gap-2">
                    <Switch 
                        checked={isApproved} 
                        onCheckedChange={setIsApproved} 
                        id="isApproved" 
                    />
                    <input type="hidden" name="isApproved" value={isApproved ? "on" : "off"} />
                    <Label htmlFor="isApproved">Approved User</Label>
                 </div>
                 <div className="flex items-center gap-2">
                    <Switch 
                        checked={isStudent} 
                        onCheckedChange={setIsStudent} 
                        id="isStudent" 
                    />
                    <input type="hidden" name="isStudent" value={isStudent ? "on" : "off"} />
                    <Label htmlFor="isStudent">Is Student</Label>
                 </div>
                 <div className="flex items-center gap-2">
                    <Switch 
                        checked={isEmailVerified} 
                        onCheckedChange={setIsEmailVerified} 
                        id="isEmailVerified" 
                    />
                    <input type="hidden" name="isEmailVerified" value={isEmailVerified ? "on" : "off"} />
                    <Label htmlFor="isEmailVerified">Email Verified</Label>
                 </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
        </form>
    );
}

export default function UsersPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<any>(null);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  
  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to update user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      alert("User updated successfully");
    },
    onError: (err: any) => alert(err.message),
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
           const err = await res.json();
           throw new Error(err.message || "Failed to delete user");
      }
      return res.json();
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        alert("User deleted successfully");
    },
    onError: (err: any) => alert(err.message),
  });

  // Grant Permission Mutation
  const grantPermission = useMutation({
      mutationFn: async (data: any) => {
          const res = await fetch("/api/admin/users/permissions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error("Failed to grant permissions");
          return res.json();
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          setPermissionModalOpen(false);
          alert("Permissions granted successfully");
      },
      onError: () => alert("Failed to grant permissions"),
  });

  const isSuperAdmin = session?.user?.role === "super_admin";
  const permissions = (session?.user as any)?.tempPermissions;

  const canEdit = isSuperAdmin || (permissions?.canEdit && new Date(permissions.expiresAt) > new Date());
  const canDelete = isSuperAdmin || (permissions?.canDelete && new Date(permissions.expiresAt) > new Date());

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    updateUser.mutate({
      id: editingUser._id,
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      isApproved: formData.get("isApproved") === "on",
      isStudent: formData.get("isStudent") === "on",
      isEmailVerified: formData.get("isEmailVerified") === "on",
      batch: formData.get("batch"),
      degree: formData.get("degree"),
      college: formData.get("college"),
    });
  };
  
  const handlePermissionSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      grantPermission.mutate({
          userId: selectedAdmin._id,
          canEdit: formData.get("canEdit") === "on",
          canDelete: formData.get("canDelete") === "on",
          durationHours: Number(formData.get("durationHours")),
      });
  }

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">Manage students, admins, and permissions.</p>
        
        {permissions && (
             <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 flex items-center gap-2">
                 <Key className="h-4 w-4" />
                 <span>
                     You have temporary permissions:
                     {permissions.canEdit && <span className="font-bold ml-1">Edit</span>}
                     {permissions.canDelete && <span className="font-bold ml-1">Delete</span>}
                     <span className="ml-1 text-xs opacity-80">(Expires: {format(new Date(permissions.expiresAt), "PP p")})</span>
                 </span>
             </div>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user: any) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "super_admin" ? "default" : user.role === "admin" ? "secondary" : "outline"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                      {user.isApproved ? (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Approved</Badge>
                      ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Pending</Badge>
                      )}
                  </TableCell>
                  <TableCell>
                      {user.tempPermissions && new Date(user.tempPermissions.expiresAt) > new Date() && (
                          <div className="flex flex-col text-xs text-muted-foreground">
                              {user.tempPermissions.canEdit && <span>Can Edit</span>}
                              {user.tempPermissions.canDelete && <span>Can Delete</span>}
                              <span className="text-[10px]">Exp: {format(new Date(user.tempPermissions.expiresAt), "p")}</span>
                          </div>
                      )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        {/* Super Admin Actions */}
                        {isSuperAdmin && user.role === 'admin' && (
                             <Button variant="ghost" size="icon" onClick={() => { setSelectedAdmin(user); setPermissionModalOpen(true); }} title="Grant Permissions">
                                <Key className="h-4 w-4 text-blue-500" />
                            </Button>
                        )}
                        
                        {(canEdit && user.role !== 'super_admin') && (
                            <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        )}
                        
                        {(canDelete && user.role !== 'super_admin') && (
                             <Button variant="ghost" size="icon" onClick={() => {
                                 if(confirm("Are you sure you want to delete this user?")) deleteUser.mutate(user._id);
                             }}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Modify user details and role.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <EditUserForm 
                user={editingUser} 
                onSubmit={handleEditSubmit} 
                onCancel={() => setEditingUser(null)} 
                isSuperAdmin={isSuperAdmin}
                isPending={updateUser.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions Modal */}
      <Dialog open={permissionModalOpen} onOpenChange={setPermissionModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Grant Temporary Permissions</DialogTitle>
                <DialogDescription>Allow {selectedAdmin?.name} to perform restricted actions.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePermissionSubmit} className="space-y-4">
                <div className="space-y-4 border p-4 rounded-md">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="canEdit">Allow Edit Users</Label>
                        <Switch id="canEdit" name="canEdit" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="canDelete">Allow Delete Users</Label>
                        <Switch id="canDelete" name="canDelete" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="durationHours">Duration (Hours)</Label>
                    <Input type="number" id="durationHours" name="durationHours" defaultValue="1" min="1" max="24" required />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setPermissionModalOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={grantPermission.isPending}>
                        {grantPermission.isPending ? "Granting..." : "Grant Permissions"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
