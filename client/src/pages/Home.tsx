import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, Check, Upload, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { mapSpeakerSubmitError } from "@/lib/formErrors";

const statuses = ["Student", "Young professional", "Entrepreneur", "Researcher", "Artist / Creative", "Other"];
const areas = [
  "Education & Career",
  "Identity & Digital Life",
  "Youth & Society",
  "Local Reality",
  "Technology & Innovation",
  "Culture & Creativity",
  "Science",
  "Other",
];

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  age: "",
  cityCountry: "",
  status: "",
  currentWork: "",
  links: "",
  idea: "",
  disagreement: "",
  oneThing: "",
  area: "",
  spokenBefore: "",
  speakingWhere: "",
  whySpeak: "",
  anythingElse: "",
};

type FormState = typeof initialForm;

function Field({ label, required = true, children, hint, error }: { label: string; required?: boolean; children: React.ReactNode; hint?: string; error?: string }) {
  return (
    <label className="field-group">
      <span className="field-label">
        {label} {required && <span className="required">*</span>}
      </span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error" role="alert">{error}</span>}
    </label>
  );
}

function SectionHeading({ number, eyebrow, title }: { number: string; eyebrow: string; title: string }) {
  return (
    <div className="section-heading">
      <span className="section-number">{number}</span>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
    </div>
  );
}

