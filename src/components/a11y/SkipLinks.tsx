/**
 * Phase 18: Skip Links Component
 *
 * Allows keyboard users to skip navigation and jump to main content
 */

import { useTranslation } from "react-i18next";

export function SkipLinks() {
  const { t } = useTranslation("common");

  return (
    <div className="skip-links">
      <a href="#main-content" className="skip-link">
        {t("a11y.skipToContent")}
      </a>
      <a href="#navigation" className="skip-link">
        {t("a11y.skipToNavigation")}
      </a>
    </div>
  );
}

/**
 * CSS (add to styles.css):
 *
 * .skip-links {
 *   position: fixed;
 *   top: 0;
 *   left: 0;
 *   z-index: 9999;
 * }
 *
 * .skip-link {
 *   position: absolute;
 *   left: -9999px;
 *   padding: 0.5rem 1rem;
 *   background: var(--color-primary);
 *   color: white;
 *   text-decoration: none;
 *   border-radius: 0 0 0.25rem 0;
 * }
 *
 * .skip-link:focus {
 *   left: 0;
 *   outline: 2px solid var(--color-primary-dark);
 *   outline-offset: 2px;
 * }
 */
