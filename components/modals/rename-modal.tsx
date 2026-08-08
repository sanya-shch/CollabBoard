"use client";

import { FormEventHandler, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogClose,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRenameModal } from "@/store/use-rename-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateBoardTitle } from "@/actions/board";

export const RenameModal = () => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const { isOpen, onClose, initialValues } = useRenameModal();

  const [title, setTitle] = useState(initialValues.title);

  useEffect(() => {
    if (initialValues?.title) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(initialValues.title);
    }
  }, [initialValues?.title]);

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateBoardTitle(initialValues.id, title);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Board renamed");
      onClose();

      router.refresh();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit board title</DialogTitle>
        </DialogHeader>

        <DialogDescription>Enter a new title for this board</DialogDescription>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            disabled={pending}
            required
            maxLength={60}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Board title"
          />

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />

            <Button disabled={pending} type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
