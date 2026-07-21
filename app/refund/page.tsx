import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-2xl px-4 prose prose-neutral dark:prose-invert">
          <h1>Refund Policy</h1>
          <p className="text-muted-foreground">Last updated: July 2026</p>

          <h2>1. Subscription Cancellation</h2>
          <p>
            You may cancel your Plus or Enterprise subscription at any time
            through the Lemon Squeezy customer portal. Upon cancellation, you
            will retain access to paid features until the end of the current
            billing period. After the billing period ends, your account reverts
            to the Free tier.
          </p>

          <h2>2. Refund Eligibility</h2>
          <p>
            <strong>Monthly (Plus):</strong> Refunds are available within 7 days
            of the initial purchase, provided you have not exceeded 100
            uploads during that period.
          </p>
          <p>
            <strong>Annual (Enterprise):</strong> Refunds are available within
            14 days of the initial purchase, provided you have not exceeded
            1,000 uploads during that period.
          </p>

          <h2>3. How to Request a Refund</h2>
          <p>
            Email us at{" "}
            <a href="mailto:support@photo2url.com">support@photo2url.com</a>{" "}
            with your account email and the reason for your refund request. We
            process refunds within 5 business days.
          </p>

          <h2>4. Non-Refundable Cases</h2>
          <ul>
            <li>Subscription renewals (not the initial purchase)</li>
            <li>
              Accounts terminated for violation of our{" "}
              <a href="/terms">Terms of Service</a>
            </li>
            <li>Refund requests beyond the eligible period</li>
          </ul>

          <h2>5. Contact</h2>
          <p>
            Questions?{" "}
            <a href="mailto:support@photo2url.com">support@photo2url.com</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
