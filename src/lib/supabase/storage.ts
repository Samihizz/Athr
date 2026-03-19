import { createClient } from "./client";

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("Avatar upload error:", error);
    return null;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadFeedMedia(userId: string, file: File): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const timestamp = Date.now();
  const path = `${userId}/${timestamp}.${ext}`;

  const { error } = await supabase.storage
    .from("feed-media")
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("Feed media upload error:", error);
    return null;
  }

  const { data } = supabase.storage.from("feed-media").getPublicUrl(path);
  return data.publicUrl;
}
