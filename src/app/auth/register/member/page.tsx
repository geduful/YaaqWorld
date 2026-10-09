"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff, User, Mail, Phone, GraduationCap, Lock, Image as ImageIcon } from "lucide-react";
import { calculatePasswordStrength, validateEmail, validatePhone, formatPhoneForInput } from "@/lib/validation";
import { MemberRegistrationData } from "@/types";
import { getBrowserClient } from "@/lib/supabase-browser";
import { isUuid, loadInstitutions, InstitutionOption } from "@/lib/institutions";

const institutions = [
  { id: "ktu", name: "Koforidua Technical University (KTU)", shortName: "KTU", location: "Koforidua, Eastern Region" },
  { id: "knust", name: "Kwame Nkrumah University of Science and Technology (KNUST)", shortName: "KNUST", location: "Kumasi, Ashanti Region" },
  { id: "ug", name: "University of Ghana (UG)", shortName: "UG", location: "Legon, Greater Accra Region" },
  { id: "ucc", name: "University of Cape Coast (UCC)", shortName: "UCC", location: "Cape Coast, Central Region" },
  { id: "uew", name: "University of Education, Winneba (UEW)", shortName: "UEW", location: "Winneba, Central Region" },
  { id: "uat", name: "University of Professional Studies, Accra (UPSA)", shortName: "UPSA", location: "Accra, Greater Accra Region" },
  { id: "atu", name: "Accra Technical University (ATU)", shortName: "ATU", location: "Accra, Greater Accra Region" },
  { id: "tum", name: "Tamale Technical University (TaTU)", shortName: "TaTU", location: "Tamale, Northern Region" },
  { id: "htc", name: "Ho Technical University (HTU)", shortName: "HTU", location: "Ho, Volta Region" },
  { id: "sunyani", name: "Sunyani Technical University (STU)", shortName: "STU", location: "Sunyani, Bono Region" },
  { id: "bolga", name: "Bolgatanga Technical University (BTU)", shortName: "BTU", location: "Bolgatanga, Upper East Region" },
  { id: "wa", name: "Wa Technical University (WTU)", shortName: "WTU", location: "Wa, Upper West Region" },
  { id: "other", name: "Other Institution", shortName: "Other", location: "Ghana" },
];

const levels = [
  { value: "100", label: "Level 100 (First Year)" },
  { value: "200", label: "Level 200 (Second Year)" },
  { value: "300", label: "Level 300 (Third Year)" },
  { value: "400", label: "Level 400 (Final Year)" },
  { value: "500", label: "Level 500 (Postgraduate)" },
  { value: "postgrad", label: "Postgraduate" },
  { value: "alumni", label: "Alumni" },
  { value: "other", label: "Other" },
];

