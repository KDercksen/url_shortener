import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen items-center flex flex-col gap-2 justify-center">
      <p>not found.</p>
      <Link className="underline hover:text-gray-700" href="/">
        Home
      </Link>
    </div>
  );
}
