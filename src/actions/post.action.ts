"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, imageUrl: string) {
  try {
    const userId = await getDbUserId();
    const post = await prisma.post.create({
      data: {
        content,
        image: imageUrl,
        authorId: userId,
      },
    });

    revalidatePath("/"); // means once post is created it will revalidate the home page and show the new post
    return { success: true, post };
  } catch (error) {
    console.log("Failed to create post ", error);
    return { success: false, error: "Failed to create post" };
  }
}
