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
      <Button asChild size="lg" variant="glass">
        <Link href="/contact">Contact Us Directly</Link>
      </Button>
    </div>
  );
}