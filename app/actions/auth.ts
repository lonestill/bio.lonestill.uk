"use server";

import { lucia } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-config";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { registerSchema, loginSchema } from "@/lib/validation";
import { RESERVED_USERNAMES } from "@/lib/constants";
import { eq, sql } from "drizzle-orm";
import { Argon2id } from "oslo/password";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function register(
  prevState: { error: string | null } | null,
  formData: FormData
) {
  try {
    // Проверяем что formData это FormData
    if (!formData) {
      console.error("[REGISTER] formData is null or undefined");
      return { error: "Invalid form data: formData is null" };
    }

    // Проверяем что formData имеет метод get
    if (typeof (formData as any).get !== "function") {
      console.error("[REGISTER] formData.get is not a function", {
        type: typeof formData,
        constructor: formData?.constructor?.name,
        keys: Object.keys(formData || {}),
        prototype: Object.getPrototypeOf(formData || {}).constructor?.name,
      });
      return { error: "Invalid form data: formData.get is not a function" };
    }

    console.log("[REGISTER] FormData received, type:", typeof formData, "constructor:", formData.constructor?.name);

    const rawData = {
      username: formData.get("username") as string | null,
      email: formData.get("email") as string | null,
      password: formData.get("password") as string | null,
    };

    // Логирование для отладки
    console.log("Register form data received:", {
      username: rawData.username ? "present" : "missing",
      email: rawData.email ? "present" : "missing",
      password: rawData.password ? "present" : "missing",
    });

  const result = registerSchema.safeParse({
    username: rawData.username || "",
    email: rawData.email || "",
    password: rawData.password || "",
  });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { username, email, password } = result.data;
  const lowerUsername = username.toLowerCase();
  const emailValue = email && email.trim() !== "" ? email.toLowerCase() : null;

  // Check reserved usernames
  if (RESERVED_USERNAMES.includes(lowerUsername as any)) {
    return { error: "This username is reserved." };
  }

  // Check if username already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, lowerUsername))
    .get();

  if (existingUser) {
    return { error: "Username already taken." };
  }

  // Check if email already exists (only if email provided)
  if (emailValue) {
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, emailValue))
      .get();

    if (existingEmail) {
      return { error: "Email already registered." };
    }
  }

  // Hash password
  const hashedPassword = await new Argon2id().hash(password);

  // Generate numeric UID - get last registered user's UID and add 1
  const lastUser = await db
    .select({ uid: users.uid })
    .from(users)
    .orderBy(sql`${users.createdAt} DESC`)
    .limit(1)
    .get();
  
  const newUid = (lastUser?.uid ?? 999) + 1;

  // Create user
  const userId = nanoid();
  await db.insert(users).values({
    id: userId,
    uid: newUid,
    username: lowerUsername,
    email: emailValue,
    passwordHash: hashedPassword,
    role: "user",
  });

  // Create profile
  await db.insert(profiles).values({
    userId,
    displayName: lowerUsername,
    views: 0,
    bioText: "",
    avatarUrl: "",
    backgroundUrl: "",
    themeConfig: {},
    modules: {},
  });

  // Create session
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  } catch (error: any) {
    // NEXT_REDIRECT - это нормальное поведение Next.js, не ошибка
    if (error?.digest === "NEXT_REDIRECT" || error?.message?.includes("NEXT_REDIRECT")) {
      throw error; // Пробрасываем redirect дальше
    }
    console.error("Error in register function:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
  
  // Вынести redirect за пределы try-catch, чтобы NEXT_REDIRECT не перехватывался
  redirect("/dashboard");
}

export async function login(
  prevState: { error: string | null } | null,
  formData: FormData
) {
  try {
    const rawData = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

  const result = loginSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { username, password } = result.data;
  const lowerUsername = username.toLowerCase();

  // Find user
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, lowerUsername))
    .get();

  if (!user) {
    return { error: "Invalid username or password." };
  }

  // Verify password
  const validPassword = await new Argon2id().verify(user.passwordHash, password);

  if (!validPassword) {
    return { error: "Invalid username or password." };
  }

  // Create session
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  } catch (error: any) {
    // NEXT_REDIRECT - это нормальное поведение Next.js, не ошибка
    if (error?.digest === "NEXT_REDIRECT" || error?.message?.includes("NEXT_REDIRECT")) {
      throw error; // Пробрасываем redirect дальше
    }
    console.error("Error in login function:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
  
  // Вынести redirect за пределы try-catch, чтобы NEXT_REDIRECT не перехватывался
  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const sessionId = sessionCookie?.value ?? null;
  
  if (sessionId) {
    const { session } = await lucia.validateSession(sessionId);
    if (session) {
      await lucia.invalidateSession(session.id);
    }
  }

  const blankCookie = lucia.createBlankSessionCookie();
  const cookieStoreLogout = await cookies();
  cookieStoreLogout.set(blankCookie.name, blankCookie.value, blankCookie.attributes);

  revalidatePath("/");
  redirect("/");
}