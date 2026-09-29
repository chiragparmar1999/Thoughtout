import LegalPage from "@/components/LegalPage";

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>ThoughtOut respects your privacy. This policy explains what we collect and how we use it.</p>
      <h2>Information We Collect</h2>
      <p>Name, email address, phone number, Instagram ID and the details you enter in our booking and registration forms.</p>
      <h2>How We Use It</h2>
      <p>To process bookings and registrations, send confirmations and event updates, provide creator services, and respond to your queries.</p>
      <h2>Payments</h2>
      <p>Payments are handled by Razorpay. We do not store your card, UPI or bank details.</p>
      <h2>Sharing</h2>
      <p>We do not sell your data. We share it only with service providers needed to run our services (for example hosting, database and payment partners) or when required by law.</p>
      <h2>Data Security & Retention</h2>
      <p>We use reasonable safeguards and keep data only as long as needed for the purposes above.</p>
      <h2>Your Rights</h2>
      <p>You may request access, correction or deletion of your data by contacting us.</p>
    </LegalPage>
  );
}
