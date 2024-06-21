"use server";
import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";
import normalizeUrl from "normalize-url";
import { unstable_cache } from "next/cache";

const redis = Redis.fromEnv();

export const shorten = unstable_cache(
  async (url: string, expiry?: number | null) => shortenFn(url, expiry),
  ["short-id"],
  { revalidate: 60 * 60 }
);

const shortenFn = async (
  url: string,
  expiry?: number | null
): Promise<string | null> => {
  try {
    const normalized = normalizeUrl(url);
    // Check if URL is already in redis
    const existing = (await redis.get(normalized)) as string;
    if (existing) {
      // Refresh expiry
      if (expiry) {
        await redis.expire(normalized, 60 * 60 * 24 * expiry);
        await redis.expire(existing, 60 * 60 * 24 * expiry);
      } else {
        // If it exists and no expiry is set, persist the key
        await redis.persist(normalized);
        await redis.persist(existing);
      }
      return existing;
    }
    // Since valid URLs and default nanoid IDs can never clash, this is fine
    let id;
    do {
      id = nanoid(7);
    } while (await redis.exists(id));
    await redis.set(normalized, id);
    await redis.set(id, normalized);
    if (expiry) {
      await redis.expire(normalized, 60 * 60 * 24 * expiry);
      await redis.expire(id, 60 * 60 * 24 * expiry);
    }
    // Persist is automatic for new keys
    return id;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getRedirect = unstable_cache(
  async (id: string) => getRedirectFn(id),
  ["redirect"],
  { revalidate: 60 * 60 }
);

const getRedirectFn = async (id: string): Promise<string | null> => {
  try {
    const url = (await redis.get(id)) as string;
    return url;
  } catch (e) {
    console.error(e);
    return null;
  }
};
