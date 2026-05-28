import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, HelpCircle, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";

const WHATSAPP_NUMBER = "+2348071419674";
const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, "")}?text=${encodeURIComponent("Hello, I need help with Kopa Marketplace")}`;

const Support = () => {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/profile" className="size-9 rounded-full bg-secondary flex items-center justify-center"><ArrowLeft className="size-4" /></Link>
          <h1 className="font-bold text-lg">Support</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">
        {/* Hero banner with image */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero text-primary-foreground shadow-elevated">
          <div className="flex items-center">
            <div className="p-5 flex-1">
              <div className="mx-auto size-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
                <HelpCircle className="size-7" />
              </div>
              <h2 className="text-xl font-bold">How can we help?</h2>
              <p className="text-sm opacity-90 mt-1">We're here to support you on Kopa Marketplace.</p>
            </div>
            <div className="w-32 h-36 md:w-48 md:h-44 relative shrink-0">
              <img src={heroImg} alt="Corpers" className="absolute inset-0 w-full h-full object-cover rounded-r-3xl opacity-60"/>
            </div>
          </div>
        </div>

        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="card-listing p-4 flex items-center gap-4 hover:shadow-elevated transition-shadow">
          <div className="size-12 rounded-xl bg-success/15 text-success flex items-center justify-center">
            <MessageCircle className="size-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Chat Support</p>
            <p className="text-xs text-muted-foreground">Chat with us on WhatsApp</p>
          </div>
          <Button size="sm" className="bg-success hover:bg-success/90 text-white">Chat Now</Button>
        </a>

        <div className="grid grid-cols-2 gap-3">
          <div className="card-listing p-4 space-y-2">
            <Shield className="size-5 text-primary" />
            <p className="font-semibold text-sm">Safe Trading</p>
            <p className="text-[11px] text-muted-foreground">Always meet in public places and verify items before payment.</p>
          </div>
          <div className="card-listing p-4 space-y-2">
            <Clock className="size-5 text-primary" />
            <p className="font-semibold text-sm">Response Time</p>
            <p className="text-[11px] text-muted-foreground">We typically respond within 2 hours during business hours.</p>
          </div>
        </div>

        <div className="card-listing p-5 space-y-3">
          <p className="font-semibold text-sm">Follow us on social media</p>
          <div className="flex gap-3">
            <a href="https://www.tiktok.com/@kopa.ng?_r=1&_d=f02adi9i03lmeb&sec_uid=MS4wLjABAAAAnn5a36WHSGP6WDcY5tY_vwxc54ftD4Ld3AsLCTby1ZuoFYQG4a2ni-Ilr7yXTIbC&share_author_id=7636828317781771265&sharer_language=en&source=h5_m&u_code=f3b196092j4c7f&item_author_type=1&utm_source=copy&tt_from=copy&enable_checksum=1&utm_medium=ios&share_link_id=8F0C4D76-097A-48B1-B0AD-A7B7ACA9DD0B&user_id=7636828317781771265&sec_user_id=MS4wLjABAAAAnn5a36WHSGP6WDcY5tY_vwxc54ftD4Ld3AsLCTby1ZuoFYQG4a2ni-Ilr7yXTIbC&social_share_type=4&ug_btm=b8727,b0&utm_campaign=client_share&share_app_id=1233" target="_blank" rel="noopener noreferrer" className="size-12 rounded-xl bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors" title="TikTok">
              <svg className="size-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.8a4.83 4.83 0 01-1-.11z"/></svg>
            </a>
            <a href="https://www.instagram.com/nigerkopa?igsh=MTFzNzN4Y2o2N3E4dw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="size-12 rounded-xl bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors" title="Instagram">
              <svg className="size-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://x.com/nigerkopa?s=21" target="_blank" rel="noopener noreferrer" className="size-12 rounded-xl bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors" title="X (Twitter)">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
          <p className="text-[10px] text-muted-foreground">Follow us for updates and promotions</p>
        </div>

        <div className="text-center pb-6">
          <p className="text-xs text-muted-foreground">© Kopa Marketplace · Supporting the youth</p>
        </div>
      </div>
    </div>
  );
};

export default Support;
