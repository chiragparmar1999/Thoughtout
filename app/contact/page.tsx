import LegalPage from "@/components/LegalPage";

export default function Contact() {
  return (
    <LegalPage title="Contact Us">
      <p>We would love to hear from you. Reach out for tickets, performer registrations, creator packages or support.</p>
      {/* Replace placeholders with your real business details (Razorpay verifies these). */}
      <p><b>Business name:</b> ThoughtOut</p>
      <p><b>Email:</b> your-email@example.com</p>
      <p><b>Phone:</b> +91 XXXXX XXXXX</p>
      <p><b>Address:</b> Your registered address, Vadodara, Gujarat, India</p>
      <p><b>Support hours:</b> Mon to Sat, 10:00 AM to 7:00 PM IST</p>
    </LegalPage>
  );
}
