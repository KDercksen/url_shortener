"use client";

import { createCheckoutSession } from "@/actions/donate";
import { Button } from "@/components/ui/button";
import { Banknote, LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function DonatePage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const query = useSearchParams();

  useEffect(() => {
    if (query.get("success")) {
      setMessage("Thank you for your support!");
    }
    if (query.get("canceled")) {
      setMessage("Donation canceled.");
    }
    if (query.get("error")) {
      setMessage("An error occurred! Please try again later.");
    }
  }, [query]);

  const goToCheckout = async () => {
    setLoading(true);
    try {
      await createCheckoutSession();
    } catch (e: any) {
      console.error(e?.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen justify-center items-center p-8 space-y-16">
      {!!message && (
        <p className="text-muted-foreground text-3xl tracking-wide font-light text-center">
          {message}
        </p>
      )}
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-8">
        <Image
          src="/donate_pic.png"
          alt="Donate Duck"
          width={200}
          height={200}
          className="rounded-full"
        />
        <div className="flex flex-col items-center text-center sm:text-left sm:items-start max-w-96 gap-8">
          <p>
            <span className="italic font-semibold">
              Blurb will remain free to use for everyone.
            </span>{" "}
            If you enjoy what I am doing, please consider donating. Your support
            helps the application to keep running smoothly!
          </p>
          <div className="flex flex-row gap-4 items-center">
            <Button asChild variant="secondary" className="w-32">
              <Link href="/">Home</Link>
            </Button>
            <Button className="w-32" onClick={goToCheckout}>
              {!loading ? (
                <>
                  <Banknote className="mr-2 size-6" /> Donate
                </>
              ) : (
                <LoaderCircle className="size-4 animate-spin" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DonatePageWrapper() {
  return (
    <Suspense>
      <DonatePage />
    </Suspense>
  );
}
