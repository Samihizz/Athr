import Image from "next/image";
import Link from "next/link";

type FooterProps = {
  locale: string;
  t: {
    common: Record<string, string>;
    footer: Record<string, string>;
  };
};

export default function Footer({ locale, t }: FooterProps) {
  return (
    <footer className="border-t border-border bg-background-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Image
              src="/6.svg"
              alt="Athr — أثر"
              width={160}
              height={48}
              className="h-12 w-auto"
            />
            <p className="mt-4 text-sm text-muted leading-relaxed max-w-xs">
              {t.footer.aboutText}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-5">
              {t.footer.links}
            </h3>
            <ul className="space-y-3">
              {[
                { href: `/${locale}/community`, label: t.common.community },
                { href: `/${locale}/events`, label: t.common.events },
                { href: `/${locale}/signup`, label: t.common.signup },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-5">
              {t.footer.contact}
            </h3>
            <p className="text-sm text-muted">samih@athrsa.org</p>
            <p className="text-sm text-muted mt-2" dir="ltr">+966 55 857 1094</p>
            <p className="text-sm text-muted mt-1" dir="ltr">+966 58 085 1617</p>
          </div>
        </div>

        <div className="section-divider mt-12 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Athr. {t.footer.rights}
          </p>
          <p className="text-xs text-muted">
            {t.footer.madeWith}
          </p>
        </div>
      </div>
    </footer>
  );
}
