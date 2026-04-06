export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const currentPlan = "pro";
    const credits = 1000;

    const loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (loggedInUser) {
      if (loggedInUser.role === "INTERVIEWER") return loggedInUser;

      if (shouldAllocateCredits(loggedInUser, currentPlan)) {
        const rolledCredits = credits + (loggedInUser.credits ?? 0);
        return await db.user.update({
          where: { clerkUserId: user.id },
          data: {
            credits: rolledCredits,
            currentPlan,
            creditsLastAllocatedAt: new Date(),
          },
        });
      }

      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;

    return await db.user.upsert({
      where: { email: user.emailAddresses[0].emailAddress },
      update: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        credits,
        currentPlan,
        creditsLastAllocatedAt: new Date(),
      },
      create: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        credits,
        currentPlan,
        creditsLastAllocatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("checkUser error:", error.message);
    return null;
  }
};