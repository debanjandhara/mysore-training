import React from "react";
import { useTheme } from "../context/ThemeContext";

const FooterLink = ({ children }) => (
  <a href="#" className="block text-small text-foreground/60 hover:text-primary transition-colors duration-200 w-fit">
    {children}
  </a>
);

const SocialButton = ({ label }) => (
  <button className="h-10 w-10 rounded-full bg-foreground/5 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300">
    <span className="sr-only">{label}</span>
    {/* Mock Icon */}
    <div className="w-4 h-4 bg-current rounded-sm opacity-80" />
  </button>
);

export default function Footer() {
  const { currentTheme } = useTheme();

  return (
    <footer className="border-t border-white/5 bg-background/40 backdrop-blur-sm mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-16 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-secondary opacity-80" />
               <span className="text-h3 font-bold tracking-tight">Blogify</span>
            </div>
            <p className="text-small text-foreground/50 leading-relaxed max-w-xs">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground">Quick Links</h4>
            <div className="space-y-2">
              <FooterLink>Home</FooterLink>
              <FooterLink>About Us</FooterLink>
              <FooterLink>Blog</FooterLink>
              <FooterLink>Careers</FooterLink>
            </div>
          </div>

          {/* Need Help */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground">Need Help?</h4>
            <div className="space-y-2">
              <FooterLink>Support Center</FooterLink>
              <FooterLink>Terms & Conditions</FooterLink>
              <FooterLink>Privacy Policy</FooterLink>
              <FooterLink>Contact Us</FooterLink>
            </div>
          </div>

          {/* Follow Us */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground">Follow Us</h4>
            <div className="flex gap-4">
              <SocialButton label="Instagram" />
              <SocialButton label="YouTube" />
              <SocialButton label="Twitter" />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-small text-foreground/40">
          <p>© {new Date().getFullYear()} Blogify. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
