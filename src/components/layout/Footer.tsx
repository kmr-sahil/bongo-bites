import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CATEGORIES } from "@/data/categories";
import logo from "@/assets/logo.png";
import { apiClient } from "@/lib/apiClient";

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Threads icon component
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.17.408-2.131 1.37-2.779.813-.546 1.95-.9 3.282-.958.955-.041 1.801.005 2.564.14a7.49 7.49 0 0 0-.09-1.073c-.181-1.058-.607-1.812-1.266-2.243-.724-.474-1.726-.706-2.977-.689-1.128.015-2.058.306-2.762.865-.602.478-.976 1.124-1.111 1.92l-2.018-.354c.216-1.252.857-2.289 1.906-3.085 1.074-.816 2.443-1.238 4.07-1.257h.082c1.726 0 3.18.424 4.323 1.26 1.318.963 2.103 2.398 2.333 4.267.087.707.115 1.478.082 2.295 1.117.705 1.989 1.632 2.523 2.852.812 1.857.737 4.502-1.392 6.59-1.846 1.81-4.182 2.593-7.367 2.615Zm-.123-7.114c-.901.049-1.605.265-2.095.643-.346.266-.462.544-.449.784.017.304.177.67.594.94.481.311 1.151.478 1.886.44 1.167-.063 2.003-.474 2.558-1.259.41-.579.67-1.377.762-2.352a9.788 9.788 0 0 0-3.256.804Z" />
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  interface NewsletterResponse {
    code?: "ALREADY_SUBSCRIBED" | "RESUBSCRIBED" | string;
    message?: string;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSubscribing(true);

      const data = await apiClient.post<NewsletterResponse>("/extras/newsletter", {
        email,
        source: "footer",
      });

      if (!data) {
        toast.error("Failed to subscribe. Please try again later.");
        throw new Error("Subscription failed");
      }


      // 🎯 Handle different cases from backend
      if (data.code === "ALREADY_SUBSCRIBED") {
        toast.success("You're already subscribed 😊");
      } else if (data.code === "RESUBSCRIBED") {
        toast.success("Welcome back! Subscribed again 🎉");
      } else {
        toast.success("Successfully subscribed! 🚀");
      }

      setEmail("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to subscribe";
      toast.error(errorMessage);
    } finally {
      setIsSubscribing(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://facebook.com/bongohridoy",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com/bongohridoy",
    },
    { name: "YouTube", icon: Youtube, url: "https://youtube.com/@bongohridoy" },
    { name: "X", icon: XIcon, url: "https://x.com/bongohridoy" },
    {
      name: "Threads",
      icon: ThreadsIcon,
      url: "https://threads.net/@bongohridoy",
    },
  ];

  return (
    <footer className="bg-foreground text-background">
      <div className="border-b border-background/10">
        <div className="section-container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-display text-2xl md:text-3xl font-semibold mb-3">
              Stay Connected with Bengal
            </h3>
            <p className="text-background/70 mb-6">
              Get exclusive offers, new product updates, and authentic Bengali
              recipes.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-background/10 border border-background/20 text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="bg-primary hover:bg-primary/90 text-primary-foreground touch-target"
              >
                {isSubscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="section-container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block">
              <img
                src={logo}
                alt="Bongo Hridoy"
                className="h-12 w-12 rounded-full object-cover mb-1"
              />
              <p className="text-xs text-background/60">
                From the Heart of Bengal
              </p>
            </Link>
            <p className="mt-4 text-sm text-background/70 leading-relaxed">
              Bringing authentic Bengali flavors to your doorstep worldwide.
            </p>
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-background/90">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                "Home",
                "Shop",
                "Our Story",
                "Blogs",
                "Contact",
                "Track Your Order",
              ].map((link) => (
                <li key={link}>
                  <Link
                    to={
                      link === "Track Your Order"
                        ? "/account/orders"
                        : `/${link.toLowerCase().replace(/ /g, "-")}`
                    }
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-background/90">
              Categories
            </h4>
            <ul className="space-y-3">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-background/90">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <a
                    href="tel:+913368263382"
                    className="text-sm text-background/70 hover:text-primary transition-colors block"
                  >
                    +91 33-68263382
                  </a>
                  <a
                    href="tel:+919330396636"
                    className="text-sm text-background/70 hover:text-primary transition-colors block"
                  >
                    +91 9330396636
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-primary mt-0.5" />
                <a
                  href="mailto:info@bongohridoy.com"
                  className="text-sm text-background/70 hover:text-primary transition-colors"
                >
                  info@bongohridoy.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-sm text-background/70">
                  Kolkata, West Bengal, India
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="section-container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/60">
            <p>© {currentYear} Bongo Hridoy. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/privacy"
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/shipping"
                className="hover:text-primary transition-colors"
              >
                Shipping Policy
              </Link>
              <Link
                to="/returns"
                className="hover:text-primary transition-colors"
              >
                Return & Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
