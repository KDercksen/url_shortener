import { shorten } from "@/actions/shorten";
import { urlSchema } from "@/lib/schemas";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "10 s"),
});
const ratelimitIdentifier = "api";

export async function POST(req: Request) {
  const { success } = await ratelimit.limit(ratelimitIdentifier);
  if (!success) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  const body: { url: string; expiry?: number } = await req.json();
  const valid = urlSchema.safeParse({ url: body.url });
  if (!valid.success) {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }
  const shortened = await shorten(body.url, body.expiry ?? null);
  if (shortened) {
    return Response.json(
      { url: `${process.env.NEXT_PUBLIC_URL}/${shortened}` },
      { status: 200 }
    );
  } else {
    return Response.json(
      { error: "Failed to shorten URL" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
