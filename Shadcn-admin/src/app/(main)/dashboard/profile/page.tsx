//profile
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Upload } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import apiClient from "@/lib/api-client";

// -- helper to always return a valid image src
function getProfileImageSrc(photo: string | null | undefined) {
  if (!photo) return "/woman-whisper.jpg";
  if (photo.startsWith("http")) return photo;
  return photo.startsWith("/") ? photo : "/" + photo;
}

const COUNTRY_LIST = [
  "India",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "China",
  "Brazil",
  "South Africa",
  "Italy",
  "Spain",
  "Netherlands",
  "Sweden",
];

export default function AdminProfilePage() {
  const [editOpen, setEditOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  // For country typeahead in modal
  const [countryQuery, setCountryQuery] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    city: "",
    country: "",
    photo: null as string | null,
  });

  // Fetch admin id from localStorage
  useEffect(() => {
    const adminId = localStorage.getItem("admin_id");
    if (!adminId) return;

    apiClient
      .get(`/api/admins/${adminId}/`)
      .then((res) => {
        const data = res.data;
        setFormData({
          id: data.id || "",
          email: data.email || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          city: data.city || "",
          country: data.country || "",
          photo: data.photo || null,
        });
        // Update localStorage (for name, email, photo) for use in AccountSwitcher
        localStorage.setItem("admin_name", (data.first_name || "") + (data.last_name ? ` ${data.last_name}` : ""));
        localStorage.setItem("admin_email", data.email || "");
        localStorage.setItem("admin_photo", data.photo || "/avatars/neutral.jpg");
      })
      .catch(() => {
        toast.error("Could not fetch profile.");
      });
  }, []);

  // Country dropdown close on click away
  useEffect(() => {
    function handleClick() {
      setShowCountryDropdown(false);
    }
    if (showCountryDropdown) {
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [showCountryDropdown]);

  const handleChange = (e: any) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleProfileUpdate = async () => {
    const adminId = localStorage.getItem("admin_id");
    if (!adminId) return;

    try {
      await apiClient.put(`/api/admins/update/${adminId}/`, formData);
      toast.success("Profile updated successfully");
      // Update name/email in localStorage
      localStorage.setItem(
        "admin_name",
        (formData.first_name || "") + (formData.last_name ? ` ${formData.last_name}` : ""),
      );
      localStorage.setItem("admin_email", formData.email || "");
      window.dispatchEvent(new Event("profile-photo-changed")); // for completeness, fire event for name/email change
      setEditOpen(false);
    } catch (err) {
      toast.error("Profile update failed");
    }
  };

  const handlePasswordChange = async (e: any) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await apiClient.post("/api/admins/password/change/", {
        new_password1: newPassword,
        new_password2: confirmPassword,
      });
      toast.success("Password changed successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error("Password change failed");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedPhoto(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("border-primary");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("border-primary");
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("border-primary");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedPhoto(e.dataTransfer.files[0]);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) {
      toast.error("Please select a photo to upload.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("photo", selectedPhoto);

    try {
      const res = await apiClient.post(`/api/admins/photo/upload/`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = res.data;

      toast.success("Photo uploaded successfully!");
      setFormData((prev) => ({
        ...prev,
        photo: result.photo_url ?? prev.photo,
      }));
      // ---- LOCAL STORAGE UPDATE ----
      localStorage.setItem("admin_photo", result.photo_url);
      window.dispatchEvent(new Event("profile-photo-changed"));
      // -----------------------------
      setSelectedPhoto(null);
      setPhotoModalOpen(false);
    } catch (error) {
      toast.error("An error occurred during photo upload.");
    }
  };

  return (
    <div className="p-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-4 grid grid-cols-1 items-start gap-4 xl:grid-cols-[70%_30%]">
        {/* Profile Card */}
        <Card className="@container/card h-full min-h-[410px]">
          <CardHeader>
            <CardTitle>Admin Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="flex-shrink-0">
                <Image
                  src={getProfileImageSrc(formData.photo)}
                  alt="Admin Avatar"
                  width={72}
                  height={72}
                  className="rounded-full border object-cover"
                  unoptimized={process.env.NODE_ENV === "development"}
                />
              </div>
              <div className="grid flex-1 grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <div>
                  <div className="mb-0.5 text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                    First Name
                  </div>
                  <div className="text-sm text-zinc-800 dark:text-zinc-200">
                    {formData.first_name || <span className="text-zinc-400 dark:text-zinc-600">N/A</span>}
                  </div>
                </div>
                <div>
                  <div className="mb-0.5 text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                    Last Name
                  </div>
                  <div className="text-sm text-zinc-800 dark:text-zinc-200">
                    {formData.last_name || <span className="text-zinc-400 dark:text-zinc-600">N/A</span>}
                  </div>
                </div>
                <div>
                  <div className="mb-0.5 text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Email</div>
                  <div className="text-sm break-all text-zinc-800 dark:text-zinc-200">
                    {formData.email || <span className="text-zinc-400 dark:text-zinc-600">N/A</span>}
                  </div>
                </div>
                <div>
                  <div className="mb-0.5 text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Phone</div>
                  <div className="text-sm text-zinc-800 dark:text-zinc-200">
                    {formData.phone || <span className="text-zinc-400 dark:text-zinc-600">N/A</span>}
                  </div>
                </div>
                <div>
                  <div className="mb-0.5 text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-400">City</div>
                  <div className="text-sm text-zinc-800 dark:text-zinc-200">
                    {formData.city || <span className="text-zinc-400 dark:text-zinc-600">N/A</span>}
                  </div>
                </div>
                <div>
                  <div className="mb-0.5 text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Country</div>
                  <div className="text-sm text-zinc-800 dark:text-zinc-200">
                    {formData.country || <span className="text-zinc-400 dark:text-zinc-600">N/A</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-2">
              {/* Update Photo Dialog */}
              <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Update Photo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader className="pb-4">
                    <DialogTitle>Update Photo</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <label
                      htmlFor="photo-upload"
                      className="text-muted-foreground hover:border-primary flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-6"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className="mb-2 h-8 w-8" />
                      <span>Drag and drop or click to select a photo</span>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                    {selectedPhoto && (
                      <div className="text-center text-sm">
                        Selected: <span className="font-medium">{selectedPhoto.name}</span>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="button" onClick={handlePhotoUpload} disabled={!selectedPhoto}>
                      Upload
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Edit Details Dialog */}
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Update Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Admin Details</DialogTitle>
                    <DialogDescription>Update your profile info below.</DialogDescription>
                  </DialogHeader>
                  <form
                    className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleProfileUpdate();
                    }}
                  >
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="border border-zinc-400 bg-white focus:border-zinc-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="border border-zinc-400 bg-white focus:border-zinc-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="border border-zinc-400 bg-white focus:border-zinc-600"
                      />
                    </div>
                    {/* Phone with react-phone-input-2 */}
                    <div className="col-span-2 space-y-1">
                      <Label>Phone</Label>
                      <PhoneInput
                        country={"in"}
                        value={formData.phone}
                        onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
                        inputProps={{
                          name: "phone",
                          autoComplete: "off",
                        }}
                        inputClass="w-full bg-white border border-zinc-400 focus:border-zinc-600"
                        buttonClass="bg-white"
                        containerClass="rounded"
                      />
                    </div>
                    {/* City */}
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="border border-zinc-400 bg-white focus:border-zinc-600"
                      />
                    </div>
                    {/* Country with Typeahead */}
                    <div className="relative col-span-2 space-y-1">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => {
                          handleChange(e);
                          setCountryQuery(e.target.value);
                          setShowCountryDropdown(true);
                        }}
                        autoComplete="off"
                        className="border border-zinc-400 bg-white focus:border-zinc-600"
                      />
                      {showCountryDropdown && countryQuery && (
                        <div className="absolute z-10 max-h-40 w-full overflow-auto rounded border bg-white shadow">
                          {COUNTRY_LIST.filter((name) => name.toLowerCase().includes(countryQuery.toLowerCase())).map(
                            (name) => (
                              <div
                                key={name}
                                className="cursor-pointer px-3 py-1 hover:bg-blue-100"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, country: name }));
                                  setCountryQuery(name);
                                  setShowCountryDropdown(false);
                                }}
                              >
                                {name}
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </form>
                  <DialogFooter>
                    <Button type="button" onClick={handleProfileUpdate}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="@container/card flex h-full min-h-[410px] flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Change Password</CardTitle>
            <p className="text-muted-foreground mt-2 text-sm">
              Please enter a strong password with at least one uppercase letter, one number, and one special character.
            </p>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center">
            <form onSubmit={handlePasswordChange} className="flex flex-1 flex-col justify-center gap-6">
              <div className="space-y-1">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="text-muted-foreground absolute top-2/4 right-3 -translate-y-1/2"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="text-muted-foreground absolute top-2/4 right-3 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
