"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Eye, EyeOff, X, Plus } from "lucide-react";
import { calculatePasswordStrength, validateEmail, validatePhone, formatPhoneForInput, validateUrl, sanitizeUrl } from "@/lib/validation";
import { CreatorRegistrationData } from "@/types";
import { getBrowserClient } from "@/lib/supabase-browser";

const institutions = [
  { id: "ktu", name: "Koforidua Technical University (KTU)", location: "Koforidua, Eastern Region" },
  { id: "knust", name: "Kwame Nkrumah University of Science and Technology (KNUST)", location: "Kumasi, Ashanti Region" },
  { id: "ug", name: "University of Ghana (UG)", location: "Legon, Greater Accra Region" },
  { id: "ucc", name: "University of Cape Coast (UCC)", location: "Cape Coast, Central Region" },
  { id: "uew", name: "University of Education, Winneba (UEW)", location: "Winneba, Central Region" },
  { id: "upsa", name: "University of Professional Studies, Accra (UPSA)", location: "Accra, Greater Accra Region" },
  { id: "atu", name: "Accra Technical University (ATU)", location: "Accra, Greater Accra Region" },
  { id: "tatu", name: "Tamale Technical University (TaTU)", location: "Tamale, Northern Region" },
  { id: "htu", name: "Ho Technical University (HTU)", location: "Ho, Volta Region" },
  { id: "other", name: "Other / Professional", location: "Ghana" },
];

const levels = [
  { value: "100", label: "Level 100 (First Year)" },
  { value: "200", label: "Level 200 (Second Year)" },
  { value: "300", label: "Level 300 (Third Year)" },
  { value: "400", label: "Level 400 (Final Year)" },
  { value: "500", label: "Level 500 (Postgraduate)" },
  { value: "postgrad", label: "Postgraduate" },
  { value: "alumni", label: "Alumni" },
  { value: "professional", label: "Working Professional" },
  { value: "other", label: "Other" },
];

const creatorTypes = [
  { value: "photographer", label: "Photographer" },
  { value: "videographer", label: "Videographer" },
  { value: "video-editor", label: "Video Editor" },
  { value: "graphic-designer", label: "Graphic Designer" },
  { value: "model", label: "Model" },
  { value: "presenter", label: "Presenter" },
  { value: "content-creator", label: "Content Creator" },
  { value: "influencer", label: "Influencer" },
  { value: "social-media-manager", label: "Social Media Manager" },
  { value: "writer", label: "Writer" },
  { value: "other", label: "Other" },
];

const availabilityOptions = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "freelance", label: "Freelance / Project-based" },
  { value: "student", label: "Student (available around studies)" },
];

const suggestedSkills = [
  "Portrait Photography", "Event Photography", "Wedding Photography",
  "Documentary Filmmaking", "Cinematography", "Drone Operation",
  "Premiere Pro", "DaVinci Resolve", "After Effects",
  "Photoshop", "Illustrator", "Canva",
  "Social Media Strategy", "Content Writing", "Video Scripting",
  "MC / Hosting", "Voice Over", "Modeling",
];

interface FormErrors {
  [key: string]: string | undefined;
}

