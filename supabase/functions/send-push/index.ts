import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://3dyyc.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const { notification_id } = await req.json();
    if (!notification_id) return json({ error: "notification_id is required" }, 400);
    const admin = createClient(url, serviceKey);
    const { data: notification, error: notificationError } = await admin
      .from("notifications").select("id,user_id,text").eq("id", notification_id).maybeSingle();
    if (notificationError || !notification) return json({ error: "Notification not found" }, 404);
    const isOwner = notification.user_id === user.id;
    const isAdmin = user.email === "mamaevv35@gmail.com";
    if (!isOwner && !isAdmin) return json({ error: "Forbidden" }, 403);

    const publicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const privateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const subject = Deno.env.get("VAPID_SUBJECT") || "mailto:mamaevv35@gmail.com";
    webpush.setVapidDetails(subject, publicKey, privateKey);
    const { data: subscriptions, error: subError } = await admin
      .from("push_subscriptions").select("id,user_id,subscription").eq("user_id", notification.user_id);
    if (subError) throw subError;
    const payload = JSON.stringify({
      title: "3D Уус",
      body: notification.text,
      url: "/",
      tag: "3d-uus-" + notification.id,
    });
    let sent = 0;
    const stale: string[] = [];
    for (const item of subscriptions || []) {
      try {
        await webpush.sendNotification(item.subscription, payload);
        sent++;
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) stale.push(item.id);
        else console.error("Push delivery failed:", statusCode, String(err));
      }
    }
    if (stale.length) await admin.from("push_subscriptions").delete().in("id", stale);
    return json({ ok: true, sent });
  } catch (error) {
    console.error("send-push error:", error);
    return json({ error: "Push sending failed" }, 500);
  }
});