import Link from "next/link";
import { Shield, Mail } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function Footer({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const f = dict.footer;
  return (
    <footer className="border-t py-12 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-2">photo2url</h3>
            <p className="text-sm text-muted-foreground">
              {f.brand.description}
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Payments secured by Lemon Squeezy</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-medium mb-3">{f.product.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href={`/${locale}/#pricing`}
                  className="hover:text-foreground transition-colors"
                >
                  {f.product.pricing}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/#upload-zone`}
                  className="hover:text-foreground transition-colors"
                >
                  {f.product.upload}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium mb-3">{f.legal.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="hover:text-foreground transition-colors"
                >
                  {f.legal.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="hover:text-foreground transition-colors"
                >
                  {f.legal.terms}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/refund`}
                  className="hover:text-foreground transition-colors"
                >
                  {f.legal.refund}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-3">{f.contact.title}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a
                href="mailto:support@photo2url.com"
                className="hover:text-foreground transition-colors"
              >
                support@photo2url.com
              </a>
            </div>
          </div>
        </div>

        {/* Partner scroll */}
        <div className="mt-8 border-t pt-6">
          <div className="flex gap-6 overflow-x-auto snap-x scrollbar-hide justify-center text-xs text-muted-foreground">
            <span className="snap-start shrink-0">🚀 No sign-up required</span>
            <span className="snap-start shrink-0">⚡ Instant upload & share</span>
            <span className="snap-start shrink-0">🌐 Global CDN delivery</span>
            <span className="snap-start shrink-0">🔒 Payments by Lemon Squeezy</span>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-primary/5 px-4 py-3 text-center text-xs text-primary">
          {f.copyright.replace("{year}", String(new Date().getFullYear()))}
        </div>
      </div>
    </footer>
  );
}
