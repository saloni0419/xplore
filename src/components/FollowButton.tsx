"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/user.action";

function FollowButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoadig] = useState(false);

  const handleFollow = async () => {
    setIsLoadig(true);
    try {
      await toggleFollow(userId); // toggle becuase it user click follow button it will show unfollow button and vice versa
      toast.success("User followed successfully");
    } catch (error) {
      toast.error("Error following user");
    } finally {
      setIsLoadig(false);
    }
  };

  return (
    <Button
      size={"sm"}
      variant={"secondary"}
      onClick={handleFollow}
      disabled={isLoading}
      className="w-20"
    >
      {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : "Follow"}
      {/* if the button is loading then show the loader icon otherwise show the text "Follow" */}
    </Button>
  );
}

export default FollowButton;
