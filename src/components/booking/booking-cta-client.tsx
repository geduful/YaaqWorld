"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { socialIcons } from "@/lib/icons";

export function BookingCTAClient() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        size="lg"
        variant="gold"
        className="gap-2"
        onClick={() => document.getElementById("booking-form-heading")?.scrollIntoView({ behavior: "smooth" })}
      >
        Submit Booking Request
        <socialIcons.arrowRight className="h-5 w-5" />
      </Button>
      <Link href="/contact">
        <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
          Contact Us Directly
        </Button>
      </Link>
    </div>
  );
}