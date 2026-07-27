export function clearTestWorkspaceDrafts(startupId: number) {
  if (typeof window === "undefined") {
    return;
  }

  const interviewPrefix = `startup-quest:interview-draft:${startupId}:`;
  const refinementKey = `startup-quest:problem-refinement:${startupId}`;
  const keysToRemove: string[] = [];

  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key && (key.startsWith(interviewPrefix) || key === refinementKey)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    return;
  }
}
