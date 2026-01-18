import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getSession } from "@/lib/auth-utils";

const f = createUploadthing();

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      console.log("[UploadThing] Avatar middleware called");
      try {
        const session = await getSession();
        console.log("[UploadThing] Session:", session ? "found" : "not found");
        if (!session) {
          throw new Error("Unauthorized - no session");
        }
        return { userId: session.userId };
      } catch (error) {
        console.error("[UploadThing] Middleware error:", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
  backgroundUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getSession();
      if (!session) {
        throw new Error("Unauthorized");
      }
      return { userId: session.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
