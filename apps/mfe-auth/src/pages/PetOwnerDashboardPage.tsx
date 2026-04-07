import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfileNameForRole, logout, saveProfileName } from "../lib/session";
import { toast } from "../lib/use-toast";
import {
  Home, PawPrint, Brain, MapPin, User, LogOut, Plus, Trash2, Save,
  Send, AlertTriangle, Calendar, Clock, ChevronRight, X, Menu,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Alert } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { cn } from "../lib/utils";
import petBuddyImage from "../assets/images/pet-buddy.jpg";
import petLunaImage from "../assets/images/pet-luna.jpg";

// ── Storage keys ──
const CLINIC_DIRECTORY_KEY = "companion_ai_clinic_directory";
const PET_OWNER_PETS_KEY = "companion_ai_pet_owner_pets";
const PET_OWNER_PROFILE_KEY = "companion_ai_pet_owner_profile";
const PET_OWNER_APPOINTMENTS_KEY = "companion_ai_pet_owner_appointments";
const PET_OWNER_SURGEON_INQUIRIES_KEY = "companion_ai_pet_owner_surgeon_inquiries";

// ── Types ──
interface ClinicDirectoryRecord {
  id: string; name: string; address: string; phone: string; specialization: string;
  status: "active" | "inactive"; latitude?: number; longitude?: number;
  surgeons: Array<{ id: string; name: string; specialization: string; availableSlots: string[] }>;
}
interface PetRecord {
  id: string; name: string; species: string; breed: string; age: string;
  weightKg: string; emoji: string; photoDataUrl?: string;
}
interface OwnerProfile { displayName: string; email: string; phone: string; address: string; photoDataUrl?: string; }
interface AppointmentRecord {
  id: string; clinicId: string; clinicName: string; surgeonId: string; surgeonName: string;
  slot: string; petId: string; petName: string; ownerName: string; ownerPhone?: string;
  status: "pending" | "confirmed" | "cancelled"; bookedAt: string;
}
interface SurgeonInquiryRecord {
  id: string; clinicId: string; clinicName: string; surgeonId: string; surgeonName: string;
  petId: string; petName: string; message: string; status: "open" | "replied"; createdAt: string;
}
interface ChatMessage { id: string; sender: "owner" | "assistant"; text: string; }
type Tab = "home" | "pets" | "ai" | "clinics" | "profile";

const defaultPets: PetRecord[] = [
  { id: "pet-1", name: "Buddy", species: "Dog", breed: "Golden Retriever", age: "2", weightKg: "30", emoji: "🐕", photoDataUrl: petBuddyImage },
  { id: "pet-2", name: "Luna", species: "Cat", breed: "Siamese", age: "4", weightKg: "5", emoji: "🐈", photoDataUrl: petLunaImage },
];

function loadJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}

// ── Nav config ──
const navItems: Array<{ id: Tab; label: string; icon: typeof Home }> = [
  { id: "home", label: "Overview", icon: Home },
  { id: "pets", label: "Pets", icon: PawPrint },
  { id: "ai", label: "AI Chat", icon: Brain },
  { id: "clinics", label: "Clinics", icon: MapPin },
  { id: "profile", label: "Profile", icon: User },
];

