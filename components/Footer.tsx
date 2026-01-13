import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-8 py-4">
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Designed and developed by{" "}
          <Link
            href="https://portfolio-berglins-projects.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            BERGLIN YSA VICLITO
          </Link>
        </p>
      </div>
    </footer>
  );
}
