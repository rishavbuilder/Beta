/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import {
  getServerSupabase,
  getAuthToken,
  getServerSupabaseWithAuth,
} from "@/lib/supabase-server-client";

export const listPrompts = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = getServerSupabase();
    const { data } = await (supabase as any)
      .from("prompts")
      .select("*, users(username, avatar_url, full_name), categories(name, slug)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(50);
    return { prompts: data || [] };
  } catch {
    return { prompts: [] };
  }
});

export const listMyPrompts = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const token = await getAuthToken();
    if (!token) return { prompts: [] };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { prompts: [] };
    const { data } = await supabase
      .from("prompts")
      .select("*, categories(name, slug)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    return { prompts: data || [] };
  } catch {
    return { prompts: [] };
  }
});

export const createPrompt = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { error: "Unauthorized" };
    const payload = { ...ctx.data, user_id: user.id };
    if (payload.category_name && !payload.category_id) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", payload.category_name)
        .maybeSingle();
      if (cat) payload.category_id = cat.id;
      delete payload.category_name;
    }
    const { data, error } = await supabase
      .from("prompts")
      .insert(payload)
      .select("*, users(username, avatar_url), categories(name, slug)")
      .single();
    if (error) return { error: error.message };
    return { prompt: data };
  } catch {
    return { error: "Failed to create prompt" };
  }
});

export const toggleLike = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const { prompt_id } = ctx.data;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { error: "Unauthorized" };

    const { data: existing } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("prompt_id", prompt_id)
      .maybeSingle();
    if (existing) {
      await supabase.from("likes").delete().eq("id", existing.id);
      const { data: cur } = await supabase
        .from("prompts")
        .select("likes_count")
        .eq("id", prompt_id)
        .single();
      await supabase
        .from("prompts")
        .update({ likes_count: Math.max(0, (cur?.likes_count || 0) - 1) })
        .eq("id", prompt_id);
      return { liked: false };
    }
    await supabase.from("likes").insert({ user_id: user.id, prompt_id });
    const { data: cur } = await supabase
      .from("prompts")
      .select("likes_count")
      .eq("id", prompt_id)
      .single();
    await supabase
      .from("prompts")
      .update({ likes_count: (cur?.likes_count || 0) + 1 })
      .eq("id", prompt_id);
    return { liked: true };
  } catch {
    return { error: "Failed to toggle like" };
  }
});

export const toggleSave = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const { prompt_id } = ctx.data;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { error: "Unauthorized" };

    const { data: existing } = await supabase
      .from("saves")
      .select("id")
      .eq("user_id", user.id)
      .eq("prompt_id", prompt_id)
      .maybeSingle();
    if (existing) {
      await supabase.from("saves").delete().eq("id", existing.id);
      const { data: cur } = await supabase
        .from("prompts")
        .select("saves_count")
        .eq("id", prompt_id)
        .single();
      await supabase
        .from("prompts")
        .update({ saves_count: Math.max(0, (cur?.saves_count || 0) - 1) })
        .eq("id", prompt_id);
      return { saved: false };
    }
    await supabase.from("saves").insert({ user_id: user.id, prompt_id });
    const { data: cur } = await supabase
      .from("prompts")
      .select("saves_count")
      .eq("id", prompt_id)
      .single();
    await supabase
      .from("prompts")
      .update({ saves_count: (cur?.saves_count || 0) + 1 })
      .eq("id", prompt_id);
    return { saved: true };
  } catch {
    return { error: "Failed to toggle save" };
  }
});

export const listCollections = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = getServerSupabase() as any;
    const { data } = await supabase
      .from("collections")
      .select("*, users(username, avatar_url)")
      .eq("is_public", true)
      .order("created_at", { ascending: false });
    return { collections: data || [] };
  } catch {
    return { collections: [] };
  }
});

export const createCollection = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { error: "Unauthorized" };
    const { data, error } = await supabase
      .from("collections")
      .insert({ ...ctx.data, user_id: user.id })
      .select()
      .single();
    if (error) return { error: error.message };
    return { collection: data };
  } catch {
    return { error: "Failed to create collection" };
  }
});

export const getBattles = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = getServerSupabase() as any;
    const { data } = await supabase
      .from("battles")
      .select(
        "*, prompt_1:prompt_1_id(title), prompt_2:prompt_2_id(title), users!created_by(username)",
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });
    return { battles: data || [] };
  } catch {
    return { battles: [] };
  }
});

