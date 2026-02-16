const fs = require("fs-extra");
const path = require("path");
const pdf = require("html-pdf-node");

const DATA_FILE = path.resolve(__dirname, "data.json");
let OUTPUT_PDF;

async function loadData() {
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const data = JSON.parse(raw);
  OUTPUT_PDF = path.resolve(__dirname, `${data.name}.pdf`);
  return data;
}

function buildHtml(data) {
  return `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${data.name} - Resume</title>
<style>
  /* ==== ATS Safe Styling ==== */
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt;
    color: #000000;
    margin: 0;
    padding: 30px;
    line-height: 1.5;
    background: white;
  }
  
  h1 {
    font-size: 24pt;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
    margin: 0 0 5px 0;
  }
  
  .job-title {
    font-size: 14pt;
    text-align: center;
    margin-bottom: 10px;
  }

  h2 {
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
    border-bottom: 1px solid #000;
    margin: 18px 0 10px 0;
    padding-bottom: 3px;
  }

  /* Contact Info */
  .contact-info {
    text-align: center;
    font-size: 10pt;
    margin-bottom: 20px;
  }
  .contact-separator { margin: 0 5px; }
  a { color: #000000; text-decoration: none; }
  
  /* Sections */
  .entry { margin-bottom: 12px; page-break-inside: avoid; }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-weight: bold;
  }
  .entry-title { font-size: 11pt; }
  .entry-role { font-style: italic; font-weight: normal; }
  .entry-date { font-size: 10pt; min-width: 100px; text-align: right; }

  ul { margin: 5px 0 5px 18px; padding: 0; }
  li { margin-bottom: 3px; }
  
  .links { font-size: 9pt; margin-top: 4px; }
  .links a { text-decoration: underline; }
</style>
</head>
<body>

  <header>
    <h1>${data.name}</h1>
    <div class="job-title">${data.title}</div>
    <div class="contact-info">
      ${data.contact.location}
      <span class="contact-separator">|</span>
      ${data.contact.phone}
      <span class="contact-separator">|</span>
      <a href="mailto:${data.contact.email}">${data.contact.email}</a>
      <br>
      ${
        data.military_status
          ? `<span>Military Status: ${data.military_status}</span><br>`
          : ""
      }
      <a href="${data.contact.linkedin}">LinkedIn</a>
      ${
        data.contact.github
          ? ` <span class="contact-separator">|</span> <a href="${data.contact.github}">GitHub</a>`
          : ""
      }
      ${
        data.contact.website
          ? ` <span class="contact-separator">|</span> <a href="${data.contact.website}">Portfolio</a>`
          : ""
      }
    </div>
  </header>

  <section>
    <h2>Professional Summary</h2>
    <p>${data.summary}</p>
  </section>

  <section>
    <h2>Technical Skills</h2>
    <div><strong>Languages & Frameworks:</strong> ${data.skills.join(
      ", "
    )}</div>
    <div style="margin-top:5px"><strong>Tools:</strong> ${data.tools.join(
      ", "
    )}</div>
  </section>

  ${
    data.experience && data.experience.length
      ? `
  <section>
    <h2>Professional Experience</h2>
    ${data.experience
      .map(
        (exp) => `
      <div class="entry">
        <div class="entry-header">
          <div class="entry-title">${exp.company} <span class="entry-role">- ${
          exp.role
        }</span></div>
          <div class="entry-date">${exp.dates}</div>
        </div>
        <ul>${exp.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
        ${
          exp.links && exp.links.length
            ? `
          <div class="links"><strong>Links:</strong> ${exp.links
            .map((l) => `<a href="${l}">${l}</a>`)
            .join(" | ")}</div>
        `
            : ""
        }
      </div>
    `
      )
      .join("")}
  </section>
  `
      : ""
  }

  <section>
    <h2>Projects</h2>
    ${data.projects
      .map(
        (proj) => `
      <div class="entry">
        <div class="entry-header">
          <div class="entry-title">${proj.name}</div>
          <div class="entry-date">${proj.dates || ""}</div>
        </div>
        <ul>${proj.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
        ${
          proj.links && proj.links.length
            ? `
          <div class="links"><strong>Links:</strong> ${proj.links
            .map((l) => `<a href="${l}">${l}</a>`)
            .join(" | ")}</div>
        `
            : ""
        }
      </div>
    `
      )
      .join("")}
  </section>

  <section>
    <h2>Education</h2>
    ${data.education
      .map(
        (ed) => `
      <div class="entry">
        <div class="entry-header">
          <div class="entry-title">${ed.school}</div>
          <div class="entry-date">${ed.dates}</div>
        </div>
        <div><strong>${ed.degree}</strong></div>
        <div>${ed.details}</div>
      </div>
    `
      )
      .join("")}
  </section>

  <section>
    <h2>Additional Information</h2>
    <div><strong>Languages:</strong> ${data.languages.join(", ")}</div>
    <div style="margin-top: 5px;"><strong>Soft Skills:</strong> ${data.soft_skills.join(
      ", "
    )}</div>
  </section>

</body>
</html>
`;
}

async function generatePdf(html) {
  let file = { content: html };
  let options = {
    format: "A4",
    margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
    printBackground: true,
  };
  const buffer = await pdf.generatePdf(file, options);
  await fs.writeFile(OUTPUT_PDF, buffer);
}

(async () => {
  try {
    const data = await loadData();
    const html = buildHtml(data);

    // Check if file exists and delete it
    if (fs.existsSync(OUTPUT_PDF)) {
      await fs.unlink(OUTPUT_PDF);
      console.log(`🗑️ Deleted existing file: ${OUTPUT_PDF}`);
    }

    await generatePdf(html);
    console.log("✅ ATS-Optimized Resume PDF generated at:", OUTPUT_PDF);
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
