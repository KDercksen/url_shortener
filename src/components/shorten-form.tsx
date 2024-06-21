"use client";

import { shorten } from "@/actions/shorten";
import { zodResolver } from "@hookform/resolvers/zod";
import { CopyIcon, SparklesIcon, SquareCheckBigIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

const formSchema = z.object({
  url: z.string().url(),
});

export default function ShortenForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: "" },
  });

  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [showCopySuccessful, setShowCopySuccessful] = useState<boolean>(false);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const id = await shorten(values.url);
    if (id) {
      setResult(id);
      setError(false);
    } else {
      setResult(null);
      setError(true);
    }
  };

  const onCopyResult = async () => {
    if (result) {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_URL}/${result}`
      );
      setShowCopySuccessful(true);
      setTimeout(() => setShowCopySuccessful(false), 1000);
    }
  };

  return (
    <div className="space-y-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            <SparklesIcon className="size-4 mr-2" />
            Go
          </Button>
        </form>
      </Form>
      <div className="pt-2 h-6 w-full">
        {result && (
          <div
            onClick={onCopyResult}
            className="flex hover:cursor-pointer hover:text-gray-400 flex-row justify-center items-center w-full text-sm text-gray-500"
          >
            {result}{" "}
            {showCopySuccessful ? (
              <SquareCheckBigIcon className="size-4 ml-2 text-green-500" />
            ) : (
              <CopyIcon className="size-4 ml-2" />
            )}
          </div>
        )}
        {error && (
          <div className="flex flex-row justify-center items-center w-full text-sm text-red-500">
            Something went wrong!
          </div>
        )}
      </div>
    </div>
  );
}
