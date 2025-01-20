"use server";

import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return;

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) return existingUser;

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`, // both first name and last name
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0], // if username is null then use email address split by @ and take the first part as username
        email: user.emailAddresses[0].emailAddress, // because emailAddresses is an array so we take the first one
        image: user.imageUrl,
      },
    });
    return dbUser;
  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId: clerkId,
    },
    include: {
      // means we want to include the followers, following and posts
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}