export default function CreatorRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreatorRegistrationData>({
    fullName: "",
    email: "",
    whatsapp: "",
    institutionId: "",
    level: "",
    password: "",
    confirmPassword: "",
    profilePhoto: null,
    creatorTypeId: "",
    bio: "",
    instagram: "",
    tiktok: "",
    linkedin: "",
    portfolioUrl: "",
    additionalPortfolioUrl: "",
    skills: [],
    availability: "freelance",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const supabase = getBrowserClient();

  const passwordStrength = calculatePasswordStrength(formData.password);

  const validateField = (name: string, value: unknown): string | undefined => {
    switch (name) {
      case "fullName":
        if (!value || (value as string).trim().length < 2) return "Full name must be at least 2 characters";
        break;
      case "email":
        if (!value || !validateEmail(value as string)) return "Please enter a valid email address";
        break;
      case "whatsapp":
        if (!value || !validatePhone(value as string)) return "Enter a valid WhatsApp number (e.g., 024xxxxxxx)";
        break;
      case "institutionId":
        if (!value) return "Please select your institution";
        break;
      case "level":
        if (!value) return "Please select your level of study";
        break;
      case "password":
        if (!value || (value as string).length < 8) return "Password must be at least 8 characters";
        if (passwordStrength.score < 2) return "Password is too weak. Mix uppercase, lowercase, numbers, and symbols";
        break;
      case "confirmPassword":
        if (!value || value !== formData.password) return "Passwords do not match";
        break;
      case "creatorTypeId":
        if (!value) return "Please select your creator type";
        break;
      case "bio":
        if (!value || (value as string).trim().length < 20) return "Please write a bio of at least 20 characters";
        break;
      case "portfolioUrl":
        if (value && !validateUrl(sanitizeUrl(value as string))) return "Please enter a valid URL";
        break;
      case "additionalPortfolioUrl":
        if (value && !validateUrl(sanitizeUrl(value as string))) return "Please enter a valid URL";
        break;
    }
    return undefined;
  };

  const handleChange = (name: string, value: string | string[] | File | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
    if (name === "password") {
      setFormData((prev) => ({ ...prev, confirmPassword: "" }));
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name as keyof CreatorRegistrationData]) }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, profilePhoto: "Please select an image file" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, profilePhoto: "Image must be less than 5MB" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setProfilePhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    handleChange("profilePhoto", file);
    setErrors((prev) => ({ ...prev, profilePhoto: undefined }));
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      handleChange("skills", [...formData.skills, trimmed]);
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    handleChange("skills", formData.skills.filter((s) => s !== skill));
  };

  const validateStep = (step: number): boolean => {
    const stepFields: Record<number, string[]> = {
      1: ["fullName", "email", "whatsapp", "institutionId", "level", "password", "confirmPassword"],
      2: ["creatorTypeId", "bio"],
      3: [],
    };
    const fields = stepFields[step] || [];
    const newErrors: FormErrors = {};
    let valid = true;
    fields.forEach((field) => {
      const error = validateField(field, formData[field as keyof CreatorRegistrationData]);
      if (error) {
        newErrors[field] = error;
        valid = false;
        setTouched((prev) => ({ ...prev, [field]: true }));
      }
    });
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return valid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");

    const newTouched: Record<string, boolean> = {};
    const newErrors: FormErrors = {};
    let hasErrors = false;

    Object.keys(formData).forEach((key) => {
      newTouched[key] = true;
      const error = validateField(key, formData[key as keyof CreatorRegistrationData]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);

    if (hasErrors) {
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: "creator",
            whatsapp: formData.whatsapp,
            institution_id: formData.institutionId,
            level: formData.level,
          },
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (error) {
        if (error.message.includes("already registered") || error.message.includes("already exists")) {
          setSubmitError("An account with this email already exists. Try signing in instead.");
        } else {
          setSubmitError(error.message);
        }
        return;
      }

      if (data.user) {
        const profileUpdates: Record<string, string | null> = {
          full_name: formData.fullName,
          whatsapp: formData.whatsapp,
          institution_id: formData.institutionId,
          level: formData.level,
          role: "creator",
        };
        if (formData.instagram) profileUpdates.instagram = sanitizeUrl(formData.instagram.startsWith("@") ? `https://instagram.com/${formData.instagram.slice(1)}` : formData.instagram);
        if (formData.tiktok) profileUpdates.tiktok = sanitizeUrl(formData.tiktok.startsWith("@") ? `https://tiktok.com/@${formData.tiktok.slice(1)}` : formData.tiktok);
        if (formData.linkedin) profileUpdates.linkedin = sanitizeUrl(formData.linkedin);
        if (formData.bio) profileUpdates.bio = formData.bio;

        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({ id: data.user.id, ...profileUpdates });
        if (profileError) console.error("Profile creation error:", profileError);

        if (formData.profilePhoto) {
          const fileExt = formData.profilePhoto.name.split(".").pop();
          const fileName = `${data.user.id}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, formData.profilePhoto, { upsert: true });
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from("avatars")
              .getPublicUrl(fileName);
            await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", data.user.id);
          }
        }

        const { data: creatorData, error: creatorError } = await supabase
          .from("creators")
          .insert({
            profile_id: data.user.id,
            creator_type_id: formData.creatorTypeId || null,
            bio: formData.bio,
            portfolio_url: formData.portfolioUrl ? sanitizeUrl(formData.portfolioUrl) : null,
            additional_portfolio_url: formData.additionalPortfolioUrl ? sanitizeUrl(formData.additionalPortfolioUrl) : null,
            skills: formData.skills,
            availability: formData.availability,
            is_public: true,
            rating: 0,
            completed_projects: 0,
          })
          .select("id")
          .single();

        if (creatorError) {
          console.error("Creator creation error:", creatorError);
        } else if (creatorData) {
          const socialLinks = [];
          if (formData.instagram) socialLinks.push({ creator_id: creatorData.id, platform: "instagram", url: sanitizeUrl(formData.instagram.startsWith("@") ? `https://instagram.com/${formData.instagram.slice(1)}` : formData.instagram), display_order: 0 });
          if (formData.tiktok) socialLinks.push({ creator_id: creatorData.id, platform: "tiktok", url: sanitizeUrl(formData.tiktok.startsWith("@") ? `https://tiktok.com/@${formData.tiktok.slice(1)}` : formData.tiktok), display_order: 1 });
          if (formData.linkedin) socialLinks.push({ creator_id: creatorData.id, platform: "linkedin", url: sanitizeUrl(formData.linkedin), display_order: 2 });
          if (formData.portfolioUrl) socialLinks.push({ creator_id: creatorData.id, platform: "portfolio", url: sanitizeUrl(formData.portfolioUrl), display_order: 3 });

          if (socialLinks.length > 0) {
            const { error: linksError } = await supabase
              .from("creator_social_links")
              .insert(socialLinks);
            if (linksError) console.error("Social links error:", linksError);
          }
        }

        const { error: memberError } = await supabase
          .from("members")
          .insert({
            profile_id: data.user.id,
            institution_id: formData.institutionId,
            level: formData.level,
            interests: [],
          });
        if (memberError) console.error("Member creation error:", memberError);
      }

      router.push("/auth/verify-email?email=" + encodeURIComponent(formData.email));
    } catch (error) {
      console.error("Registration error:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const stepLabels = ["Account", "Creator Details", "Portfolio & Social"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-yaaq">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="YAAQ World Home">
              <span className="font-display text-xl font-bold text-foreground">
                YAAQ<span className="text-yaaq-gold">World</span>
              </span>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/auth/register" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
              ← Back to choose role
            </Link>
            <div className="text-center">
              <span className="inline-block mb-4 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-yaaq-gold bg-yaaq-gold/10 rounded-full">
                CREATOR REGISTRATION
              </span>
              <h1 className="font-display text-3xl font-bold text-foreground">Join as a Creator</h1>
              <p className="mt-2 text-muted-foreground">Showcase your talent and connect with YAAQ World opportunities</p>
            </div>

            <div className="mt-8 flex items-center justify-between max-w-lg mx-auto" aria-label="Registration progress">
              {stepLabels.map((label, index) => {
                const stepNum = index + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;
                return (
                  <div key={label} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold border-2 transition-colors ${
                          isCompleted
                            ? "bg-yaaq-gold border-yaaq-gold text-yaaq-navy"
                            : isActive
                            ? "border-yaaq-gold text-yaaq-gold"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? "✓" : stepNum}
                      </div>
                      {index < stepLabels.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-yaaq-gold" : "bg-border"}`} />
                      )}
                    </div>
                    <span className={`mt-2 text-xs text-center ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Card>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {submitError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-lg font-semibold">Account Information</h2>
                      <p className="text-sm text-muted-foreground">Required fields are marked with *</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        onBlur={() => handleBlur("fullName")}
                        error={touched.fullName ? errors.fullName : undefined}
                        disabled={isLoading}
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        onBlur={() => handleBlur("email")}
                        error={touched.email ? errors.email : undefined}
                        disabled={isLoading}
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="+233 24 123 4567"
                        value={formData.whatsapp}
                        onChange={(e) => handleChange("whatsapp", formatPhoneForInput(e.target.value))}
                        onBlur={() => handleBlur("whatsapp")}
                        error={touched.whatsapp ? errors.whatsapp : undefined}
                        disabled={isLoading}
                        autoComplete="tel"
                        inputMode="tel"
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="institutionId">Institution *</Label>
                        <Select
                          value={formData.institutionId}
                          onValueChange={(value) => handleChange("institutionId", value)}
                          disabled={isLoading}
                        >
                          <SelectTrigger error={touched.institutionId ? errors.institutionId : undefined}><SelectValue placeholder="Select institution" /></SelectTrigger>
                          <SelectContent>
                            {institutions.map((inst) => (
                              <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="level">Level of Study *</Label>
                        <Select
                          value={formData.level}
                          onValueChange={(value) => handleChange("level", value)}
                          disabled={isLoading}
                        >
                          <SelectTrigger error={touched.level ? errors.level : undefined}><SelectValue placeholder="Select level" /></SelectTrigger>
                          <SelectContent>
                            {levels.map((lvl) => (
                              <SelectItem key={lvl.value} value={lvl.value}>{lvl.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                          onBlur={() => handleBlur("password")}
                          error={touched.password ? errors.password : undefined}
                          disabled={isLoading}
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {formData.password && (
                        <div className="space-y-1">
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-300 rounded-full"
                              style={{
                                width: `${((passwordStrength.score + 1) / 5) * 100}%`,
                                backgroundColor: passwordStrength.score <= 1 ? "#ef4444" : passwordStrength.score === 2 ? "#eab308" : "#22c55e",
                              }}
                            />
                          </div>
                          <p className={`text-xs font-medium ${passwordStrength.color}`}>
                            Password strength: {passwordStrength.label}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange("confirmPassword", e.target.value)}
                          onBlur={() => handleBlur("confirmPassword")}
                          error={touched.confirmPassword ? errors.confirmPassword : undefined}
                          disabled={isLoading}
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-lg font-semibold">Creator Details</h2>
                      <p className="text-sm text-muted-foreground">Tell us about your creative work</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="creatorTypeId">Creator / Talent Type *</Label>
                      <Select
                        value={formData.creatorTypeId}
                        onValueChange={(value) => handleChange("creatorTypeId", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger error={touched.creatorTypeId ? errors.creatorTypeId : undefined}><SelectValue placeholder="Select your creator type" /></SelectTrigger>
                        <SelectContent>
                          {creatorTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Short Professional Bio * <span className="text-muted-foreground font-normal">(min. 20 characters)</span></Label>
                      <Textarea
                        id="bio"
                        placeholder="Describe your creative work, experience, and what you're passionate about..."
                        value={formData.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        onBlur={() => handleBlur("bio")}
                        error={touched.bio ? errors.bio : undefined}
                        disabled={isLoading}
                        rows={5}
                        maxLength={500}
                        required
                      />
                      <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/500</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability *</Label>
                      <Select
                        value={formData.availability}
                        onValueChange={(value) => handleChange("availability", value as CreatorRegistrationData["availability"])}
                        disabled={isLoading}
                      >
                        <SelectTrigger><SelectValue placeholder="How available are you?" /></SelectTrigger>
                        <SelectContent>
                          {availabilityOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profilePhoto">Profile Photo {formData.profilePhoto ? "" : "(Optional)"}</Label>
                      <div className="flex items-center gap-4">
                        {profilePhotoPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element -- local data URL preview from FileReader
                          <img src={profilePhotoPreview} alt="Profile preview" className="h-20 w-20 rounded-full object-cover border-2 border-border" />
                        ) : (
                          <div className="h-20 w-20 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs text-center px-2">
                            No photo
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            type="file"
                            id="profilePhoto"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="sr-only"
                            disabled={isLoading}
                          />
                          <Label htmlFor="profilePhoto" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-input rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                            Choose Photo
                          </Label>
                          {profilePhotoPreview && (
                            <button
                              type="button"
                              onClick={() => { setProfilePhotoPreview(null); handleChange("profilePhoto", null); }}
                              className="ml-3 text-sm text-destructive hover:underline"
                            >
                              Remove
                            </button>
                          )}
                          {errors.profilePhoto && <p className="mt-1 text-sm text-destructive">{errors.profilePhoto}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-lg font-semibold">Portfolio & Social Links</h2>
                      <p className="text-sm text-muted-foreground">Help YAAQ World discover your work</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="portfolioUrl">Portfolio URL {<span className="text-muted-foreground font-normal">(optional)</span>}</Label>
                      <Input
                        id="portfolioUrl"
                        type="url"
                        placeholder="https://yourportfolio.com"
                        value={formData.portfolioUrl}
                        onChange={(e) => handleChange("portfolioUrl", e.target.value)}
                        onBlur={() => handleBlur("portfolioUrl")}
                        error={touched.portfolioUrl ? errors.portfolioUrl : undefined}
                        disabled={isLoading}
                        inputMode="url"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalPortfolioUrl">Additional Work URL {<span className="text-muted-foreground font-normal">(optional)</span>}</Label>
                      <Input
                        id="additionalPortfolioUrl"
                        type="url"
                        placeholder="https://behance.net/yourprofile or similar"
                        value={formData.additionalPortfolioUrl}
                        onChange={(e) => handleChange("additionalPortfolioUrl", e.target.value)}
                        onBlur={() => handleBlur("additionalPortfolioUrl")}
                        error={touched.additionalPortfolioUrl ? errors.additionalPortfolioUrl : undefined}
                        disabled={isLoading}
                        inputMode="url"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram *</Label>
                        <Input
                          id="instagram"
                          type="text"
                          placeholder="@username"
                          value={formData.instagram}
                          onChange={(e) => handleChange("instagram", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tiktok">TikTok *</Label>
                        <Input
                          id="tiktok"
                          type="text"
                          placeholder="@username"
                          value={formData.tiktok}
                          onChange={(e) => handleChange("tiktok", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn *</Label>
                        <Input
                          id="linkedin"
                          type="url"
                          placeholder="linkedin.com/in/username"
                          value={formData.linkedin}
                          onChange={(e) => handleChange("linkedin", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Skills <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Add a skill and press Enter"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkill(newSkill);
                            }
                          }}
                          disabled={isLoading}
                        />
                        <Button type="button" variant="outline" onClick={() => addSkill(newSkill)} disabled={!newSkill.trim() || isLoading}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {formData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                                aria-label={`Remove ${skill}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestedSkills
                            .filter((s) => !formData.skills.includes(s))
                            .slice(0, 8)
                            .map((skill) => (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => addSkill(skill)}
                                className="px-2 py-1 text-xs rounded-full border border-border text-muted-foreground hover:border-yaaq-gold hover:text-yaaq-gold transition-colors"
                              >
                                + {skill}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading} className="flex-1">
                      Back
                    </Button>
                  )}
                  {currentStep < totalSteps ? (
                    <Button type="button" variant="gold" onClick={nextStep} className="flex-1">
                      Continue
                    </Button>
                  ) : (
                    <Button type="submit" variant="gold" isLoading={isLoading} className="flex-1" size="lg">
                      Create Creator Account
                    </Button>
                  )}
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-yaaq-gold hover:underline font-medium">Sign in</Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container-yaaq text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} YAAQ World. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
