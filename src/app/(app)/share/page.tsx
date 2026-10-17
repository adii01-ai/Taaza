import Image from "next/image";
import { closeSharePost, requestSharePost } from "@/app/actions/share";
import { ShareForm } from "@/components/share/share-form";
import { ShieldIcon } from "@/components/ui/icons";
import { getCurrentKitchen } from "@/lib/kitchen/current";

export const metadata = { title: "Share food – Taaza" };

const PHOTOS = ["/images/pulao.jpg", "/images/vada-pav.jpg", "/images/curd-rice.jpg", "/images/thali.jpg"];

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(iso));
}

export default async function SharePage() {
  const { supabase, user } = await getCurrentKitchen();
  const now = new Date().toISOString();
  const [{ data: posts }, { data: myRequests }] = await Promise.all([
    supabase
      .from("share_posts")
      .select("id, title, area, pickup_by, user_id, status")
      .eq("status", "open")
      .gt("pickup_by", now)
      .order("pickup_by")
      .limit(30),
    supabase.from("share_requests").select("post_id").eq("requester_id", user.id),
  ]);
  const requested = new Set((myRequests ?? []).map((r) => r.post_id));
  const mine = (posts ?? []).filter((p) => p.user_id === user.id);
  const others = (posts ?? []).filter((p) => p.user_id !== user.id);

  return (
    <main className="flex flex-col gap-3.5 px-5 pt-12">
      <header className="flex items-center gap-3">
        <div className="flex-1">
          <h1 className="font-display text-[28px] font-extrabold tracking-tight">Share food</h1>
          <p className="text-sm text-muted">Give extra food to neighbours instead of throwing it.</p>
        </div>
        <Image src="/images/p2.png" alt="" width={72} height={72} className="rounded-2xl" />
      </header>

      <ShareForm />

      {mine.length ? (
        <section>
          <h2 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted">Your posts</h2>
          <ul className="flex flex-col gap-2">
            {mine.map((post) => (
              <li key={post.id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold">{post.title}</p>
                  <p className="text-xs font-bold">Pick up by {timeLabel(post.pickup_by)}</p>
                </div>
                <form action={closeSharePost}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button type="submit" className="h-10 rounded-xl bg-sand px-3.5 text-sm font-bold">
                    Mark given
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted">Available nearby</h2>
        {others.length ? (
          <ul className="flex flex-col gap-2">
            {others.map((post, i) => (
              <li key={post.id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                <Image src={PHOTOS[i % PHOTOS.length]} alt="" width={60} height={60} className="size-[60px] rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold">{post.title}</p>
                  {post.area ? <p className="truncate text-[13px] text-muted">{post.area}</p> : null}
                  <p className="text-xs font-bold">Pick up by {timeLabel(post.pickup_by)}</p>
                </div>
                {requested.has(post.id) ? (
                  <span className="rounded-xl bg-brand-soft px-3 py-2 text-sm font-bold">Requested</span>
                ) : (
                  <form action={requestSharePost}>
                    <input type="hidden" name="postId" value={post.id} />
                    <button type="submit" className="h-10 rounded-xl border border-ink bg-white px-4 text-sm font-bold">
                      Request
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-white p-4 text-sm text-muted">No food shared nearby right now. Check back this evening.</p>
        )}
      </section>

      <p className="flex items-start gap-1.5 text-xs text-muted">
        <ShieldIcon size={14} className="mt-px shrink-0" /> Only share same-day cooked or sealed food.
      </p>
    </main>
  );
}