export function PetOwnerDashboardPage() {
  const navigate = useNavigate();
  const storedName = getProfileNameForRole("pet-owner", "Pet Owner");
  const firstName = storedName.trim().split(/\s+/)[0] || "Pet Owner";

  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [pets, setPets] = useState<PetRecord[]>(() => { const p = loadJson<PetRecord[]>(PET_OWNER_PETS_KEY, []); return p.length ? p : defaultPets; });
  const [newPet, setNewPet] = useState({ name: "", species: "Dog", breed: "", age: "", weightKg: "", photoDataUrl: "" });
  const [profile, setProfile] = useState<OwnerProfile>(() => loadJson(PET_OWNER_PROFILE_KEY, { displayName: storedName, email: "", phone: "", address: "" }));
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: "msg-1", sender: "assistant", text: "Hi! I'm your PetCare AI assistant. Describe your pet's symptoms for guidance." }]);
  const [chatInput, setChatInput] = useState("");
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() => loadJson(PET_OWNER_APPOINTMENTS_KEY, []));
  const [bookingPetByClinic, setBookingPetByClinic] = useState<Record<string, string>>({});
  const [rescheduleSlotByAppointment, setRescheduleSlotByAppointment] = useState<Record<string, string>>({});
  const [inquiryBySurgeon, setInquiryBySurgeon] = useState<Record<string, string>>({});
  const [surgeonInquiries, setSurgeonInquiries] = useState<SurgeonInquiryRecord[]>(() => loadJson(PET_OWNER_SURGEON_INQUIRIES_KEY, []));
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState("");

  const clinics = useMemo(() => {
    const parsed = loadJson<ClinicDirectoryRecord[]>(CLINIC_DIRECTORY_KEY, []);
    return parsed.filter((c) => c.status === "active");
  }, [activeTab, appointments.length]);

  useEffect(() => { localStorage.setItem(PET_OWNER_APPOINTMENTS_KEY, JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem(PET_OWNER_SURGEON_INQUIRIES_KEY, JSON.stringify(surgeonInquiries)); }, [surgeonInquiries]);

  useEffect(() => {
    if (!navigator.geolocation) { setLocationError("Geolocation not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }); setLocationError(""); },
      () => setLocationError("Location permission denied."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
    const R = 6371, toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(bLat - aLat), dLon = toRad(bLon - aLon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  const nearbyClinics = useMemo(() => {
    if (!userLocation) return clinics;
    return [...clinics].sort((a, b) => {
      const dA = typeof a.latitude === "number" && typeof a.longitude === "number" ? distanceKm(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude) : Infinity;
      const dB = typeof b.latitude === "number" && typeof b.longitude === "number" ? distanceKm(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude) : Infinity;
      return dA - dB;
    });
  }, [clinics, userLocation]);

  const predictions = [
    { id: "1", title: "Hip Dysplasia Risk", pet: "Buddy", age: "2h ago", risk: "low", variant: "success" as const },
    { id: "2", title: "Glaucoma Check", pet: "Luna", age: "1d ago", risk: "moderate", variant: "warning" as const },
    { id: "3", title: "Dietary Sensitivity", pet: "Buddy", age: "3d ago", risk: "high", variant: "danger" as const },
  ];

  function persistPets(next: PetRecord[]) { setPets(next); localStorage.setItem(PET_OWNER_PETS_KEY, JSON.stringify(next)); }

  function handleAddPet() {
    if (!newPet.name.trim() || !newPet.breed.trim() || !newPet.age.trim() || !newPet.weightKg.trim()) {
      toast({ title: "Missing fields", description: "Fill name, breed, age, and weight.", variant: "error" }); return;
    }
    const pet: PetRecord = { id: `pet-${Date.now()}`, ...newPet, name: newPet.name.trim(), breed: newPet.breed.trim(), age: newPet.age.trim(), weightKg: newPet.weightKg.trim(), emoji: newPet.species === "Cat" ? "🐈" : "🐕", photoDataUrl: newPet.photoDataUrl || undefined };
    persistPets([pet, ...pets]);
    setNewPet({ name: "", species: "Dog", breed: "", age: "", weightKg: "", photoDataUrl: "" });
    toast({ title: "Pet added", variant: "success" });
  }

  function handlePhotoUpload(setter: (url: string) => void) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { if (typeof reader.result === "string") setter(reader.result); };
      reader.readAsDataURL(file);
    };
  }

  function handleDeletePet(id: string) { persistPets(pets.filter((p) => p.id !== id)); toast({ title: "Pet removed" }); }

  function handleSaveProfile() {
    if (!profile.displayName.trim()) { toast({ title: "Name required", variant: "error" }); return; }
    const updated = { ...profile, displayName: profile.displayName.trim() };
    setProfile(updated); saveProfileName(updated.displayName, "pet-owner");
    localStorage.setItem(PET_OWNER_PROFILE_KEY, JSON.stringify(updated));
    toast({ title: "Profile saved", variant: "success" });
  }

  function handleLogout() { logout(); navigate("/auth/login", { replace: true }); }

  function isSlotBooked(clinicId: string, surgeonId: string, slot: string) {
    return appointments.some((a) => a.status !== "cancelled" && a.clinicId === clinicId && a.surgeonId === surgeonId && a.slot === slot);
  }

  function handleBookAppointment(clinic: ClinicDirectoryRecord, surgeon: ClinicDirectoryRecord["surgeons"][number], slot: string) {
    const petId = bookingPetByClinic[clinic.id] || pets[0]?.id;
    const pet = pets.find((p) => p.id === petId);
    if (!pet) { toast({ title: "Add a pet first", variant: "error" }); return; }
    if (isSlotBooked(clinic.id, surgeon.id, slot)) { toast({ title: "Slot taken", variant: "error" }); return; }
    setAppointments((prev) => [{ id: `appt-${Date.now()}`, clinicId: clinic.id, clinicName: clinic.name, surgeonId: surgeon.id, surgeonName: surgeon.name, slot, petId: pet.id, petName: pet.name, ownerName: profile.displayName.trim() || "Pet Owner", ownerPhone: profile.phone.trim() || undefined, status: "pending", bookedAt: new Date().toISOString() }, ...prev]);
    toast({ title: "Appointment booked", description: `${surgeon.name} at ${slot}`, variant: "success" });
  }

  function handleCancelAppointment(id: string) {
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: "cancelled" } : a));
    toast({ title: "Appointment cancelled" });
  }

  function handleRescheduleAppointment(appt: AppointmentRecord) {
    const slot = rescheduleSlotByAppointment[appt.id]; if (!slot) return;
    if (appointments.some((a) => a.id !== appt.id && a.status !== "cancelled" && a.clinicId === appt.clinicId && a.surgeonId === appt.surgeonId && a.slot === slot)) {
      toast({ title: "Slot taken", variant: "error" }); return;
    }
    setAppointments((prev) => prev.map((a) => a.id === appt.id ? { ...a, slot, status: "pending", bookedAt: new Date().toISOString() } : a));
    toast({ title: "Rescheduled", variant: "success" });
  }

  function handleSendInquiry(clinic: ClinicDirectoryRecord, surgeon: ClinicDirectoryRecord["surgeons"][number]) {
    const key = `${clinic.id}_${surgeon.id}`, msg = inquiryBySurgeon[key]?.trim();
    if (!msg) return;
    const pet = pets.find((p) => p.id === (bookingPetByClinic[clinic.id] || pets[0]?.id));
    if (!pet) { toast({ title: "Add a pet first", variant: "error" }); return; }
    setSurgeonInquiries((prev) => [{ id: `inq-${Date.now()}`, clinicId: clinic.id, clinicName: clinic.name, surgeonId: surgeon.id, surgeonName: surgeon.name, petId: pet.id, petName: pet.name, message: msg, status: "open", createdAt: new Date().toISOString() }, ...prev]);
    setInquiryBySurgeon((prev) => ({ ...prev, [key]: "" }));
    toast({ title: "Inquiry sent", variant: "success" });
  }

  function buildReply(prompt: string): string {
    const t = prompt.toLowerCase();
    if (t.includes("vomit")) return "If vomiting persists >24h, keep hydrated and book a vet visit. Seek urgent care if blood is present.";
    if (t.includes("not eating") || t.includes("appetite")) return "Track duration, water intake, and activity. Consult a vet if it persists more than a day.";
    if (t.includes("vaccine")) return "Check your vaccination timeline. I can help prepare a checklist for upcoming boosters.";
    return "Monitor symptoms for 12-24 hours. Consult an available clinic if they worsen or persist.";
  }

  function handleSendMessage() {
    const text = chatInput.trim(); if (!text) return;
    setMessages((prev) => [...prev, { id: `msg-${Date.now()}`, sender: "owner", text }, { id: `msg-${Date.now() + 1}`, sender: "assistant", text: buildReply(text) }]);
    setChatInput("");
  }

  // ── Render ──
  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-neutral-200 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900">
            <svg viewBox="0 0 24 24" fill="white" className="h-3.5 w-3.5">
              <ellipse cx="12" cy="17.5" rx="3.5" ry="3" /><circle cx="8.2" cy="11.2" r="1.8" /><circle cx="15.8" cy="11.2" r="1.8" /><circle cx="6.5" cy="14.8" r="1.6" /><circle cx="17.5" cy="14.8" r="1.6" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-neutral-900">PetCare AI</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                activeTab === item.id ? "bg-neutral-100 text-neutral-900" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-neutral-200 p-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-700">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-neutral-900">{navItems.find((n) => n.id === activeTab)?.label ?? "Overview"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-neutral-500 sm:block">{firstName}</span>
            <Avatar className="h-7 w-7">
              {profile.photoDataUrl ? <AvatarImage src={profile.photoDataUrl} alt={firstName} /> : null}
              <AvatarFallback>{firstName[0]}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="border-b border-neutral-200 bg-white p-2 lg:hidden animate-slide-down">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileNavOpen(false); }}
                className={cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium", activeTab === item.id ? "bg-neutral-100 text-neutral-900" : "text-neutral-500")}>
                <item.icon className="h-4 w-4" />{item.label}
              </button>
            ))}
            <Separator className="my-1" />
            <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500">
              <LogOut className="h-4 w-4" />Sign out
            </button>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
            {/* ── HOME TAB ── */}
            {activeTab === "home" && (
              <div className="space-y-6 animate-in">
                {/* Welcome */}
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Welcome back, {firstName}</h2>
                  <p className="text-sm text-neutral-500">Here's an overview of your pets and recent activity.</p>
                </div>

                {/* Quick stats */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Active Pets", value: pets.length, action: () => setActiveTab("pets") },
                    { label: "Appointments", value: appointments.filter((a) => a.status !== "cancelled").length, action: () => setActiveTab("clinics") },
                    { label: "AI Assessments", value: predictions.length, action: () => setActiveTab("ai") },
                  ].map((stat) => (
                    <button key={stat.label} onClick={stat.action} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 text-left transition hover:border-neutral-300">
                      <div>
                        <p className="text-2xl font-semibold text-neutral-900">{stat.value}</p>
                        <p className="text-xs text-neutral-500">{stat.label}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-neutral-300" />
                    </button>
                  ))}
                </div>

                {/* Vaccination alert */}
                <Alert variant="warning">
                  <AlertTriangle />
                  <div>
                    <p className="font-medium">Vaccination due soon</p>
                    <p className="mt-0.5 text-xs opacity-80">Buddy's Rabies booster is due in 3 days.</p>
                  </div>
                </Alert>

                {/* Pets preview */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900">Your Pets</h3>
                    <button onClick={() => setActiveTab("pets")} className="text-xs font-medium text-neutral-500 hover:text-neutral-900">View all</button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {pets.slice(0, 4).map((pet) => (
                      <div key={pet.id} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3">
                        <Avatar className="h-10 w-10 rounded-lg">
                          {pet.photoDataUrl ? <AvatarImage src={pet.photoDataUrl} alt={pet.name} className="rounded-lg object-cover" /> : null}
                          <AvatarFallback className="rounded-lg text-base">{pet.emoji}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900">{pet.name}</p>
                          <p className="text-xs text-neutral-500 truncate">{pet.breed} &middot; {pet.age}y &middot; {pet.weightKg}kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk predictions */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-neutral-900">Recent Risk Assessments</h3>
                  <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
                    {predictions.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                            <Brain className="h-4 w-4 text-neutral-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-neutral-900">{item.title}</p>
                            <p className="text-xs text-neutral-500">{item.pet} &middot; {item.age}</p>
                          </div>
                        </div>
                        <Badge variant={item.variant}>{item.risk}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PETS TAB ── */}
            {activeTab === "pets" && (
              <div className="space-y-6 animate-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-neutral-900">My Pets</h2>
                  <Badge variant="outline">{pets.length} total</Badge>
                </div>

                {/* Add pet form */}
                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-neutral-900">Add new pet</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Name</Label>
                      <Input value={newPet.name} onChange={(e) => setNewPet((p) => ({ ...p, name: e.target.value }))} placeholder="Pet name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Species</Label>
                      <select value={newPet.species} onChange={(e) => setNewPet((p) => ({ ...p, species: e.target.value }))} className="flex h-9 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm shadow-xs focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/5">
                        <option>Dog</option><option>Cat</option>
                      </select>
                    </div>
                    <div className="space-y-1.5"><Label>Breed</Label><Input value={newPet.breed} onChange={(e) => setNewPet((p) => ({ ...p, breed: e.target.value }))} placeholder="Breed" /></div>
                    <div className="space-y-1.5"><Label>Age (years)</Label><Input value={newPet.age} onChange={(e) => setNewPet((p) => ({ ...p, age: e.target.value }))} placeholder="e.g. 3" /></div>
                    <div className="space-y-1.5"><Label>Weight (kg)</Label><Input value={newPet.weightKg} onChange={(e) => setNewPet((p) => ({ ...p, weightKg: e.target.value }))} placeholder="e.g. 12" /></div>
                    <div className="space-y-1.5">
                      <Label>Photo</Label>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload((url) => setNewPet((p) => ({ ...p, photoDataUrl: url })))} className="text-xs text-neutral-500 file:mr-2 file:rounded file:border-0 file:bg-neutral-100 file:px-2 file:py-1 file:text-xs file:font-medium file:text-neutral-700" />
                    </div>
                  </div>
                  <Button size="sm" className="mt-4" onClick={handleAddPet}><Plus className="h-3.5 w-3.5" />Add Pet</Button>
                </div>

                {/* Pet list */}
                <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
                  {pets.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-neutral-400">No pets added yet.</p>
                  ) : pets.map((pet) => (
                    <div key={pet.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 rounded-lg">
                          {pet.photoDataUrl ? <AvatarImage src={pet.photoDataUrl} alt={pet.name} className="rounded-lg object-cover" /> : null}
                          <AvatarFallback className="rounded-lg">{pet.emoji}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-900">{pet.name}</p>
                          <p className="text-xs text-neutral-500">{pet.species} &middot; {pet.breed} &middot; {pet.age}y &middot; {pet.weightKg}kg</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePet(pet.id)}><Trash2 className="h-3.5 w-3.5 text-neutral-400" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── AI TAB ── */}
            {activeTab === "ai" && (
              <div className="flex h-[calc(100vh-8rem)] flex-col animate-in">
                <h2 className="mb-4 text-lg font-semibold text-neutral-900">AI Health Assistant</h2>
                <div className="flex-1 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-4">
                  <div className="space-y-3">
                    {messages.map((m) => (
                      <div key={m.id} className={cn("max-w-[80%] rounded-lg px-3 py-2 text-sm", m.sender === "owner" ? "ml-auto bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-800")}>
                        {m.text}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                    placeholder="Describe symptoms or ask a question..."
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {/* ── CLINICS TAB ── */}
            {activeTab === "clinics" && (
              <div className="space-y-6 animate-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-neutral-900">Clinics & Appointments</h2>
                  {nearbyClinics.length > 0 && <Badge variant="success">{nearbyClinics.length} available</Badge>}
                </div>

                {locationError && <Alert variant="warning"><AlertTriangle /><span>{locationError}</span></Alert>}

                {/* Appointments */}
                {appointments.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-neutral-900">My Appointments</h3>
                    <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
                      {appointments.map((appt) => {
                        const clinic = clinics.find((c) => c.id === appt.clinicId);
                        const surgeon = clinic?.surgeons.find((s) => s.id === appt.surgeonId);
                        const slots = surgeon?.availableSlots ?? [];
                        return (
                          <div key={appt.id} className="px-4 py-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <Calendar className="h-4 w-4 shrink-0 text-neutral-400" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-neutral-900 truncate">{appt.clinicName}</p>
                                  <p className="text-xs text-neutral-500">{appt.surgeonName} &middot; {appt.slot} &middot; {appt.petName}</p>
                                </div>
                              </div>
                              <Badge variant={appt.status === "confirmed" ? "success" : appt.status === "cancelled" ? "danger" : "warning"}>
                                {appt.status}
                              </Badge>
                            </div>
                            {appt.status !== "cancelled" && slots.length > 0 && (
                              <div className="mt-2 flex items-center gap-2">
                                <select value={rescheduleSlotByAppointment[appt.id] || ""} onChange={(e) => setRescheduleSlotByAppointment((p) => ({ ...p, [appt.id]: e.target.value }))} className="h-7 flex-1 rounded border border-neutral-200 px-2 text-xs text-neutral-700">
                                  <option value="">Reschedule to...</option>
                                  {slots.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <Button size="sm" variant="secondary" onClick={() => handleRescheduleAppointment(appt)}>Reschedule</Button>
                                <Button size="sm" variant="ghost" onClick={() => handleCancelAppointment(appt.id)}><X className="h-3.5 w-3.5 text-neutral-400" /></Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Clinic directory */}
                {nearbyClinics.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-8 text-center">
                    <MapPin className="mx-auto mb-2 h-5 w-5 text-neutral-300" />
                    <p className="text-sm text-neutral-500">No clinics available yet.</p>
                  </div>
                ) : nearbyClinics.map((clinic) => (
                  <div key={clinic.id} className="rounded-lg border border-neutral-200 bg-white">
                    <div className="flex items-start justify-between p-4">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{clinic.name}</p>
                        <p className="mt-0.5 text-xs text-neutral-500">{clinic.address} &middot; {clinic.phone}</p>
                        <Badge variant="info" className="mt-1.5">{clinic.specialization}</Badge>
                        {userLocation && typeof clinic.latitude === "number" && typeof clinic.longitude === "number" && (
                          <p className="mt-1 text-xs text-neutral-400">{distanceKm(userLocation.latitude, userLocation.longitude, clinic.latitude, clinic.longitude).toFixed(1)} km away</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Pet</Label>
                        <select value={bookingPetByClinic[clinic.id] || pets[0]?.id || ""} onChange={(e) => setBookingPetByClinic((p) => ({ ...p, [clinic.id]: e.target.value }))} className="h-7 rounded border border-neutral-200 px-2 text-xs">
                          {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    </div>
                    {clinic.surgeons.length > 0 && (
                      <div className="border-t border-neutral-100 p-4 pt-3">
                        <p className="mb-2 text-xs font-medium text-neutral-500">Surgeons & Slots</p>
                        <div className="space-y-3">
                          {clinic.surgeons.map((surgeon) => (
                            <div key={surgeon.id}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-neutral-900">{surgeon.name}</p>
                                  <p className="text-xs text-neutral-500">{surgeon.specialization}</p>
                                </div>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {surgeon.availableSlots.length === 0 ? (
                                  <span className="text-xs text-neutral-400">No slots</span>
                                ) : surgeon.availableSlots.map((slot) => {
                                  const booked = isSlotBooked(clinic.id, surgeon.id, slot);
                                  return (
                                    <button key={slot} onClick={() => handleBookAppointment(clinic, surgeon, slot)} disabled={booked}
                                      className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition", booked ? "bg-neutral-100 text-neutral-400 cursor-not-allowed" : "bg-neutral-900 text-white hover:bg-neutral-800")}>
                                      <Clock className="h-3 w-3" />{slot}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="mt-2 flex gap-2">
                                <Input value={inquiryBySurgeon[`${clinic.id}_${surgeon.id}`] || ""} onChange={(e) => setInquiryBySurgeon((p) => ({ ...p, [`${clinic.id}_${surgeon.id}`]: e.target.value }))} placeholder="Send inquiry..." className="h-7 flex-1 text-xs" />
                                <Button size="sm" variant="secondary" onClick={() => handleSendInquiry(clinic, surgeon)}><Send className="h-3 w-3" /></Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Inquiries */}
                {surgeonInquiries.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-neutral-900">Inquiries</h3>
                    <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
                      {surgeonInquiries.slice(0, 8).map((inq) => (
                        <div key={inq.id} className="flex items-center justify-between px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-neutral-900">{inq.surgeonName}</p>
                            <p className="text-xs text-neutral-500 truncate">{inq.message}</p>
                          </div>
                          <Badge variant={inq.status === "replied" ? "success" : "warning"}>{inq.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <div className="max-w-lg space-y-6 animate-in">
                <h2 className="text-lg font-semibold text-neutral-900">Profile</h2>

                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <Avatar className="h-14 w-14">
                      {profile.photoDataUrl ? <AvatarImage src={profile.photoDataUrl} alt="Profile" /> : null}
                      <AvatarFallback className="text-lg">{firstName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{profile.displayName || firstName}</p>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload((url) => { setProfile((p) => { const next = { ...p, photoDataUrl: url }; localStorage.setItem(PET_OWNER_PROFILE_KEY, JSON.stringify(next)); return next; }); })} className="mt-1 text-xs text-neutral-500 file:mr-2 file:rounded file:border-0 file:bg-neutral-100 file:px-2 file:py-1 file:text-xs file:font-medium file:text-neutral-700" />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label>Name</Label><Input value={profile.displayName} onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label>Email</Label><Input value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} placeholder="you@email.com" /></div>
                    <div className="space-y-1.5"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" /></div>
                    <div className="space-y-1.5"><Label>Address</Label><Input value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} placeholder="Address" /></div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" onClick={handleSaveProfile}><Save className="h-3.5 w-3.5" />Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => { localStorage.removeItem(PET_OWNER_PROFILE_KEY); localStorage.removeItem(PET_OWNER_PETS_KEY); handleLogout(); }}>
                      <Trash2 className="h-3.5 w-3.5 text-neutral-400" />Delete account
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
