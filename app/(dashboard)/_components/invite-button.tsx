"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { inviteMemberByEmail } from "@/actions/invite";
import { getOrganizationMembers, removeMember, changeMemberRole } from "@/actions/organization";

interface Member {
  userId: string;
  role: "ADMIN" | "MEMBER";
  user: { name: string; email: string };
}

interface InviteButtonProps {
  organizationId: string;
}

export const InviteButton = ({ organizationId }: InviteButtonProps) => {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadMembers = () => {
    startTransition(async () => {
      const data = await getOrganizationMembers(organizationId);
      setMembers(data);
    });
  };

  useEffect(() => {
    if (open) loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleInvite = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await inviteMemberByEmail({ organizationId, email, role });
      if ("error" in result) setMessage({ type: "error", text: result.error! });
      if ("success" in result) {
        setMessage({ type: "success", text: result.success! });
        setEmail("");
      }
    });
  };

  const handleRemove = (userId: string) => {
    startTransition(async () => {
      const result = await removeMember(organizationId, userId);

      if (result?.error) setMessage({ type: "error", text: result.error });
      else loadMembers();
    });
  };

  const handleRoleChange = (userId: string, newRole: "ADMIN" | "MEMBER") => {
    startTransition(async () => {
      const result = await changeMemberRole(organizationId, userId, newRole);

      if ("error" in result) setMessage({ type: "error", text: result.error });
      else loadMembers();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="cursor-pointer">
            Team members
          </Button>
        }
      />

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Team members</DialogTitle>
        </DialogHeader>

        <div className="flex gap-x-2">
          <Input
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />

          <Select value={role} onValueChange={(v) => setRole(v as "ADMIN" | "MEMBER")}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleInvite} disabled={isPending || !email}>
            Invite
          </Button>
        </div>

        {message && (
          <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
            {message.text}
          </p>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {members.map((m) => (
            <div key={m.userId} className="flex items-center justify-between text-sm">
              <div className="truncate">
                <div className="font-medium truncate">{m.user.name}</div>
                <div className="text-muted-foreground truncate">{m.user.email}</div>
              </div>

              <div className="flex items-center gap-x-2 shrink-0">
                <Select
                  value={m.role}
                  onValueChange={(v) => handleRoleChange(m.userId, v as "ADMIN" | "MEMBER")}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => handleRemove(m.userId)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
