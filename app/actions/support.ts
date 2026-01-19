"use server";

import { lucia } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-config";
import { db } from "@/db";
import { supportTickets, users, TicketStatus, TicketCategory } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ticketSchema = z.object({
  email: z.string().email("Введите корректный email"),
  category: z.enum(["ban_appeal", "bug_report", "feature_request", "account_issue", "other"]),
  subject: z.string().min(5, "Тема должна быть не менее 5 символов").max(200),
  message: z.string().min(20, "Сообщение должно быть не менее 20 символов").max(5000),
});

// Create a new support ticket
export async function createTicket(
  prevState: { error: string | null; success: boolean } | null,
  formData: FormData
) {
  try {
    const rawData = {
      email: formData.get("email") as string,
      category: formData.get("category") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    const result = ticketSchema.safeParse(rawData);

    if (!result.success) {
      return { error: result.error.errors[0].message, success: false };
    }

    const { email, category, subject, message } = result.data;

    // Try to get current user (may be null for banned users)
    let userId: string | null = null;
    let username: string | null = null;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const sessionId = sessionCookie?.value ?? null;

    if (sessionId) {
      const { session, user } = await lucia.validateSession(sessionId);
      if (session && user) {
        userId = session.userId;
        username = user.username;
      }
    }

    const now = new Date();

    await db.insert(supportTickets).values({
      userId,
      email,
      username,
      category: category as TicketCategory,
      subject,
      message,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/support");
    return { error: null, success: true };
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return { error: error.message || "Произошла ошибка", success: false };
  }
}

// Get user's tickets
export async function getUserTickets() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const sessionId = sessionCookie?.value ?? null;

  if (!sessionId) {
    return [];
  }

  const { session } = await lucia.validateSession(sessionId);

  if (!session) {
    return [];
  }

  const tickets = await db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, session.userId))
    .orderBy(desc(supportTickets.createdAt));

  return tickets;
}

// Admin functions
async function checkAdminAccess() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const sessionId = sessionCookie?.value ?? null;

  if (!sessionId) {
    throw new Error("Не авторизован");
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (!session || user.role !== "admin") {
    throw new Error("Доступ запрещен");
  }

  return { session, user };
}

// Get all tickets (admin)
export async function getAllTickets() {
  await checkAdminAccess();

  const tickets = await db
    .select({
      id: supportTickets.id,
      userId: supportTickets.userId,
      email: supportTickets.email,
      username: supportTickets.username,
      category: supportTickets.category,
      subject: supportTickets.subject,
      message: supportTickets.message,
      status: supportTickets.status,
      adminId: supportTickets.adminId,
      adminResponse: supportTickets.adminResponse,
      respondedAt: supportTickets.respondedAt,
      createdAt: supportTickets.createdAt,
      updatedAt: supportTickets.updatedAt,
      adminUsername: users.username,
    })
    .from(supportTickets)
    .leftJoin(users, eq(supportTickets.adminId, users.id))
    .orderBy(desc(supportTickets.createdAt));

  return tickets;
}

// Update ticket status (admin)
export async function updateTicketStatus(ticketId: number, status: TicketStatus) {
  await checkAdminAccess();

  await db
    .update(supportTickets)
    .set({ status, updatedAt: new Date() })
    .where(eq(supportTickets.id, ticketId));

  revalidatePath("/admin");
  return { success: true };
}

// Respond to ticket (admin)
export async function respondToTicket(ticketId: number, response: string) {
  const { session } = await checkAdminAccess();

  await db
    .update(supportTickets)
    .set({
      adminId: session.userId,
      adminResponse: response,
      respondedAt: new Date(),
      status: "in_progress",
      updatedAt: new Date(),
    })
    .where(eq(supportTickets.id, ticketId));

  revalidatePath("/admin");
  return { success: true };
}

// Close ticket (admin)
export async function closeTicket(ticketId: number) {
  await checkAdminAccess();

  await db
    .update(supportTickets)
    .set({ status: "closed", updatedAt: new Date() })
    .where(eq(supportTickets.id, ticketId));

  revalidatePath("/admin");
  return { success: true };
}

// Delete ticket (admin)
export async function deleteTicket(ticketId: number) {
  await checkAdminAccess();

  await db.delete(supportTickets).where(eq(supportTickets.id, ticketId));

  revalidatePath("/admin");
  return { success: true };
}
