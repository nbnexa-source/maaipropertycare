type Question = {
  name: string;
  label: string;
  type?: "text" | "date" | "textarea";
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

const questions: Record<string, Question[]> = {
  Buy: [
    { name: "buyer_stage", label: "Are you a first-time buyer?", options: ["Yes", "No", "Exploring"] },
    { name: "property_type", label: "What type of property are you considering?", options: ["Affordable home", "Apartment", "Luxury residence", "Independent floor", "Plot", "Commercial"] },
    { name: "budget", label: "What is your comfortable budget?", placeholder: "For example: ₹1.5–2 crore", required: true },
    { name: "location", label: "Preferred location or sectors", placeholder: "Gurugram sectors or corridor", required: true },
    { name: "construction", label: "Preferred status", options: ["Ready to move", "Under construction", "New launch", "Open to options"] },
    { name: "finance", label: "Will you require home-loan support?", options: ["Yes", "No", "Not decided"] },
  ],
  Rent: [
    { name: "property_type", label: "What would you like to rent?", options: ["Apartment", "Independent floor", "Villa", "Commercial office", "Retail space"] },
    { name: "budget", label: "Monthly rental budget", placeholder: "Your preferred monthly range", required: true },
    { name: "location", label: "Preferred location or sectors", placeholder: "Add commute or landmark preferences", required: true },
    { name: "furnishing", label: "Furnishing preference", options: ["Fully furnished", "Semi-furnished", "Unfurnished", "Flexible"] },
    { name: "move_in", label: "When would you like to move?", type: "date" },
    { name: "occupants", label: "Who will occupy the property?", placeholder: "Family, professionals, company lease…" },
  ],
  "Sell / Resale": [
    { name: "property_type", label: "What property are you selling?", options: ["Apartment", "Independent floor", "Villa", "Plot", "Commercial property"] },
    { name: "location", label: "Property location", placeholder: "Project, sector and city", required: true },
    { name: "expected_price", label: "Expected sale value", placeholder: "Your expected range", required: true },
    { name: "ownership", label: "Ownership structure", options: ["Single owner", "Joint owners", "Company owned", "Inherited", "Other"] },
    { name: "registry", label: "Registry / conveyance status", options: ["Registered", "Allotted—registry pending", "Builder transfer", "Not sure"] },
    { name: "documents", label: "Documents currently available", type: "textarea", placeholder: "Allotment letter, sale deed, receipts, possession/OC…" },
  ],
  "Property management": [
    { name: "property_type", label: "Property type", options: ["Apartment", "Independent floor", "Villa", "Plot", "Commercial property"] },
    { name: "location", label: "Property location", placeholder: "Project, sector and city", required: true },
    { name: "occupancy", label: "Current status", options: ["Vacant", "Owner occupied", "Tenant occupied", "Under handover"] },
    { name: "support", label: "Support required", type: "textarea", placeholder: "Tenant coordination, inspections, maintenance, rent tracking…", required: true },
    { name: "frequency", label: "Preferred support frequency", options: ["One-time", "Monthly", "Quarterly", "To discuss"] },
  ],
  "Let my property": [
    { name: "property_type", label: "Property type", options: ["Apartment", "Independent floor", "Villa", "Commercial property"] },
    { name: "location", label: "Property location", placeholder: "Project, sector and city", required: true },
    { name: "rent_expected", label: "Expected monthly rent", placeholder: "Your expected rental range" },
    { name: "furnishing", label: "Current furnishing", options: ["Fully furnished", "Semi-furnished", "Unfurnished"] },
    { name: "availability", label: "Available from", type: "date" },
  ],
  "General consultation": [
    { name: "goal", label: "What would you like to achieve?", options: ["Buy a property", "Rent a property", "Sell / resale", "Let my property", "Property management", "Compare options"] },
    { name: "location", label: "Property or preferred location", placeholder: "City, sector, project or corridor", required: true },
    { name: "budget", label: "Budget or expected value", placeholder: "Add a comfortable range if known" },
    { name: "stage", label: "Where are you in the process?", options: ["Just exploring", "Shortlisting", "Ready to proceed", "Already own / allotted"] },
    { name: "priority", label: "Your most important requirement", type: "textarea", placeholder: "Tell us what a good outcome looks like", required: true },
  ],
};

function questionMarkup(question: Question) {
  const required = question.required ? " required" : "";
  if (question.options) {
    return `<label>${question.label}<select name="${question.name}"${required}><option value="">Select an option</option>${question.options.map((option) => `<option>${option}</option>`).join("")}</select></label>`;
  }
  if (question.type === "textarea") {
    return `<label class="wide-field">${question.label}<textarea name="${question.name}" rows="3" placeholder="${question.placeholder ?? ""}"${required}></textarea></label>`;
  }
  return `<label>${question.label}<input name="${question.name}" type="${question.type ?? "text"}" placeholder="${question.placeholder ?? ""}"${required} /></label>`;
}

function installQuestionnaire(serviceSelect: HTMLSelectElement, resultToHide: HTMLElement) {
  const dialog = document.createElement("dialog");
  dialog.className = "questionnaire-dialog";
  dialog.id = "questionnaire";
  dialog.innerHTML = `
    <div class="questionnaire-shell">
      <button class="questionnaire-close" type="button" aria-label="Close questionnaire">×</button>
      <div class="questionnaire-intro"><img src="/images/maai-icon-transparent.png" alt="" /><div><span>MAAI guided consultation</span><h2>Let’s understand<br /><em>what you need.</em></h2><p>Answer the questions that apply to you. Your responses stay on this device in this preview.</p></div></div>
      <form id="questionnaire-form">
        <div class="questionnaire-progress"><span>01</span><div></div><span>Your requirement</span></div>
        <div class="questionnaire-grid questionnaire-personal">
          <label>Your name<input name="name" autocomplete="name" placeholder="Full name" required /></label>
          <label>Phone or email<input name="contact" placeholder="How can we reach you?" required /></label>
          <label class="wide-field">What would you like help with?<select name="service" required>${Object.keys(questions).map((name) => `<option>${name}</option>`).join("")}</select></label>
        </div>
        <div class="questionnaire-grid" id="service-questions"></div>
        <label class="questionnaire-notes">Anything else we should know?<textarea name="notes" rows="3" placeholder="Timeline, family needs, accessibility, investment objective or any concern"></textarea></label>
        <p class="questionnaire-disclaimer">Preview only: this prepares a consultation brief; it does not send or store your information.</p>
        <button class="button dark-button" type="submit">Prepare my requirement brief <span aria-hidden="true">↗</span></button>
        <div class="questionnaire-result" hidden><p role="status">Your guided brief is ready. Nothing has been sent.</p><pre></pre><button type="button" class="guided-copy">Copy brief</button><small role="status"></small></div>
      </form>
    </div>`;
  document.body.append(dialog);
  const form = dialog.querySelector<HTMLFormElement>("form")!;
  const select = form.elements.namedItem("service") as HTMLSelectElement;
  const fields = dialog.querySelector<HTMLElement>("#service-questions")!;
  const output = dialog.querySelector<HTMLElement>(".questionnaire-result")!;
  const pre = output.querySelector("pre")!;
  const status = output.querySelector("small")!;

  const render = () => {
    fields.innerHTML = (questions[select.value] ?? questions["General consultation"]).map(questionMarkup).join("");
    output.hidden = true;
  };
  const open = (service = "General consultation") => {
    select.value = questions[service] ? service : "General consultation";
    serviceSelect.value = select.value;
    render(); resultToHide.hidden = true;
    if (!dialog.open) dialog.showModal();
    (form.elements.namedItem("name") as HTMLInputElement).focus();
  };

  select.addEventListener("change", () => { serviceSelect.value = select.value; render(); });
  dialog.querySelector<HTMLButtonElement>(".questionnaire-close")!.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  document.querySelectorAll<HTMLElement>("[data-service]").forEach((button) => button.addEventListener("click", () => open(button.dataset.service)));
  document.querySelectorAll<HTMLElement>("[data-questionnaire]").forEach((trigger) => trigger.addEventListener("click", (event) => {
    event.preventDefault(); open(trigger.dataset.questionnaire);
  }));
  document.querySelectorAll<HTMLAnchorElement>('a[href="#contact"]:not([data-questionnaire])').forEach((trigger) => trigger.addEventListener("click", (event) => {
    event.preventDefault(); open("General consultation");
  }));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const lines = ["MAAI — Guided consultation brief", ""];
    for (const [key, raw] of data.entries()) {
      const value = String(raw).trim();
      if (value) lines.push(`${key.replace(/_/g, " ").replace(/^./, (letter: string) => letter.toUpperCase())}: ${value}`);
    }
    pre.textContent = lines.join("\n"); status.textContent = ""; output.hidden = false;
    output.scrollIntoView({ block: "nearest" });
  });
  output.querySelector<HTMLButtonElement>(".guided-copy")!.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(pre.textContent ?? ""); status.textContent = "Copied."; }
    catch { status.textContent = "Select the brief above and copy it manually."; }
  });
}

