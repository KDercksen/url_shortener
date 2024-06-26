import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blurb - Donate",
  description:
    "Donate to Blurb URL shortener to keep the service running smoothly.",
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
