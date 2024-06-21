"use server";
import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";
import normalizeUrl from "normalize-url";

const redis = Redis.fromEnv();

export const shorten = async (url: string): Promise<string | null> => {
  try {
    const normalized = normalizeUrl(url);
    // Check if URL is already in redis
    const existing = (await redis.get(normalized)) as string;
    if (existing) {
      return existing;
    }
    // Since valid URLs and default nanoid IDs can never clash, this is fine
    let id;
    do {
      id = nanoid(7);
    } while (await redis.exists(id));
    await redis.set(normalized, id);
    await redis.set(id, normalized);
    // Expire after one week
    await redis.expire(normalized, 60 * 60 * 24 * 7);
    await redis.expire(id, 60 * 60 * 24 * 7);
    return id;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getRedirect = async (id: string): Promise<string | null> => {
  try {
    const url = (await redis.get(id)) as string;
    return url;
  } catch (e) {
    console.error(e);
    return null;
  }
};
