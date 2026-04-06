"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export const completeOnboarding = async (data) => {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { role, title, company, yearsExp, bio, categories } = data;

 if (!role || !["INTERVIEWEE", "INTERVIEWER", "BOTH"].includes(role)) {
  throw new Error("Invalid role");
}

// Remove the strict INTERVIEWER-only validation
if (role === "INTERVIEWER" || role === "BOTH") {
  if (!title || !company || !yearsExp || !bio || !categories?.length) {
    throw new Error("Please fill in all required fields");
  }
}

  try {
    await db.user.upsert({
      where: { clerkUserId: user.id },
      update: {
        role,
        ...(role === "INTERVIEWER" && {
          title,
          company,
          yearsExp,
          bio,
          categories,
        }),
      },
      create: {
        clerkUserId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl,
        credits: 1000,
        currentPlan: "pro",
        creditsLastAllocatedAt: new Date(),
        role,
        ...(role === "INTERVIEWER" && {
          title,
          company,
          yearsExp,
          bio,
          categories,
        }),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Onboarding error:", error);
    throw new Error("Something went wrong. Please try again.");
  }
};
