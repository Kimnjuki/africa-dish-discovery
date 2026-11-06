import { Facebook, Twitter, Linkedin, Link2, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  url?: string;
  title: string;
  description?: string;
  variant?: "buttons" | "dropdown";
  size?: "sm" | "default";
}

export const SocialShare = ({ 
  url, 
  title, 
  description = "",
  variant = "buttons",
  size = "default"
}: SocialShareProps) => {
  const { toast } = useToast();
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "The link has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={size}>
            <Link2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleShare("facebook")}>
            <Facebook className="h-4 w-4 mr-2 text-[#1877F2]" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("twitter")}>
            <Twitter className="h-4 w-4 mr-2 text-[#1DA1F2]" />
            Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("linkedin")}>
            <Linkedin className="h-4 w-4 mr-2 text-[#0A66C2]" />
            LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
            <MessageCircle className="h-4 w-4 mr-2 text-[#25D366]" />
            WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("email")}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyToClipboard}>
            <Link2 className="h-4 w-4 mr-2" />
            Copy Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className={`${buttonSize} hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]`}
        onClick={() => handleShare("facebook")}
        aria-label="Share on Facebook"
      >
        <Facebook className={iconSize} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`${buttonSize} hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]`}
        onClick={() => handleShare("twitter")}
        aria-label="Share on Twitter"
      >
        <Twitter className={iconSize} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`${buttonSize} hover:bg-[#25D366] hover:text-white hover:border-[#25D366]`}
        onClick={() => handleShare("whatsapp")}
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className={iconSize} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={buttonSize}
        onClick={copyToClipboard}
        aria-label="Copy link"
      >
        <Link2 className={iconSize} />
      </Button>
    </div>
  );
};

// Social media links component for footer
export const SocialLinks = () => {
  // Only publish verified profiles. Until accounts are live, keep email contact.
  const socialLinks = [
    { name: "Email", icon: Mail, url: "mailto:hello@ladhaquest.com", color: "#D97706" },
  ];

  return (
    <div className="flex items-center gap-3">
      {socialLinks.map((social) => (
        <a
          key={social.name}
          href={social.url}
          target={social.url.startsWith("mailto:") ? undefined : "_blank"}
          rel={social.url.startsWith("mailto:") ? undefined : "noopener noreferrer"}
          className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
          aria-label={social.name}
        >
          <social.icon />
        </a>
      ))}
    </div>
  );
};
