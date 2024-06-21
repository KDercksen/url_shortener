"use client";

import { shorten } from "@/actions/shorten";
import { urlSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CopyIcon,
  Infinity,
  LoaderCircle,
  SparklesIcon,
  SquareCheckBigIcon,
} from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export default function ShortenForm() {
  const form = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: { url: "", expiry: 7 },
  });

  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCopySuccessful, setShowCopySuccessful] = useState<boolean>(false);

  const onSubmit = async (values: z.infer<typeof urlSchema>) => {
    setLoading(true);
    const id = await shorten(values.url);
    if (id) {
      setResult(id);
      setError(false);
    } else {
      setResult(null);
      setError(true);
    }
    setLoading(false);
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
          <FormField
            control={form.control}
            name="expiry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    className="justify-between"
                    value={field.value?.toString() ?? "-1"}
                    onValueChange={(value) => {
                      if (value) {
                        const i = parseInt(value);
                        field.onChange(i > 0 ? i : null);
                      }
                    }}
                  >
                    <ToggleGroupItem value={"7"}>7 days</ToggleGroupItem>
                    <ToggleGroupItem value={"30"}>30 days</ToggleGroupItem>
                    <ToggleGroupItem value={"-1"}>
                      <Infinity className="size-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <LoaderCircle className="size-4 mr-2 animate-spin" />
            ) : (
              <SparklesIcon className="size-4 mr-2" />
            )}
            Go
          </Button>
        </form>
      </Form>
      <div className="pt-2 h-6 w-full">
        {result && (
          <div
            onClick={onCopyResult}
            className="flex hover:cursor-pointer hover:text-gray-500 flex-row justify-center items-center w-full text-sm text-gray-700"
          >
            {process.env.NEXT_PUBLIC_URL}/{result}
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
