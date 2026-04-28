import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export const Contact = () => (
  <main className="container page contact-grid">
    <section>
      <p className="eyebrow">Contact us</p>
      <h1>Let us create something beautiful for you.</h1>
      <p>
        Have a custom order, bulk gift request, or product question? Send us a
        note and we will get back with care.
      </p>
      <div className="contact-list">
        <span><Phone size={18} /> +91 12345 67890</span>
        <span><Mail size={18} /> hello@shrisparsha.co</span>
        <span><MapPin size={18} /> India</span>
        <span><MessageCircle size={18} /> WhatsApp support available</span>
      </div>
    </section>
    <form className="contact-form">
      <input placeholder="Your name" />
      <input placeholder="Email address" />
      <input placeholder="Subject" />
      <textarea placeholder="Tell us what you need" />
      <button className="primary-button">Send message</button>
    </form>
  </main>
);