export const getDiscussions = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = getServerSupabase() as any;
    const { data } = await supabase
      .from("discussions")
      .select("*, users(username, avatar_url)")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);
    return { discussions: data || [] };
  } catch {
    return { discussions: [] };
  }
});

export const getUserProfile = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const token = await getAuthToken();
    if (!token) return { user: null };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { user: null };
    const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
    return { user: data };
  } catch {
    return { user: null };
  }
});

export const getAdminStats = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { error: "Unauthorized" };
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") return { error: "Forbidden" };
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    const { count: totalPrompts } = await supabase
      .from("prompts")
      .select("*", { count: "exact", head: true });
    return { stats: { totalUsers: totalUsers || 0, totalPrompts: totalPrompts || 0 } };
  } catch {
    return { error: "Failed to fetch stats" };
  }
});

export const toggleFollow = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const { user_id } = ctx.data;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user || user.id === user_id) return { error: "Cannot follow yourself" };

    const { data: existing } = await supabase
      .from("followers")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", user_id)
      .maybeSingle();
    if (existing) {
      await supabase.from("followers").delete().eq("id", existing.id);
      return { following: false };
    }
    await supabase.from("followers").insert({ follower_id: user.id, following_id: user_id });
    return { following: true };
  } catch {
    return { error: "Failed to toggle follow" };
  }
});

export const getPromptById = createServerFn({ method: "GET" }).handler(async (ctx: any) => {
  try {
    const supabase = getServerSupabase() as any;
    const { id, userId } = ctx.data;
    const { data } = await supabase
      .from("prompts")
      .select("*, users(username, avatar_url, full_name, bio), categories(name, slug)")
      .eq("id", id)
      .single();
    if (data) {
      const { count } = await supabase
        .from("followers")
        .select("id", { count: "exact", head: true })
        .eq("following_id", data.user_id);
      (data as any).followers_count = count || 0;

      if (userId) {
        const { data: like } = await supabase
          .from("likes")
          .select("id")
          .eq("user_id", userId)
          .eq("prompt_id", id)
          .maybeSingle();
        (data as any).liked = !!like;

        const { data: save } = await supabase
          .from("saves")
          .select("id")
          .eq("user_id", userId)
          .eq("prompt_id", id)
          .maybeSingle();
        (data as any).saved = !!save;

        const { data: follow } = await supabase
          .from("followers")
          .select("id")
          .eq("follower_id", userId)
          .eq("following_id", data.user_id)
          .maybeSingle();
        (data as any).following = !!follow;
      }
    }
    return { prompt: data || null };
  } catch {
    return { prompt: null };
  }
});

export const incrementView = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const supabase = getServerSupabase() as any;
    const { prompt_id } = ctx.data;
    const { data: current } = await supabase
      .from("prompts")
      .select("views_count")
      .eq("id", prompt_id)
      .single();
    if (!current) return { error: "Not found" };
    await supabase
      .from("prompts")
      .update({ views_count: (current.views_count || 0) + 1 })
      .eq("id", prompt_id);
    return { success: true };
  } catch {
    return { error: "Failed to increment view" };
  }
});

export const createReview = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { error: "Unauthorized" };
    const { prompt_id, rating, content } = ctx.data;
    if (!prompt_id || !rating || rating < 1 || rating > 5) return { error: "Invalid rating" };
    const { data, error } = await supabase
      .from("reviews")
      .insert({ user_id: user.id, prompt_id, rating, content })
      .select("*, users(username, avatar_url)")
      .single();
    if (error) return { error: error.message };

    const { data: agg } = await supabase
      .from("reviews")
      .select("rating")
      .eq("prompt_id", prompt_id);
    const ratings = (agg || []).map((r: any) => r.rating);
    const avg =
      ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
    await supabase
      .from("prompts")
      .update({ rating: Math.round(avg * 10) / 10, rating_count: ratings.length })
      .eq("id", prompt_id);

    return { review: data };
  } catch {
    return { error: "Failed to create review" };
  }
});

export const getPromptReviews = createServerFn({ method: "GET" }).handler(async (ctx: any) => {
  try {
    const supabase = getServerSupabase() as any;
    const { data } = await supabase
      .from("reviews")
      .select("*, users(username, avatar_url)")
      .eq("prompt_id", ctx.data.prompt_id)
      .order("created_at", { ascending: false });
    return { reviews: data || [] };
  } catch {
    return { reviews: [] };
  }
});

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = getServerSupabase() as any;
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    return { categories: data || [] };
  } catch {
    return { categories: [] };
  }
});

