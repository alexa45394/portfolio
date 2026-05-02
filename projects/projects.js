import { fetchJSON, renderProjects } from "../global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON("../lib/projects.json");
const projectsContainer = document.querySelector(".projects");
const projectsTitle = document.querySelector(".projects-title");
const searchInput = document.querySelector(".searchBar");

let query = "";
let selectedIndex = -1;

function updateProjectsTitle(projectsGiven) {
  projectsTitle.textContent = `Projects (${projectsGiven.length})`;
}

function getFilteredProjects() {
  return projects.filter((project) => {
    let values = Object.values(project).join("\n").toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

function renderPieChart(projectsGiven) {
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let svg = d3.select("#projects-pie-plot");
  let legend = d3.select(".legend");

  svg.selectAll("path").remove();
  legend.selectAll("*").remove();

  arcs.forEach((arc, i) => {
    svg
      .append("path")
      .attr("d", arc)
      .attr("fill", colors(i))
      .attr("class", i === selectedIndex ? "selected" : "")
      .on("click", () => {
        selectedIndex = selectedIndex === i ? -1 : i;

        svg
          .selectAll("path")
          .attr("class", (_, idx) => (idx === selectedIndex ? "selected" : ""));

        legend
          .selectAll("li")
          .attr("class", (_, idx) =>
            idx === selectedIndex ? "legend-item selected" : "legend-item"
          );

        if (selectedIndex === -1) {
          renderProjects(projects, projectsContainer, "h2");
          updateProjectsTitle(projects);
        } else {
          let selectedYear = data[selectedIndex].label;
          let filteredByYear = projects.filter(
            (project) => project.year === selectedYear
          );
          renderProjects(filteredByYear, projectsContainer, "h2");
          updateProjectsTitle(filteredByYear);
        }
      });
  });

  data.forEach((d, idx) => {
    legend
      .append("li")
      .attr("style", `--color:${colors(idx)}`)
      .attr("class", idx === selectedIndex ? "legend-item selected" : "legend-item")
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

let filteredProjects = getFilteredProjects();
renderProjects(filteredProjects, projectsContainer, "h2");
updateProjectsTitle(filteredProjects);
renderPieChart(filteredProjects);

searchInput.addEventListener("input", (event) => {
  query = event.target.value;
  selectedIndex = -1;

  let filteredProjects = getFilteredProjects();
  renderProjects(filteredProjects, projectsContainer, "h2");
  updateProjectsTitle(filteredProjects);
  renderPieChart(filteredProjects);
});