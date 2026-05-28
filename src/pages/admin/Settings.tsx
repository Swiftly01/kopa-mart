import { useState } from "react";
import { useStore } from "@/store/useStore";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const categories = useStore((s) => s.categories);
  const states = useStore((s) => s.states);
  const lgas = useStore((s) => s.lgas);
  const addCategory = useStore((s) => s.addCategory);
  const removeCategory = useStore((s) => s.removeCategory);
  const addState = useStore((s) => s.addState);
  const removeState = useStore((s) => s.removeState);
  const addLga = useStore((s) => s.addLga);
  const removeLga = useStore((s) => s.removeLga);

  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState("✨");
  const [stateName, setStateName] = useState("");
  const [lgaState, setLgaState] = useState(states[0] ?? "");
  const [lgaName, setLgaName] = useState("");

  return (
    <AdminShell>
      <section className="card-listing p-4 mb-4">
        <h2 className="font-semibold text-sm mb-3">Categories</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((c) => (
            <span key={c.name} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary">
              {c.emoji} {c.name}
              <button onClick={() => { removeCategory(c.name); toast({ title: "Category removed" }); }} className="ml-1 text-muted-foreground hover:text-destructive"><X className="size-3"/></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={catEmoji} onChange={(e) => setCatEmoji(e.target.value)} placeholder="🚗" className="w-16 h-10"/>
          <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category name" className="h-10"/>
          <Button onClick={() => { if (!catName.trim()) return; addCategory({ name: catName.trim(), emoji: catEmoji.trim() || "✨" }); setCatName(""); toast({ title: "Category added" }); }}><Plus className="size-4"/></Button>
        </div>
      </section>

      <section className="card-listing p-4 mb-4">
        <h2 className="font-semibold text-sm mb-3">States</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {states.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary">
              {s}
              <button onClick={() => { if (confirm(`Remove ${s} and its LGAs?`)) { removeState(s); toast({ title: "State removed" }); } }} className="ml-1 text-muted-foreground hover:text-destructive"><X className="size-3"/></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="State name" className="h-10"/>
          <Button onClick={() => { if (!stateName.trim()) return; addState(stateName.trim()); setStateName(""); toast({ title: "State added" }); }}><Plus className="size-4"/></Button>
        </div>
      </section>

      <section className="card-listing p-4">
        <h2 className="font-semibold text-sm mb-3">Local Government Areas</h2>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Pick a state</Label>
            <Select value={lgaState} onValueChange={setLgaState}>
              <SelectTrigger className="h-10 mt-1"><SelectValue placeholder="Select state"/></SelectTrigger>
              <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {lgaState && (
            <>
              <div className="flex flex-wrap gap-2">
                {(lgas[lgaState] ?? []).map((l) => (
                  <span key={l} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary">
                    {l}
                    <button onClick={() => { removeLga(lgaState, l); toast({ title: "LGA removed" }); }} className="ml-1 text-muted-foreground hover:text-destructive"><X className="size-3"/></button>
                  </span>
                ))}
                {(lgas[lgaState] ?? []).length === 0 && <p className="text-[11px] text-muted-foreground">No LGAs yet for {lgaState}.</p>}
              </div>
              <div className="flex gap-2">
                <Input value={lgaName} onChange={(e) => setLgaName(e.target.value)} placeholder="LGA name" className="h-10"/>
                <Button onClick={() => { if (!lgaName.trim()) return; addLga(lgaState, lgaName.trim()); setLgaName(""); toast({ title: "LGA added" }); }}><Plus className="size-4"/></Button>
              </div>
            </>
          )}
        </div>
      </section>
    </AdminShell>
  );
};

export default Settings;
