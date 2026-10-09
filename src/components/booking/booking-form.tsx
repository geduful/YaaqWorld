"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getBrowserClient } from "@/lib/supabase-browser";

const serviceCategories = [
  { value: "event-coverage", label: "Event Coverage" },
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "brand-activations", label: "Brand Activations" },
  { value: "media-partnerships", label: "Media Partnerships" },
  { value: "campus-campaigns", label: "Campus Campaigns" },
  { value: "creative-consulting", label: "Creative Consulting" },
  { value: "other", label: "Other" },
];

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  organization: string;
  service: string;
  eventDate: string;
  location: string;
  details: string;
  budget?: string;
}

export function BookingForm({ initialService = "" }: { initialService?: string }) {
  const preselectedService = serviceCategories.some((c) => c.value === initialService) ? initialService : "";
  const [formData, setFormData] = React.useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    organization: "",
    service: preselectedService,
    eventDate: "",
    location: "",
    details: "",
    budget: "",
  });
  const [errors, setErrors] = React.useState<Partial<BookingFormData>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<"idle" | "success" | "error">("idle");

  const validateForm = () => {
    const newErrors: Partial<BookingFormData> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.service) newErrors.service = "Please select a service";
    if (!formData.eventDate) newErrors.eventDate = "Event date is required";
    if (!formData.location.trim()) newErrors.location = "Event location is required";
    if (!formData.details.trim()) newErrors.details = "Please provide event details";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const supabase = getBrowserClient();
      const { error: insertError } = await supabase.from("bookings").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        organization: formData.organization.trim() || null,
        service_category: formData.service,
        event_date: formData.eventDate,
        location: formData.location.trim(),
        details: formData.details.trim(),
        budget: formData.budget?.trim() || null,
        status: "new",
      });

      if (insertError) {
        setSubmitStatus("error");
      } else {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          organization: "",
          service: "",
          eventDate: "",
          location: "",
          details: "",
          budget: "",
        });
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof BookingFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof BookingFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {submitStatus === "success" && (
        <div className="rounded-lg border border-success/30 bg-success-soft p-4 text-success" role="alert">
          <p className="font-medium">Thank you! Your booking request has been submitted.</p>
          <p className="text-sm mt-1">Our team will review your request and contact you within 24 hours.</p>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive" role="alert">
          <p className="font-medium">Something went wrong. Please try again or contact us directly.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Your full name"
            required
            autoComplete="name"
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
            required
            autoComplete="email"
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="+233 XX XXX XXXX"
            required
            autoComplete="tel"
            maxLength={20}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organization">Organization / Institution</Label>
          <Input
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            placeholder="e.g., KTU SRC, Company Name"
            autoComplete="organization"
            maxLength={150}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="service">Service Required *</Label>
          <Select name="service" value={formData.service} onValueChange={(value) => handleSelectChange("service", value)}>
            <SelectTrigger id="service">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {serviceCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.service && (
            <p className="mt-1.5 text-sm text-destructive" role="alert">{errors.service}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="eventDate">Event Date *</Label>
          <Input
            id="eventDate"
            name="eventDate"
            type="date"
            value={formData.eventDate}
            onChange={handleChange}
            error={errors.eventDate}
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Event Location *</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            error={errors.location}
            placeholder="Venue, City"
            required
            maxLength={200}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Estimated Budget (Optional)</Label>
        <Input
          id="budget"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          placeholder="e.g., GHS 5,000 - 10,000"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Event Details *</Label>
        <Textarea
          id="details"
          name="details"
          value={formData.details}
          onChange={handleChange}
          error={errors.details}
          placeholder="Describe your event, requirements, expected attendance, and any specific needs..."
          rows={5}
          required
          maxLength={2000}
        />
      </div>

      <Button type="submit" className="w-full md:w-auto" size="lg" isLoading={isSubmitting}>
        Submit Booking Request
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        By submitting this form, you agree to our <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a> and <a href="/terms" className="underline hover:text-foreground">Terms of Use</a>.
      </p>
    </form>
  );
}