export const createDiscussion = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { error: "Unauthorized" };
    const { title, content, category } = ctx.data;
    if (!title?.trim() || !content?.trim()) return { error: "Title and content are required" };
    const { data, error } = await supabase
      .from("discussions")
      .insert({ title, content, category: category || "Discussion", user_id: user.id })
      .select("*, users(username, avatar_url)")
      .single();
    if (error) return { error: error.message };
    return { discussion: data };
  } catch {
    return { error: "Failed to create discussion" };
  }
});

export const castVote = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const { battle_id, voted_for } = ctx.data;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { error: "Unauthorized" };

    const { data: existing } = await supabase
      .from("battle_votes")
      .select("id, voted_for")
      .eq("battle_id", battle_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) {
      await supabase.from("battle_votes").delete().eq("id", existing.id);
      const { data: battle } = await supabase
        .from("battles")
        .select("prompt_1_id, prompt_2_id, votes_1, votes_2")
        .eq("id", battle_id)
        .single();
      if (battle) {
        const col = existing.voted_for === battle.prompt_1_id ? "votes_1" : "votes_2";
        await supabase
          .from("battles")
          .update({ [col]: Math.max(0, (battle[col] || 0) - 1) })
          .eq("id", battle_id);
      }
      return { success: true, removed: true };
    }
    await supabase.from("battle_votes").insert({ battle_id, user_id: user.id, voted_for });
    const { data: battle } = await supabase
      .from("battles")
      .select("prompt_1_id, prompt_2_id, votes_1, votes_2")
      .eq("id", battle_id)
      .single();
    if (battle) {
      const col = voted_for === battle.prompt_1_id ? "votes_1" : "votes_2";
      await supabase
        .from("battles")
        .update({ [col]: (battle[col] || 0) + 1 })
        .eq("id", battle_id);
    }
    return { success: true };
  } catch {
    return { error: "Failed to cast vote" };
  }
});

export const deletePrompt = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { error: "Unauthorized" };
    const { prompt_id } = ctx.data;
    const { data: prompt } = await supabase
      .from("prompts")
      .select("user_id")
      .eq("id", prompt_id)
      .single();
    if (!prompt) return { error: "Prompt not found" };
    if (prompt.user_id !== user.id) return { error: "Not your prompt" };
    const { error } = await supabase.from("prompts").delete().eq("id", prompt_id);
    if (error) return { error: error.message };
    return { success: true };
  } catch {
    return { error: "Failed to delete prompt" };
  }
});

export const togglePromptPublished = createServerFn({ method: "POST" }).handler(
  async (ctx: any) => {
    try {
      const token = await getAuthToken();
      if (!token) return { error: "Unauthorized" };
      const supabase = getServerSupabaseWithAuth(token) as any;
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (!user) return { error: "Unauthorized" };
      const { prompt_id, is_published } = ctx.data;
      const { data: prompt } = await supabase
        .from("prompts")
        .select("user_id")
        .eq("id", prompt_id)
        .single();
      if (!prompt) return { error: "Prompt not found" };
      if (prompt.user_id !== user.id) return { error: "Not your prompt" };
      const { error } = await supabase.from("prompts").update({ is_published }).eq("id", prompt_id);
      if (error) return { error: error.message };
      return { success: true };
    } catch {
      return { error: "Failed to update prompt" };
    }
  },
);

export const updateProfile = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { error: "Unauthorized" };
    const { error } = await supabase
      .from("users")
      .update({
        username: ctx.data.username,
        full_name: ctx.data.full_name,
        bio: ctx.data.bio,
      })
      .eq("id", user.id);
    if (error) return { error: error.message };
    return { success: true };
  } catch {
    return { error: "Failed to update profile" };
  }
});

export const uploadImage = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { error: "Unauthorized" };

    const { base64, fileName } = ctx.data;
    if (!base64) return { error: "No image data" };

    const ext = fileName?.split(".").pop() || "png";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("prompt-covers")
      .upload(path, Buffer.from(base64.split(",")[1], "base64"), {
        contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
        upsert: false,
      });

    if (error) return { error: error.message };

    const { data: urlData } = supabase.storage.from("prompt-covers").getPublicUrl(path);
    return { url: urlData.publicUrl };
  } catch {
    return { error: "Failed to upload image" };
  }
});

