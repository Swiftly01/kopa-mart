import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useUser from "@/hooks/users/queries/useUser";

// the name and phone buyers will see; they come from the profile, so they are read-only
export default function ContactInfo() {
  const { data: user } = useUser();

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input
          disabled
          className="h-12"
          value={user ? `${user.firstName} ${user.lastName}` : ""}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Phone number</Label>
        <Input disabled className="h-12" value={user?.phoneNumber ?? ""} />
        <p className="text-xs text-muted-foreground">
          Change these in your profile.
        </p>
      </div>
    </div>
  );
}
