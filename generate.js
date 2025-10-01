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
<html>
<head>
<meta charset="utf-8">
<title>${data.name} — Resume</title>
<style>
  /* ==== Base Styling ==== */
  :root {
  --primary: #0d47a1;
  --text: #1a1a1a;
  --muted: #444;
  --bg-light: #eef2f7;
  --pill-bg: #dce4f7;
  }
  body {
    font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 11pt;
    color: var(--text);
    margin: 0;
    padding: 32px 40px;
    line-height: 1.45;
    background: white;
  }
  header {
    border-bottom: 2px solid var(--primary);
    padding-bottom: 12px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .name {
    font-size: 22pt;
    font-weight: 700;
    color: var(--primary);
  }
  .title {
    font-size: 11pt;
    color: var(--muted);
    margin-top: 4px;
  }
  .contact {
    font-size: 9.5pt;
    color: var(--muted);
    text-align: right;
  }
  .contact a { color: var(--primary); text-decoration: none; }

  /* ==== Sections ==== */
  section { margin-bottom: 18px; }
  h2 {
    font-size: 12pt;
    color: var(--primary);
    margin: 12px 0 6px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 4px;
  }
  p { margin: 6px 0; }

  /* ==== Skills ==== */
  .skills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .skill-pill {
    background: var(--pill-bg);
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 9pt;
    color: var(--primary);
  }
  .muted { color: var(--muted); font-size: 9.5pt; }

  /* ==== Projects ==== */
  .project {
    margin-bottom: 12px;
    padding: 8px 10px;
    background: var(--bg-light);
    border-left: 3px solid var(--primary);
    border-radius: 6px;
  }
  .project-title {
    font-weight: 600;
    font-size: 11pt;
    margin-bottom: 4px;
  }
  .project-links {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.project-link {
  font-size: 9pt;
  color: #0b4be0;
  text-decoration: underline;
  word-break: break-all;
}
.project-link-label {
  font-weight: 500;
  font-size: 9pt;
  margin-right: 6px;
  color: #333;
}
  ul { margin: 6px 0 6px 20px; }
  li { margin-bottom: 4px; }

  /* ==== Education ==== */
  .edu { margin-bottom: 8px; }
  .edu .school { font-weight: 600; font-size: 11pt; }
  .edu .degree { font-size: 9.5pt; color: var(--muted); }
  .education-entry {
  margin-bottom: 10px;
}
.education-header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}
.education-degree {
  color: #0b4be0;
}
.education-details {
  font-size: 9.5pt;
  color: #555;
  margin-top: 3px;
}


  /* ==== Footer ==== */
  footer {
    border-top: 1px solid #ddd;
    padding-top: 8px;
    text-align: center;
    font-size: 8.5pt;
    color: var(--muted);
    margin-top: 16px;
  }
</style>
</head>
<body>
  <header>
    <div>
      <div class="name">${data.name}</div>
      <div class="title">${data.title || ""}</div>
    </div>
    <div class="contact">
      <div>${data.contact.email} • ${data.contact.phone}</div>
      <div>${data.contact.location}</div>
      <div>
        <a href="${data.contact.linkedin}">LinkedIn</a>
        ${
          data.contact.website
            ? ' • <a href="' + data.contact.website + '">Website</a>'
            : ""
        }
      </div>
    </div>
  </header>

  <section>
    <h2>Summary</h2>
    <p>${data.summary}</p>
  </section>

  <section>
    <h2>Skills & Tools</h2>
    <div class="skills">
      ${data.skills.map((s) => `<span class="skill-pill">${s}</span>`).join("")}
    </div>
    <div style="margin-top:6px" class="muted">Tools: ${data.tools.join(
      " • "
    )}</div>
  </section>

  <section>
    <h2>Projects</h2>
    ${data.projects
      .map(
        (proj) => `
      <div class="project">
        <div class="project-title">${proj.name} <span class="muted">— ${
          proj.dates || ""
        }</span></div>
        <ul>${proj.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
       ${
         proj.links?.length
           ? `
  <div class="project-links">
    ${proj.links
      .map((l) => {
        let label = "Link";
        if (l.includes("play.google.com")) label = "Google Play";
        else if (l.includes("apps.apple.com")) label = "App Store";
        else if (l.includes("github.com")) label = "GitHub";
        else if (l.includes("vercel.app")) label = "Demo";
        else if (l.includes("netlify.app")) label = "Demo";
        else if (l.includes("drive.google.com")) label = "Video";
        else label = "Website";
        return `<div><span class="project-link-label">${label}:</span> <a class="project-link" href="${l}" target="_blank">${l}</a></div>`;
      })
      .join("")}
  </div>`
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
    <div class="education-entry">
      <div class="education-header">
        <div>
          <span class="education-degree">${ed.degree}</span> — ${ed.school}
        </div>
        <div class="muted">${ed.dates || ""}</div>
      </div>
      <div class="education-details">${ed.details || ""}</div>
    </div>
  `
    )
    .join("\n")}
</section>

  <section>
    <h2>Languages & Soft Skills</h2>
    <div><strong>Languages:</strong> ${data.languages.join(", ")}</div>
    <div style="margin-top:4px"><strong>Soft:</strong> ${data.soft_skills.join(
      " • "
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
    margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
  };
  const buffer = await pdf.generatePdf(file, options);
  await fs.writeFile(OUTPUT_PDF, buffer);
}

(async () => {
  try {
    const data = await loadData();
    const html = buildHtml(data);
    await generatePdf(html);
    console.log("✅ Enhanced Resume PDF generated at", OUTPUT_PDF);
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
