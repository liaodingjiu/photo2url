import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-2xl px-4 prose prose-neutral dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: July 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By using photo2url.com, you agree to these Terms of Service. If you
            do not agree, please do not use the service.
          </p>

          <h2>2. Service Description</h2>
          <p>
            photo2url provides image hosting services. You may upload images and
            receive shareable URLs. Service tiers are offered as described on
            our pricing page.
          </p>

          <h2>3. Acceptable Use</h2>
          <p>You agree not to upload content that:</p>
          <ul>
            <li>Violates any applicable laws or regulations</li>
            <li>Infringes on intellectual property rights</li>
            <li>Contains malware, viruses, or harmful code</li>
            <li>
              Is illegal, including but not limited to CSAM (Child Sexual Abuse
              Material)
            </li>
          </ul>
          <p>
            We reserve the right to remove any content that violates these terms
            and terminate accounts without notice.
          </p>

          <h2>4. Intellectual Property</h2>
          <p>
            You retain all rights to the content you upload. By uploading, you
            grant us a limited license to store and serve your content solely
            for the purpose of providing the service.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            photo2url is provided &quot;as is&quot; without warranties. We are not
            liable for any damages arising from the use or inability to use the
            service, including loss of data.
          </p>

          <h2>6. Subscription & Refunds</h2>
          <p>
            Paid subscriptions are processed through Lemon Squeezy. Refund
            requests are handled according to our{" "}
            <a href="/refund">Refund Policy</a>.
          </p>

          <h2>7. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the service
            after changes constitutes acceptance of the new terms.
          </p>

          <h2>8. Contact</h2>
          <p>
            Questions? Contact us at{" "}
            <a href="mailto:support@photo2url.com">support@photo2url.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
