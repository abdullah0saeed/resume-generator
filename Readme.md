# Resume Generator

A simple Node.js project that generates an ATS-friendly resume PDF from a JSON data file.

## Usage

In order to use this project, you need to add a `data.json` file to the root of the project with the right format.

### Data Format

The `data.json` file should have the following format:

{
"name": "",
"title": "",
"contact": {
"email": "",
"phone": "",
"location": "",
"linkedin": "",
"website": ""
},
"summary": "",
"education": [
{
"school": "",
"degree": "",
"dates": "",
"details": ""
}
],
"skills": [],
"tools": [],
"projects": [
{
"name": "",
"dates": "",
"bullets": [],
"links": []
}
],
"languages": [],
"soft_skills": []
}
