"use server";

import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

export async function getDbUserId() {
  const { userId: clerkId } = await auth(); // renamed userid to clearkid
  if (!clerkId) throw new Error("Unauthorized");

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();
    const randomUsers = await prisma.user.findMany({
      where: {
        // becuase we want two conditions to be true we dont want my id to show and thosw who i follow
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: {
                  // if there is some follower
                  followerId: userId, // if the follower id is equal to my id then dont show
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 5, // we want only 5 users
    });
    return randomUsers;
  } catch (error) {
    console.log("Error getting random users", error);
    return [];
  }
}

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();

    // check if i am trying to follow myself
    if (userId == targetUserId) throw new Error("You cannot follow yourself");
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          // composite key of followerId and followingId so that we can check if the user is already following the target user
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    // if the user is already following the target user then we want to unfollow
    if (existingFollow) {
      // unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // follow
      await prisma.$transaction([
        // we want to do two things at the same time so we use transaction to make sure both are
        // two things are user following the target user and increment the followers count of the target user by 1 and also increment the following count of the user by 1
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),

        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId, // who is followed
            creatorId: userId, // who is following
          },
        }),
      ]);
    }

    revalidatePath("/") // revalidate the home page so that the who to follow component can show the updated list 
    return { success: true };
  } catch (error) {
    console.log("Error in toggleFollow", error);
    return {success : false, error : "Error in toggle Follow"}
    
  }
}