export default function Home() {
  const applicationPage = window.location.pathname === "/apply";
  const [form, setForm] = useState<FormState>(initialForm);
  const [currentStep, setCurrentStep] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const submitApplication = trpc.speaker.submit.useMutation();

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(".scroll-reveal"));
    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [submitted]);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  const stepFields: Array<Array<[keyof FormState, string]>> = [
    [["fullName", "Please enter your full name."], ["email", "Please enter a valid email address."], ["phone", "Please enter your phone number."], ["age", "Please enter your age."], ["cityCountry", "Please enter your city and country."], ["status", "Please choose your current status."], ["currentWork", "Please tell us briefly what you currently do."]],
    [["idea", "Please describe the idea you want to share."], ["disagreement", "Please share the belief that might be challenged."]],
    [["oneThing", "Please tell us the one thing to remember."], ["area", "Please choose the area that best fits your idea."]],
    [["spokenBefore", "Please tell us if you have spoken publicly before."], ["whySpeak", "Please tell us why you want to speak at TEDxThyna Youth."]],
    [],
  ];

  const validateStep = (step: number) => {
    setFormError("");
    const missing = Object.fromEntries(stepFields[step].filter(([key]) => !form[key].trim()).map(([key, message]) => [key, message])) as Partial<Record<keyof FormState, string>>;
    if (Object.keys(missing).length) {
      setFieldErrors(missing);
      setFormError("Please complete the highlighted fields before continuing.");
      window.setTimeout(() => document.querySelector<HTMLElement>(".form-alert")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return false;
    }
    if (step === 1 && (form.idea.trim().length < 20 || form.disagreement.trim().length < 20)) {
      setFormError("Please give us a little more detail in your answers.");
      window.setTimeout(() => document.querySelector<HTMLElement>(".form-alert")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return false;
    }
    if (step === 3 && form.whySpeak.trim().length < 20) {
      setFormError("Please tell us a little more about why you want to speak.");
      window.setTimeout(() => document.querySelector<HTMLElement>(".form-alert")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return false;
    }
    if (step === 4 && !photo) {
      setPhotoError("Please upload a recent JPG or PNG photo before submitting.");
      setFormError("Please complete the highlighted field before submitting.");
      window.setTimeout(() => document.querySelector<HTMLElement>(".form-alert")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return false;
    }
    return true;
  };

  const goToStep = (step: number) => {
    if (step > currentStep && !validateStep(currentStep)) return;
    setCurrentStep(Math.max(0, Math.min(4, step)));
    window.scrollTo({ top: document.getElementById("form")?.offsetTop ?? 0, behavior: "smooth" });
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});
    if (honeypot) return;
    const requiredFields: Array<[keyof FormState, string]> = [
      ["fullName", "Please enter your full name."],
      ["email", "Please enter a valid email address."],
      ["phone", "Please enter your phone number."],
      ["age", "Please enter your age."],
      ["cityCountry", "Please enter your city and country."],
      ["status", "Please choose your current status."],
      ["currentWork", "Please tell us briefly what you currently do."],
      ["idea", "Please describe the idea you want to share."],
      ["disagreement", "Please share the belief that might be challenged."],
      ["oneThing", "Please tell us the one thing to remember."],
      ["area", "Please choose the area that best fits your idea."],
      ["spokenBefore", "Please tell us if you have spoken publicly before."],
      ["whySpeak", "Please tell us why you want to speak at TEDxThyna Youth."],
    ];
    const missing = Object.fromEntries(requiredFields.filter(([key]) => !form[key].trim()).map(([key, message]) => [key, message])) as Partial<Record<keyof FormState, string>>;
    if (Object.keys(missing).length) {
      setFieldErrors(missing);
      setFormError("Please review the highlighted fields before submitting.");
      return;
    }
    if (!photo) {
      setPhotoError("Please upload a recent JPG or PNG photo before submitting.");
      setFormError("Please complete the highlighted field before submitting.");
      return;
    }
    if (photoError) {
      setFormError("Please correct the photo upload before submitting.");
      return;
    }
    if (form.idea.trim().length < 20 || form.disagreement.trim().length < 20 || form.whySpeak.trim().length < 20) {
      setFormError("Please give us a little more detail in the long-answer fields.");
      return;
    }
    const photoData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read photo"));
      reader.readAsDataURL(photo);
    });
    try {
      await submitApplication.mutateAsync({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        age: Number(form.age),
        cityCountry: form.cityCountry,
        currentStatus: form.status,
        currentWork: form.currentWork,
        links: form.links,
        idea: form.idea,
        disagreement: form.disagreement,
        oneThing: form.oneThing,
        area: form.area,
        spokenBefore: form.spokenBefore as "Yes" | "No",
        speakingWhere: form.speakingWhere,
        whySpeak: form.whySpeak,
        anythingElse: form.anythingElse,
        photoName: photo.name,
        photoMimeType: photo.type as "image/jpeg" | "image/png",
        photoData,
        consent: true,
        honeypot,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      const mapped = mapSpeakerSubmitError(error);
      setFieldErrors(mapped.fieldErrors);
      setFormError(mapped.formError);
      window.setTimeout(() => document.querySelector<HTMLElement>(".form-alert")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
    }
  };

  if (submitted) {
    return (
      <main className="success-page">
        <div className="success-orbit orbit-one" />
        <div className="success-orbit orbit-two" />
        <div className="success-spark" />
        <a className="brand brand-dark" href="#top" aria-label="TEDx Thyna Youth home">TED<span>x</span> THYNA</a>
        <div className="success-card">
          <div className="success-mark"><Check size={32} strokeWidth={2.5} /></div>
          <p className="eyebrow">Dossier received</p>
          <h1>Your case has been heard.</h1>
          <p>Thank you for trusting TEDxThyna Youth with your story. Our team will review your dossier and contact you if your idea moves forward.</p>
          <button className="button button-dark" onClick={() => { setSubmitted(false); setCurrentStep(0); setForm(initialForm); setPhoto(null); }}>
            Submit another application <ArrowUpRight size={18} />
          </button>
        </div>
        <p className="success-footer">Ideas worth spreading, rooted in our reality.</p>
      </main>
    );
  }

  return (
    <div id="top" className="site-shell">
      <header className="site-header entrance-fade">
        <a className="brand" href="#top" aria-label="TEDx Thyna Youth home">TED<span>x</span> THYNA <small>YOUTH</small></a>
        <button className={mobileMenuOpen ? "menu-toggle is-open" : "menu-toggle"} aria-label="Toggle navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={22} /> : <span>Menu</span>}
        </button>
        <nav className={mobileMenuOpen ? "nav-links is-open" : "nav-links"}>
          <a href="/" onClick={() => setMobileMenuOpen(false)}>The open call</a>
          <a href="/apply" onClick={() => setMobileMenuOpen(false)}>Apply to speak</a>
          <a href="/apply" className="nav-cta" onClick={() => setMobileMenuOpen(false)}>Share your idea <ArrowUpRight size={16} /></a>
        </nav>
      </header>

      {!applicationPage && <><section id="about" className="hero-section">
        <div className="hero-red-block" />
        <div className="hero-copy entrance-fade">
          <span className="case-stamp">CONFIDENTIAL · OPEN CALL</span>
          <p className="eyebrow">Confidential open call · Dossier 01</p>
          <h1>Make your case.<br /><em>Own the room.</em></h1>
          <p className="hero-intro">Every great idea begins as a secret worth sharing. Tell us the thought, question, or story that should change the room.</p>
          <a className="text-link" href="/apply">Open the dossier <ArrowDown size={17} /></a>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-file-card">
            <span className="file-card-line" />
            <span className="file-card-line short" />
            <span className="file-card-seal">M</span>
            <span className="file-card-label">CASE FILE<br />THYNA YOUTH</span>
          </div>
          <p className="vertical-label">TRUST · VISION · VOICE</p>
          <span className="confidential-tag">STRICTLY<br />CONFIDENTIAL</span>
        </div>
        <div className="hero-meta"><span>01</span><span>Open call · Theme: Mafia</span></div>
      </section>

      <section className="intro-band entrance-fade">
        <p>Every room has a power dynamic. We are looking for voices with the nerve to question it, ideas with the weight to move it, and stories that belong on the stage.</p>
        <span className="intro-line" />
      </section></>}

      {applicationPage && <div className="application-page-heading"><p className="eyebrow">Confidential open call · Dossier 01</p><h1>Build your<br /><em>case.</em></h1><p>Take your time. There are no perfect answers—only ideas with a point of view.</p></div>}
      {applicationPage && <form id="form" className="application-form entrance-fade" onSubmit={submit}>
        <div className="form-intro">
          <p className="eyebrow">Open call form</p>
          <h2>Build your<br /><em>case.</em></h2>
          <p>Take your time. There are no perfect answers—only ideas with a point of view.</p>
          <p className="form-required-note"><span className="required">*</span> Required field</p>
          {formError && <p className="submit-error form-alert" role="alert" aria-live="assertive"><strong>Action needed</strong><span>{formError}</span></p>}
        </div>

        <div className="form-content">
          <div className="step-progress" aria-label="Application progress">
            {['About you', 'Your idea', 'Your talk', 'Your voice', 'Final step'].map((label, index) => <button type="button" key={label} className={index === currentStep ? 'step-dot active' : index < currentStep ? 'step-dot complete' : 'step-dot'} onClick={() => goToStep(index)}><span>{String(index + 1).padStart(2, '0')}</span>{label}</button>)}
          </div>
          {currentStep === 0 && <div className="form-section scroll-reveal">
            <SectionHeading number="01" eyebrow="About you · The dossier" title="The person behind the idea" />
            <div className="fields-grid">
              <Field label="Full Name" error={fieldErrors.fullName}><input required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Your full name" /></Field>
              <Field label="Email Address" error={fieldErrors.email}><input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" /></Field>
              <Field label="Phone Number" error={fieldErrors.phone}><input required type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+216 00 000 000" /></Field>
              <Field label="Age" error={fieldErrors.age}><input required type="number" min="13" max="100" value={form.age} onChange={(e) => update("age", e.target.value)} placeholder="Your age" /></Field>
              <Field label="City / Country" error={fieldErrors.cityCountry}><input required value={form.cityCountry} onChange={(e) => update("cityCountry", e.target.value)} placeholder="Tunis, Tunisia" /></Field>
              <Field label="Current Status" error={fieldErrors.status}><select required value={form.status} onChange={(e) => update("status", e.target.value)}><option value="">Select one</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></Field>
              <Field label="What do you currently do?" hint="A short answer is perfect." error={fieldErrors.currentWork}><input required value={form.currentWork} onChange={(e) => update("currentWork", e.target.value)} placeholder="Tell us briefly" /></Field>
              <Field label="Your links" required={false} hint="LinkedIn / Instagram / Portfolio / Website"><input value={form.links} onChange={(e) => update("links", e.target.value)} placeholder="https://" /></Field>
            </div>
          </div>}

          {currentStep === 1 && <div className="form-section section-highlight scroll-reveal">
            <SectionHeading number="02" eyebrow="Your idea · The angle" title="The thought you cannot let go" />
            <Field label="What idea would you like to share on the TEDxThyna Youth stage?" hint="Go beyond the title. Help us see the idea through your eyes." error={fieldErrors.idea}><textarea required rows={6} value={form.idea} onChange={(e) => update("idea", e.target.value)} placeholder="I want to talk about..." /></Field>
            <Field label="What is something you believe about this topic that most people might disagree with?" error={fieldErrors.disagreement}><textarea required rows={6} value={form.disagreement} onChange={(e) => update("disagreement", e.target.value)} placeholder="Most people might disagree that..." /></Field>
          </div>}

          {currentStep === 2 && <div className="form-section scroll-reveal">
            <SectionHeading number="03" eyebrow="Your talk · The pitch" title="Make it stay with us" />
            <Field label="If the audience remembers only ONE thing from your talk, what should it be?" error={fieldErrors.oneThing}><textarea required rows={5} value={form.oneThing} onChange={(e) => update("oneThing", e.target.value)} placeholder="The one thing I want them to remember is..." /></Field>
            <Field label="Which area best describes your idea?" error={fieldErrors.area}><select required value={form.area} onChange={(e) => update("area", e.target.value)}><option value="">Choose an area</option>{areas.map((area) => <option key={area}>{area}</option>)}</select></Field>
          </div>}

          {currentStep === 3 && <div className="form-section section-highlight scroll-reveal">
            <SectionHeading number="04" eyebrow="You as a speaker · The voice" title="Your voice, your way" />
            <Field label="Have you spoken in front of an audience before?" error={fieldErrors.spokenBefore}><div className="radio-row"><label className={form.spokenBefore === "Yes" ? "radio-card selected" : "radio-card"}><input required type="radio" name="spokenBefore" value="Yes" checked={form.spokenBefore === "Yes"} onChange={(e) => update("spokenBefore", e.target.value)} />Yes</label><label className={form.spokenBefore === "No" ? "radio-card selected" : "radio-card"}><input required type="radio" name="spokenBefore" value="No" checked={form.spokenBefore === "No"} onChange={(e) => update("spokenBefore", e.target.value)} />No</label></div></Field>
            <Field label="If yes, where?" required={false} hint="Events, conferences, university, competitions, social media, etc."><input value={form.speakingWhere} onChange={(e) => update("speakingWhere", e.target.value)} placeholder="Tell us where you have spoken" /></Field>
            <Field label="Why do you want to speak at TEDxThyna Youth?" error={fieldErrors.whySpeak}><textarea required rows={6} value={form.whySpeak} onChange={(e) => update("whySpeak", e.target.value)} placeholder="I want to speak because..." /></Field>
          </div>}

          {currentStep === 4 && <div className="form-section final-section">
            <SectionHeading number="05" eyebrow="Final step · The signature" title="One last thing" />
            <Field label="Upload a recent photo of yourself" hint="JPG or PNG · Maximum 5 MB"><label className={photo ? "upload-box has-file" : "upload-box"}><input required type="file" accept="image/jpeg,image/png" onChange={(e) => { const file = e.target.files?.[0] || null; if (!file) { setPhoto(null); setPhotoError(""); return; } if (!["image/jpeg", "image/png"].includes(file.type)) { setPhoto(null); setPhotoError("Only JPG and PNG files are accepted."); return; } if (file.size > 5 * 1024 * 1024) { setPhoto(null); setPhotoError("Your photo must be 5 MB or smaller."); return; } setPhotoError(""); setPhoto(file); }} />{photo ? <><Check size={20} /><span>{photo.name}</span><small>Photo ready to upload</small></> : <><Upload size={24} /><span>Choose a photo</span><small>or drag and drop it here</small></>}</label>{photoError && <span className="field-error" role="alert">{photoError}</span>}</Field>
            <Field label="Is there anything else you would like to tell the TEDxThyna Youth team?" required={false}><textarea rows={5} value={form.anythingElse} onChange={(e) => update("anythingElse", e.target.value)} placeholder="Anything else on your mind..." /></Field>
            <label className="consent-line"><input required type="checkbox" /> <span>I confirm that the information provided is accurate and I agree to be contacted by the TEDxThyna Youth team regarding this application.</span></label>
            <label className="spam-trap" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
            <button className="button button-red" type="submit" disabled={submitApplication.isPending}>{submitApplication.isPending ? "Sending your application…" : "Submit my application"} <ArrowUpRight size={19} /></button>
            {submitApplication.isError && !formError && <p className="submit-error form-alert" role="alert" aria-live="assertive"><strong>Submission could not be completed</strong><span>Something went wrong while sending your application. Please check your information and try again.</span></p>}
          </div>}
          <div className="step-actions">
            {currentStep > 0 && <button type="button" className="button button-ghost" onClick={() => goToStep(currentStep - 1)}>← Previous</button>}
            {currentStep < 4 && <button type="button" className="button button-red" onClick={() => goToStep(currentStep + 1)}>Continue <ArrowUpRight size={19} /></button>}
          </div>
        </div>
      </form>}

      <footer className="site-footer entrance-fade"><a className="brand brand-dark" href="#top">TED<span>x</span> THYNA <small>YOUTH</small></a><p>Ideas worth spreading. No names, no masks—just the truth.</p><span>© TEDxThyna Youth</span></footer>
    </div>
  );
}
