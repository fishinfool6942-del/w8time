import { createFileRoute, Link } from "@tanstack/react-router";

const SUPPORT_EMAIL = "support@w8list.com";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — W8LIST" },
      { name: "description", content: "Get in touch with the W8LIST support team." },
      { property: "og:title", content: "Contact Us — W8LIST" },
      { property: "og:description", content: "Get in touch with the W8LIST support team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="pt-8 pb-4 px-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </Link>
      </header>

      <main className="flex-1 px-6 pb-12 max-w-md mx-auto w-full text-center">
        <h1 className="text-3xl font-black tracking-tight">
          Contact <span className="text-primary">Us</span>
        </h1>

        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Have a question, feedback, or need help with your restaurant listing? Our support team is here to help.
        </p>

        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-8 inline-flex items-center justify-center w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/30 hover:brightness-110 transition-all"
        >
          Email Support
        </a>

        <p className="mt-4 text-xs text-muted-foreground">
          Opens your default email client with a blank message addressed to{" "}
          <span className="text-foreground font-medium">{SUPPORT_EMAIL}</span>.
        </p>
      </main>
    </div>
  );
}
