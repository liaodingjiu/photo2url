import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-2xl px-4 prose prose-neutral dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: July 2026
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            When you upload images to photo2url, we store the image file and
            associated metadata (file name, size, type, upload date). If you
            create an account, we collect your email address via Clerk
            authentication. We do not access, view, or analyze the content of
            your uploaded images.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            Uploaded images are stored solely to provide the image hosting
            service. Your email is used for account management and subscription
            billing via Lemon Squeezy. We do not sell, share, or distribute
            your data to third parties.
          </p>

          <h2>3. Data Retention</h2>
          <p>
            <strong>Free tier:</strong> Images are automatically deleted 30 days
            after upload. <strong>Plus & Enterprise:</strong> Images are stored
            permanently until you delete them or cancel your subscription.
          </p>

          <h2>4. Cookies</h2>
          <p>
            We use a single cookie (<code>p2u_guest_id</code>) to track upload
            limits for guest users. No advertising or tracking cookies are used.
          </p>

          <h2>5. Third-Party Services</h2>
          <p>
            <strong>Clerk</strong> handles authentication.
            <strong>Lemon Squeezy</strong> handles payment processing.
            <strong>Cloudflare</strong> provides hosting and CDN infrastructure.
            Please refer to their respective privacy policies for details on
            how they handle your data.
          </p>

          <h2>6. Contact</h2>
          <p>
            Questions about this privacy policy? Contact us at{" "}
            <a href="mailto:support@photo2url.com">support@photo2url.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
