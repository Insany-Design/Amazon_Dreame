import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dreame L50 Ultra",
  description: "Dreame L50 Ultra product experience.",
};

export default function Home() {
  redirect("/dreame-l50-ultra.html");
}
