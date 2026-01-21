import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores"),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val && val.trim() !== "" ? val : undefined)),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  displayName: z.string().max(50, "Display name must be at most 50 characters").optional(),
  bioText: z.string().optional(),
  avatarUrl: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => {
      console.log("[VALIDATION] avatarUrl transform - input:", val, "| type:", typeof val);
      if (!val || val.trim() === "") {
        console.log("[VALIDATION] avatarUrl transform - returning undefined");
        return undefined;
      }
      console.log("[VALIDATION] avatarUrl transform - returning:", val);
      return val;
    })
    .refine(
      (val) => {
        console.log("[VALIDATION] avatarUrl refine - value:", val, "| type:", typeof val, "| is undefined:", val === undefined);
        if (val === undefined) {
          console.log("[VALIDATION] avatarUrl refine - returning true (undefined)");
          return true;
        }
        try {
          const url = new URL(val);
          const isValid = url.protocol === "http:" || url.protocol === "https:";
          console.log("[VALIDATION] avatarUrl refine - URL parsed:", url.href, "| protocol:", url.protocol, "| valid:", isValid);
          return isValid;
        } catch (error) {
          console.log("[VALIDATION] avatarUrl refine - URL parse error:", error);
          return false;
        }
      },
      {
        message: "Invalid URL. Must start with http:// or https://",
      }
    )
    .optional(),
  backgroundUrl: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => {
      console.log("[VALIDATION] backgroundUrl transform - input:", val, "| type:", typeof val);
      if (!val || val.trim() === "") {
        console.log("[VALIDATION] backgroundUrl transform - returning undefined");
        return undefined;
      }
      console.log("[VALIDATION] backgroundUrl transform - returning:", val);
      return val;
    })
    .refine(
      (val) => {
        console.log("[VALIDATION] backgroundUrl refine - value:", val, "| type:", typeof val, "| is undefined:", val === undefined);
        if (val === undefined) {
          console.log("[VALIDATION] backgroundUrl refine - returning true (undefined)");
          return true;
        }
        try {
          const url = new URL(val);
          const isValid = url.protocol === "http:" || url.protocol === "https:";
          console.log("[VALIDATION] backgroundUrl refine - URL parsed:", url.href, "| protocol:", url.protocol, "| valid:", isValid);
          return isValid;
        } catch (error) {
          console.log("[VALIDATION] backgroundUrl refine - URL parse error:", error);
          return false;
        }
      },
      {
        message: "Invalid URL. Must start with http:// or https://",
      }
    )
    .optional(),
  themeConfig: z
    .object({
      colors: z
        .object({
          primary: z.string().optional(),
          secondary: z.string().optional(),
          text: z.string().optional(),
          background: z.string().optional(),
        })
        .optional(),
      opacity: z.number().min(0).max(1).optional(),
      blur: z.number().min(0).max(20).optional(),
    })
    .optional(),
  modules: z
    .object({
      music: z
        .object({
          url: z
            .string()
            .optional()
            .or(z.literal(""))
            .transform((val) => {
              console.log("[VALIDATION] music.url transform - input:", val, "| type:", typeof val);
              if (!val || val.trim() === "") {
                console.log("[VALIDATION] music.url transform - returning undefined");
                return undefined;
              }
              console.log("[VALIDATION] music.url transform - returning:", val);
              return val;
            })
            .refine(
              (val) => {
                console.log("[VALIDATION] music.url refine - value:", val, "| type:", typeof val, "| is undefined:", val === undefined);
                if (val === undefined) {
                  console.log("[VALIDATION] music.url refine - returning true (undefined)");
                  return true;
                }
                try {
                  const url = new URL(val);
                  console.log("[VALIDATION] music.url refine - URL parsed:", url.href);
                  return true;
                } catch (error) {
                  console.log("[VALIDATION] music.url refine - URL parse error:", error);
                  return false;
                }
              },
              {
                message: "Invalid URL",
              }
            )
            .optional(),
          volume: z.number().min(0).max(1).optional(),
          autoplay: z.boolean().optional(),
        })
        .optional(),
      socials: z
        .array(
          z.object({
            platform: z.string(),
            url: z.string().url(),
            label: z.string(),
          })
        )
        .optional(),
      effects: z
        .object({
          snow: z.boolean().optional(),
          scanlines: z.boolean().optional(),
          cursor: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;