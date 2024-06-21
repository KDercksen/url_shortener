"use server";
import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";
import { unstable_cache } from "next/cache";
import normalizeUrl from "normalize-url";

const redis = Redis.fromEnv();

const shortenFn = async (
  url: string,
  expiry?: number | null
): Promise<string | null> => {
  try {
    const normalized = normalizeUrl(url);
    // Since valid URLs and default nanoid IDs can never clash, this is fine
    let id;
    do {
      id = nanoid(7);
    } while (await redis.exists(id));
    await redis.set(id, normalized);
    if (expiry) {
      await redis.expire(id, 60 * 60 * 24 * expiry);
    }
    // Persist is automatic for new keys
    return id;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// We can cache shortened URLs with the same expiry for a day
export const shorten = unstable_cache(shortenFn, ["shorten-url"], {
  revalidate: 60 * 60 * 24,
});

const getRedirectFn = async (id: string): Promise<string | null> => {
  try {
    const url = (await redis.get(id)) as string;
    return url;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// Let's cache this a bit shorter
export const getRedirect = unstable_cache(getRedirectFn, ["redirect-url"], {
  revalidate: 60 * 60 * 1,
});
