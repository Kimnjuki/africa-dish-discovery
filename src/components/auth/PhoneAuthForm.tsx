import { useState } from "react";
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
import { Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { readErrorMessage } from "@/lib/errors";
import {
  PHONE_COUNTRIES,
  isValidE164,
  toE164,
} from "@/lib/phoneAuth";

interface PhoneAuthFormProps {
  disabled?: boolean;
}

/**
 * Supabase phone OTP. Requires Phone provider enabled in the Supabase project
 * (Twilio / MessageBird / etc.). UI is ready; SMS delivery depends on project config.
 */
export function PhoneAuthForm({ disabled }: PhoneAuthFormProps) {
  const { toast } = useToast();
  const [countryId, setCountryId] = useState("ke");
  const [localNumber, setLocalNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const country = PHONE_COUNTRIES.find((c) => c.id === countryId) || PHONE_COUNTRIES[0];

  const sendOtp = async () => {
    const e164 = toE164(localNumber, country.dial);
    if (!e164 || !isValidE164(e164)) {
      toast({
        title: "Invalid phone number",
        description: `Use a local number like ${country.example}`,
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
      if (error) throw error;
      setSentTo(e164);
      toast({
        title: "Code sent",
        description: `Enter the SMS code sent to ${e164}`,
      });
    } catch (error: unknown) {
      const msg = readErrorMessage(error);
      toast({
        title: "Could not send code",
        description:
          msg.includes("Phone") || msg.includes("SMS") || msg.includes("provider")
            ? `${msg} Enable Phone auth + an SMS provider in Supabase Auth settings.`
            : msg || "Check the number and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!sentTo) return;
    const token = otp.trim();
    if (token.length < 4) {
      toast({
        title: "Enter the SMS code",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: sentTo,
        token,
        type: "sms",
      });
      if (error) throw error;
      toast({
        title: "Signed in",
        description: "Phone verified — welcome to LadhaQuest.",
      });
    } catch (error: unknown) {
      toast({
        title: "Invalid code",
        description: readErrorMessage(error) || "Try again or resend the code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Phone className="h-4 w-4" />
        Sign in with phone (SMS)
      </div>
      <p className="text-xs text-muted-foreground">
        Best for African mobile-first access. Requires SMS to be enabled on the project.
      </p>

      {!sentTo ? (
        <>
          <div className="grid grid-cols-[7.5rem_1fr] gap-2">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={countryId} onValueChange={setCountryId}>
                <SelectTrigger aria-label="Phone country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PHONE_COUNTRIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      +{c.dial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-local">Phone</Label>
              <Input
                id="phone-local"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder={country.example}
                value={localNumber}
                onChange={(e) => setLocalNumber(e.target.value)}
                disabled={loading || disabled}
              />
            </div>
          </div>
          <Button
            type="button"
            className="w-full"
            disabled={loading || disabled}
            onClick={sendOtp}
          >
            {loading ? "Sending…" : "Send SMS code"}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Code sent to <span className="font-medium text-foreground">{sentTo}</span>
          </p>
          <div className="space-y-2">
            <Label htmlFor="otp">SMS code</Label>
            <Input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading || disabled}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              disabled={loading || disabled}
              onClick={verifyOtp}
            >
              {loading ? "Verifying…" : "Verify & sign in"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading || disabled}
              onClick={() => {
                setSentTo(null);
                setOtp("");
              }}
            >
              Change number
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
