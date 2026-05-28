import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useStore, useCurrentUser } from "@/store/useStore";
import { SellerShell } from "@/components/SellerShell";
import { Category } from "@/data/seed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { X, Upload } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  title: z.string().trim().min(2).max(100),
  price: z.number().positive().max(100_000_000),
  category: z.string().min(2),
  description: z.string().trim().min(5).max(2000),
  location: z.string().min(2),
  vendorPhone: z.string().trim().min(7).max(20),
});

const MAX_FILE_SIZE = 1 * 1024 * 1024;

const fileToDataUrl = (file: File) => new Promise<string>((res, rej) => {
  const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file);
});

const CreateListing = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useCurrentUser();
  const listings = useStore((s) => s.listings);
  const categories = useStore((s) => s.categories);
  const states = useStore((s) => s.states);
  const lgas = useStore((s) => s.lgas);
  const allLgas = states.flatMap((s) => lgas[s] ?? []);
  const add = useStore((s) => s.addListing);
  const update = useStore((s) => s.updateListing);
  const editing = id ? listings.find((l) => l.id === id) : undefined;

  const [form, setForm] = useState({
    title: "", price: "", category: (categories[0]?.name ?? "Fashion") as Category, description: "",
    state: states[0] ?? "Osun", location: allLgas[0] ?? "Osogbo", vendorPhone: user?.storeProfile?.whatsapp ?? user?.phone ?? "",
  });
  const [images, setImages] = useState<string[]>([]);

  const stateLgas = lgas[form.state] ?? [];

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title, price: String(editing.price), category: editing.category,
        description: editing.description, state: editing.state ?? states[0] ?? "Osun", location: editing.location, vendorPhone: editing.vendorPhone,
      });
      setImages(editing.images);
    }
  }, [editing]);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        toast({ title: "File too large", description: `${f.name} exceeds 1MB limit.`, variant: "destructive" });
        return false;
      }
      return true;
    });
    const arr = await Promise.all(valid.slice(0, 6 - images.length).map(fileToDataUrl));
    setImages([...images, ...arr]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return toast({ title: "Add at least one image", variant: "destructive" });
    const parsed = schema.safeParse({ ...form, price: Number(form.price) });
    if (!parsed.success) return toast({ title: "Invalid input", description: parsed.error.issues[0].message, variant: "destructive" });
    const data = parsed.data;
    if (editing) {
      update(editing.id, { ...data, category: data.category as Category, images, state: form.state });
      toast({ title: "Listing updated" });
    } else {
      add({ title: data.title, price: data.price, category: data.category as Category, description: data.description, state: form.state, location: data.location, vendorPhone: data.vendorPhone, vendorName: user?.storeProfile?.storeName ?? user!.name, images });
      toast({ title: "Listing posted! Added to the bottom of feed." });
    }
    navigate("/seller-dashboard/manage-listings");
  };

  return (
    <SellerShell>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Photos ({images.length}/6)</Label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {images.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img src={src} alt="" className="w-full h-full object-cover"/>
                <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute top-1 right-1 size-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="size-3"/></button>
              </div>
            ))}
            {images.length < 6 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors">
                <Upload className="size-5"/><span className="text-[10px]">Upload</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)}/>
              </label>
            )}
          </div>
        </div>
        <div><Label>Product name</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-12 mt-1"/></div>
        <div><Label>Price (₦)</Label><Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-12 mt-1"/></div>
        <div>
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
            <SelectTrigger className="h-12 mt-1"><SelectValue/></SelectTrigger>
            <SelectContent>{categories.map((c) => <SelectItem key={c.name} value={c.name}>{c.emoji} {c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1"/></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>State</Label>
            <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v, location: (lgas[v] ?? [])[0] ?? "" })}>
              <SelectTrigger className="h-12 mt-1"><SelectValue/></SelectTrigger>
              <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Location (LGA)</Label>
            <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
              <SelectTrigger className="h-12 mt-1"><SelectValue/></SelectTrigger>
              <SelectContent>{stateLgas.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Phone number (WhatsApp)</Label><Input type="tel" value={form.vendorPhone} onChange={(e) => setForm({ ...form, vendorPhone: e.target.value })} className="h-12 mt-1"/></div>
        <Button type="submit" className="w-full h-12 bg-gradient-primary">{editing ? "Update listing" : "Post listing"}</Button>
      </form>
    </SellerShell>
  );
};

export default CreateListing;
