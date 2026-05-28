import { Link } from "react-router-dom";
import { ArrowLeft, Share, PlusSquare, CheckCircle } from "lucide-react";
import nyscLogo from "@/assets/kopa_logo.jpeg";

const steps = [
  {
    icon: Share,
    title: "Tap the Share button",
    description: 'Open Safari, visit this website, and tap the Share icon at the bottom of the screen.',
    visual: (
      <div className="relative mx-auto w-48 h-80 bg-secondary rounded-3xl border-2 border-border overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-8 bg-muted flex items-center justify-center text-[8px] text-muted-foreground">Safari Browser</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-1">
            <div className="size-12 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center"><span className="text-lg">K</span></div>
            <p className="text-[9px] font-medium">Kopa Marketplace</p>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-12 bg-muted flex items-center justify-center gap-6">
          <div className="size-5 rounded bg-muted-foreground/20"/>
          <div className="size-5 rounded bg-muted-foreground/20"/>
          <div className="relative">
            <Share className="size-5 text-primary"/>
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-[7px] rounded-full whitespace-nowrap animate-bounce">Tap here</span>
          </div>
          <div className="size-5 rounded bg-muted-foreground/20"/>
          <div className="size-5 rounded bg-muted-foreground/20"/>
        </div>
      </div>
    ),
  },
  {
    icon: PlusSquare,
    title: 'Tap "Add to Home Screen"',
    description: 'Scroll down in the share menu and tap "Add to Home Screen".',
    visual: (
      <div className="relative mx-auto w-48 h-64 bg-secondary rounded-2xl border-2 border-border overflow-hidden p-3">
        <div className="text-[9px] font-bold text-center mb-2 text-muted-foreground">Share Menu</div>
        <div className="space-y-1.5">
          {["Copy", "AirDrop", "Messages", "Mail"].map((t) => (
            <div key={t} className="flex items-center gap-2 p-1.5 rounded-lg bg-muted">
              <div className="size-4 rounded bg-muted-foreground/20"/>
              <span className="text-[8px]">{t}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-primary/10 border border-primary ring-2 ring-primary/30">
            <PlusSquare className="size-4 text-primary"/>
            <span className="text-[8px] font-bold text-primary">Add to Home Screen</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: CheckCircle,
    title: 'Tap "Add"',
    description: 'Confirm by tapping "Add" in the top-right corner. The app will now appear on your home screen!',
    visual: (
      <div className="relative mx-auto w-48 h-48 bg-secondary rounded-2xl border-2 border-border overflow-hidden p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] text-primary">Cancel</span>
          <span className="text-[9px] font-bold">Add to Home</span>
          <span className="text-[9px] text-primary font-bold px-2 py-0.5 bg-primary/10 rounded animate-pulse">Add</span>
        </div>
        <div className="flex items-center gap-3 p-2 rounded-xl bg-muted">
          <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden">
            <img src={nyscLogo} alt="" className="w-full h-full object-cover"/>
          </div>
          <div>
            <p className="text-[9px] font-bold">Kopa Marketplace</p>
          </div>
        </div>
      </div>
    ),
  },
];

const InstallIOS = () => {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/profile" className="size-9 rounded-full bg-secondary flex items-center justify-center"><ArrowLeft className="size-4" /></Link>
          <h1 className="font-bold">Install on iPhone</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">Add Kopa to Your Home Screen</h2>
          <p className="text-sm text-muted-foreground">Follow these simple steps to install the app on your iPhone or iPad.</p>
        </div>

        {steps.map((s, i) => (
          <div key={i} className="card-listing p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">{i + 1}</span>
              <div>
                <p className="font-bold">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
              </div>
            </div>
            <div className="flex justify-center py-2" style={{ perspective: "800px" }}>
              <div style={{ transform: "rotateY(-5deg) rotateX(3deg)", transition: "transform 0.3s" }} className="hover:!transform-none">
                {s.visual}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstallIOS;