export default function MemberRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<MemberRegistrationData>({
    fullName: "",
    email: "",
    whatsapp: "",
    institutionId: "",
    level: "",
    password: "",
    confirmPassword: "",
    profilePhoto: null,
    instagram: "",
    linkedin: "",
    tiktok: "",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof MemberRegistrationData, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);

  const supabase = getBrowserClient();

  const [institutionOptions, setInstitutionOptions] = useState<InstitutionOption[]>(institutions);

  useEffect(() => {
    let active = true;
    loadInstitutions(supabase, institutions).then(({ options, idMap }) => {
      if (!active) return;
      setInstitutionOptions(options);
      setFormData((prev) => {
        const mapped = idMap[prev.institutionId];
        return mapped ? { ...prev, institutionId: mapped } : prev;
      });
    });
    return () => {
      active = false;
    };
  }, [supabase]);

  const passwordStrength = calculatePasswordStrength(formData.password);

  const validateField = (name: keyof MemberRegistrationData, value: string | File | null): string | undefined => {
    switch (name) {
      case "fullName":
        if (!value || (value as string).trim().length < 2) {
          return "Full name must be at least 2 characters";
        }
        break;
      case "email":
        if (!value || !validateEmail(value as string)) {
          return "Please enter a valid email address";
        }
        break;
      case "whatsapp":
        if (!value || !validatePhone(value as string)) {
          return "Please enter a valid WhatsApp number (e.g., 024xxxxxxx or +23324xxxxxxx)";
        }
        break;
      case "institutionId":
        if (!value) {
          return "Please select your institution";
        }
        break;
      case "level":
        if (!value) {
          return "Please select your level of study";
        }
        break;
      case "password":
        if (!value || (value as string).length < 8) {
          return "Password must be at least 8 characters";
        }
        if (passwordStrength.score < 2) {
          return "Password is too weak. Use uppercase, lowercase, numbers, and symbols";
        }
        break;
      case "confirmPassword":
        if (!value || value !== formData.password) {
          return "Passwords do not match";
        }
        break;
    }
    return undefined;
  };

  const handleChange = (name: keyof MemberRegistrationData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
    
    if (name === "password") {
      setFormData((prev) => ({ ...prev, confirmPassword: "" }));
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleBlur = (name: keyof MemberRegistrationData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name] ?? null);
    setErrors((prev) => ({ ...prev, [name]: error }));
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

  const handleWhatsAppChange = (value: string) => {
    const formatted = formatPhoneForInput(value);
    handleChange("whatsapp", formatted);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");

    const newTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach((key) => {
      newTouched[key] = true;
    });
    setTouched(newTouched);

    const newErrors: Record<string, string | undefined> = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof MemberRegistrationData>).forEach((key) => {
      const error = validateField(key, formData[key] ?? null);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (hasErrors) return;

    setIsLoading(true);

    const institutionId = isUuid(formData.institutionId) ? formData.institutionId : null;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: "member",
            whatsapp: formData.whatsapp || null,
            institution_id: institutionId,
            level: formData.level || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (error) {
        if (error.message.includes("already registered") || error.message.includes("already exists")) {
          setSubmitError("An account with this email already exists. Try signing in instead.");
        } else if (error.message.includes("Password should be")) {
          setSubmitError("Please choose a stronger password (at least 8 characters).");
        } else if (error.message.includes("rate limit") || error.message.includes("Security purposes")) {
          setSubmitError("Too many attempts. Please wait a moment and try again.");
        } else if (error.message.includes("valid email")) {
          setSubmitError("Please enter a valid email address.");
        } else {
          setSubmitError("Registration failed. Please try again.");
        }
        return;
      }

      if (data.user) {
        const profileUpdates: Record<string, string | null> = {
          full_name: formData.fullName,
          whatsapp: formData.whatsapp || null,
          institution_id: institutionId,
          level: formData.level || null,
          role: "member",
        };

        if (formData.instagram) profileUpdates.instagram = formData.instagram;
        if (formData.linkedin) profileUpdates.linkedin = formData.linkedin;
        if (formData.tiktok) profileUpdates.tiktok = formData.tiktok;

        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({ id: data.user.id, ...profileUpdates });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        if (formData.profilePhoto) {
          const fileExt = (formData.profilePhoto.name.split(".").pop() || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          const fileName = `${data.user.id}/avatar.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, formData.profilePhoto, { upsert: true });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from("avatars")
              .getPublicUrl(fileName);
            
            await supabase
              .from("profiles")
              .update({ avatar_url: publicUrl })
              .eq("id", data.user.id);
          }
        }

        const { error: memberError } = await supabase
          .from("members")
          .insert({
            profile_id: data.user.id,
            institution_id: institutionId,
            level: formData.level,
            interests: [],
          });

        if (memberError) {
          console.error("Member creation error:", memberError);
        }
      }

      if (data.session) {
        router.push("/");
      } else {
        router.push("/auth/verify-email?email=" + encodeURIComponent(formData.email));
      }
    } catch (error) {
      console.error("Registration error:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <Link href="/auth/register" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
              ← Back to choose role
            </Link>
            <div className="text-center">
              <span className="inline-block mb-4 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-yaaq-gold bg-yaaq-gold/10 rounded-full">
                STUDENT / FAN REGISTRATION
              </span>
              <h1 className="font-display text-3xl font-bold text-foreground">Create Your Member Account</h1>
              <p className="mt-2 text-muted-foreground">Join the YAAQ World community to stay connected with campus culture</p>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Required fields are marked with *</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {submitError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-1">
                    <User className="h-4 w-4" aria-hidden="true" />
                    Full Name *
                  </Label>
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
                  <Label htmlFor="email" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Email Address *
                  </Label>
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
                  <Label htmlFor="whatsapp" className="flex items-center gap-1">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    WhatsApp Number *
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+233 24 123 4567"
                    value={formData.whatsapp}
                    onChange={(e) => handleWhatsAppChange(e.target.value)}
                    onBlur={() => handleBlur("whatsapp")}
                    error={touched.whatsapp ? errors.whatsapp : undefined}
                    disabled={isLoading}
                    autoComplete="tel"
                    inputMode="tel"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institutionId" className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" aria-hidden="true" />
                    Institution *
                  </Label>
                  <Select
                    value={formData.institutionId}
                    onValueChange={(value) => {
                      handleChange("institutionId", value);
                      setTouched((prev) => ({ ...prev, institutionId: true }));
                      setErrors((prev) => ({ ...prev, institutionId: validateField("institutionId", value) }));
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger error={touched.institutionId ? errors.institutionId : undefined}>
                      <SelectValue placeholder="Select your institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionOptions.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>
                          <div>
                            <p className="font-medium">{inst.name}</p>
                            <p className="text-xs text-muted-foreground">{inst.location}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {touched.institutionId && errors.institutionId && (
                    <p className="mt-1.5 text-sm text-destructive" role="alert">{errors.institutionId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level" className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" aria-hidden="true" />
                    Level of Study *
                  </Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => {
                      handleChange("level", value);
                      setTouched((prev) => ({ ...prev, level: true }));
                      setErrors((prev) => ({ ...prev, level: validateField("level", value) }));
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger error={touched.level ? errors.level : undefined}>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((lvl) => (
                        <SelectItem key={lvl.value} value={lvl.value}>{lvl.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {touched.level && errors.level && (
                    <p className="mt-1.5 text-sm text-destructive" role="alert">{errors.level}</p>
                  )}
                </div>

                <CardHeader className="pt-4 border-t">
                  <CardTitle className="text-lg">Account Security</CardTitle>
                  <CardDescription>Create a strong password to protect your account</CardDescription>
                </CardHeader>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-1">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    Password *
                  </Label>
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
                  <Label htmlFor="confirmPassword" className="flex items-center gap-1">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    Confirm Password *
                  </Label>
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

                <CardHeader className="pt-4 border-t">
                  <CardTitle className="text-lg">Profile Photo (Optional)</CardTitle>
                  <CardDescription>Add a photo to personalize your profile</CardDescription>
                </CardHeader>

                <div className="space-y-2">
                  <Label htmlFor="profilePhoto" className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" aria-hidden="true" />
                    Profile Photo
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {profilePhotoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element -- local data URL preview from FileReader
                        <img
                          src={profilePhotoPreview}
                          alt="Profile preview"
                          className="h-20 w-20 rounded-full object-cover border-2 border-border"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id="profilePhoto"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="sr-only"
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor="profilePhoto"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-input rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Choose Photo
                      </Label>
                      {profilePhotoPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfilePhotoPreview(null);
                            handleChange("profilePhoto", null);
                          }}
                          className="text-sm text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      )}
                      {touched.profilePhoto && errors.profilePhoto && (
                        <p className="mt-1 text-sm text-destructive" role="alert">{errors.profilePhoto}</p>
                      )}
                    </div>
                  </div>
                </div>

                <CardHeader className="pt-4 border-t">
                  <CardTitle className="text-lg">Social Links (Optional)</CardTitle>
                  <CardDescription>Add your social media profiles</CardDescription>
                </CardHeader>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
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
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      placeholder="linkedin.com/in/username"
                      value={formData.linkedin}
                      onChange={(e) => handleChange("linkedin", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input
                      id="tiktok"
                      type="text"
                      placeholder="@username"
                      value={formData.tiktok}
                      onChange={(e) => handleChange("tiktok", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" variant="gold" isLoading={isLoading}>
                  Create Account
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-yaaq-gold hover:underline font-medium">
                    Sign in
                  </Link>
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