import { getRedirect } from "@/actions/shorten";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Redirect({
  params,
}: {
  params: { slug: string };
}) {
  const url = await getRedirect(params.slug);
  if (url) {
    redirect(url);
  }
  return (
    <div className="min-h-screen items-center flex flex-col gap-2 justify-center">
      <p>not found.</p>
      <Link className="underline hover:text-gray-700" href="/">
        Home
      </Link>
    </div>
  );
}
