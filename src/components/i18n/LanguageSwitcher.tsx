/**
 * Phase 18: Language Switcher Component
 *
 * Allows users to switch between English and Arabic
 */

import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);

    // Update HTML attributes
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";

    // Persist preference
    localStorage.setItem("language", lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="size-4 text-muted-foreground" aria-hidden="true" />
      <Select value={i18n.language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[140px]" aria-label="Select language">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="ar">العربية</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Compact version for mobile
 */
export function LanguageSwitcherCompact() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("language", newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
      aria-label={`Switch to ${i18n.language === "en" ? "Arabic" : "English"}`}
    >
      <Globe className="size-4" aria-hidden="true" />
      <span className="font-medium">
        {i18n.language === "en" ? "English" : "العربية"}
      </span>
    </button>
  );
}
