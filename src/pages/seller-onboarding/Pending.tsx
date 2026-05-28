import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Pending = () => (
  <div className="max-w-md mx-auto px-6 pt-16 text-center space-y-4">
    <div className="size-20 rounded-full bg-warning/15 text-warning mx-auto flex items-center justify-center">
      <Clock className="size-9"/>
    </div>
    <h1 className="text-2xl font-bold">Application submitted</h1>
    <p className="text-sm text-muted-foreground">Your application is under review by admin. You'll be notified once verified.</p>
    <Button asChild className="w-full h-12 bg-gradient-primary"><Link to="/">Go to home</Link></Button>
  </div>
);

export default Pending;