export function setupEnquiry(onPropertyChange: (name: string) => void) {
  const form = document.querySelector<HTMLFormElement>("#enquiry-form")!;
  const service = form.elements.namedItem("service") as HTMLSelectElement;
  const property = form.elements.namedItem("property") as HTMLSelectElement;
  const brief = document.querySelector<HTMLElement>("#brief-text")!;
  const result = document.querySelector<HTMLElement>("#brief-result")!;
  const copyStatus = document.querySelector<HTMLElement>("#copy-status")!;
  const requiredText = ["name", "contact", "location"].map((name) => form.elements.namedItem(name) as HTMLInputElement);
  const validate = () => {
    requiredText.forEach((input) => input.setCustomValidity(input.value.trim() ? "" : "Please complete this field."));
    const contactInput = requiredText[1];
    const value = contactInput.value.trim();
    if (value && !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^[+()\d\s.-]{7,25}$/.test(value) && value.replace(/\D/g, "").length >= 7)) {
      contactInput.setCustomValidity("Please enter an email address or phone number.");
    }
  };

  installQuestionnaire(service, result);
  property.addEventListener("change", () => { onPropertyChange(property.value); result.hidden = true; });
  form.addEventListener("input", () => { result.hidden = true; validate(); });
  form.addEventListener("submit", (event) => {
    event.preventDefault(); validate();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    brief.textContent = [
      "MAAI — Consultation brief", "", `Name: ${value("name")}`, `Contact: ${value("contact")}`,
      `Service: ${value("service")}`, `Property type: ${value("property") || "To discuss"}`,
      `Location: ${value("location")}`, `Budget: ${value("budget") || "To discuss"}`,
      `Notes: ${value("message") || "None added"}`,
    ].join("\n");
    copyStatus.textContent = ""; result.hidden = false; result.scrollIntoView({ block: "nearest" });
  });
  document.querySelector<HTMLButtonElement>("#copy-brief")!.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(brief.textContent ?? ""); copyStatus.textContent = "Copied. You can now paste your brief. Nothing has been sent."; }
    catch { copyStatus.textContent = "Copy is unavailable in this browser. Select and copy the brief above."; }
  });
  form.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled = false;
}