export const upvoteDiscussion = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { error: "Unauthorized" };
    const { id } = ctx.data;

    const { data: existing } = await supabase
      .from("discussion_upvotes")
      .select("id")
      .eq("user_id", user.id)
      .eq("discussion_id", id)
      .maybeSingle();

    if (existing) {
      await supabase.from("discussion_upvotes").delete().eq("id", existing.id);
      const { data: current } = await supabase
        .from("discussions")
        .select("upvotes")
        .eq("id", id)
        .single();
      const newCount = Math.max(0, (current?.upvotes || 0) - 1);
      await supabase.from("discussions").update({ upvotes: newCount }).eq("id", id);
      return { upvotes: newCount, upvoted: false };
    }

    await supabase.from("discussion_upvotes").insert({ user_id: user.id, discussion_id: id });
    const { data: current } = await supabase
      .from("discussions")
      .select("upvotes")
      .eq("id", id)
      .single();
    const newCount = (current?.upvotes || 0) + 1;
    await supabase.from("discussions").update({ upvotes: newCount }).eq("id", id);
    return { upvotes: newCount, upvoted: true };
  } catch {
    return { error: "Failed to upvote" };
  }
});

export const deleteDiscussion = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Unauthorized" };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { error: "Unauthorized" };
    const { id } = ctx.data;
    const { data: discussion } = await supabase
      .from("discussions")
      .select("user_id")
      .eq("id", id)
      .single();
    if (!discussion) return { error: "Not found" };
    if (discussion.user_id !== user.id) return { error: "Forbidden" };
    const { error } = await supabase.from("discussions").delete().eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
  } catch {
    return { error: "Failed to delete discussion" };
  }
});

export const getUserUpvotes = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const token = await getAuthToken();
    if (!token) return { upvoted_ids: [] };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { upvoted_ids: [] };
    const { data } = await supabase
      .from("discussion_upvotes")
      .select("discussion_id")
      .eq("user_id", user.id);
    return { upvoted_ids: (data || []).map((r: any) => r.discussion_id) };
  } catch {
    return { upvoted_ids: [] };
  }
});

export const getDiscussionReplies = createServerFn({ method: "GET" }).handler(async (ctx: any) => {
  try {
    const supabase = getServerSupabase() as any;
    const { data } = await supabase
      .from("discussion_replies")
      .select("*, users(username, avatar_url)")
      .eq("discussion_id", ctx.data.discussion_id)
      .order("created_at", { ascending: true });
    return { replies: data || [] };
  } catch {
    return { replies: [] };
  }
});

export const createDiscussionReply = createServerFn({ method: "POST" }).handler(
  async (ctx: any) => {
    try {
      const token = await getAuthToken();
      if (!token) return { error: "Unauthorized" };
      const supabase = getServerSupabaseWithAuth(token) as any;
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (!user) return { error: "Unauthorized" };
      const { discussion_id, content } = ctx.data;
      if (!content?.trim()) return { error: "Content is required" };

      const { data, error } = await supabase
        .from("discussion_replies")
        .insert({ discussion_id, user_id: user.id, content: content.trim() })
        .select("*, users(username, avatar_url)")
        .single();
      if (error) return { error: error.message };

      const { data: current } = await supabase
        .from("discussions")
        .select("comment_count")
        .eq("id", discussion_id)
        .single();
      const newCount = (current?.comment_count || 0) + 1;
      await supabase
        .from("discussions")
        .update({ comment_count: newCount })
        .eq("id", discussion_id);

      return { reply: data, comment_count: newCount };
    } catch {
      return { error: "Failed to create reply" };
    }
  },
);

export const getNotifications = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const token = await getAuthToken();
    if (!token) return { notifications: [] };
    const supabase = getServerSupabaseWithAuth(token) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { notifications: [] };
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    return { notifications: data || [] };
  } catch {
    return { notifications: [] };
  }
});

export const markNotificationRead = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data: { id } }) => {
    try {
      const token = await getAuthToken();
      if (!token) return { success: false };
      const supabase = getServerSupabaseWithAuth(token) as any;
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (!user) return { success: false };
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", user.id);
      return { success: true };
    } catch {
      return { success: false };
    }
  });
