import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dreame L50 Ultra",
  description: "Dreame L50 Ultra product experience.",
};

export default function Home() {
  return (
    <iframe
      className="prototype-frame"
        src="/prototype.html?v=13"
      title="Dreame L50 Ultra"
    />
  );
}
