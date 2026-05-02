import { fetchJSON, renderProjects } from "../global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON("../lib/projects.json");
const projectsContainer = document.querySelector(".projects");
const projectsTitle = document.querySelector(".projects-title");
const searchInput = document.querySelector(".searchBar");

let query = "";
let selectedIndex = -1;
let currentPieData = [];

function updateProjectsTitle(projectsGiven) {
  if (projectsTitle) {
    projectsTitle.textContent = `Projects (${projectsGiven.length})`;
  }
}

function getSearchFilteredProjects() {
  return projects.filter((project) => {
    let values = Object.values(project).join("\n").toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

function getVisibleProjects() {
  let filtered = getSearchFilteredProjects();

  if (selectedIndex !== -1 && currentPieData[selectedIndex]) {
    let selectedYear = currentPieData[selectedIndex].label;
    filtered = filtered.filter((project) => project.year === selectedYear);
  }

  return filtered;
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

  currentPieData = data;

  if (selectedIndex >= currentPieData.length) {
    selectedIndex = -1;
  }

  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let svg = d3.select("#projects-pie-plot");
  let legend = d3.select(".legend");

  svg.selectAll("path").remove();
  legend.selectAll("*").remove();

  arcData.forEach((d, i) => {
    svg
      .append("path")
      .attr("d", arcGenerator(d))
      .attr("fill", colors(i))
      .attr("class", i === selectedIndex ? "selected" : "")
      .on("click", () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        applyFilters();
      });
  });

  data.forEach((d, idx) => {
    legend
      .append("li")
      .attr("style", `--color:${colors(idx)}`)
      .attr("class", idx === selectedIndex ? "legend-item selected" : "legend-item")
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on("click", () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        applyFilters();
      });
  });
}

function applyFilters() {
  let searchFilteredProjects = getSearchFilteredProjects();

  renderPieChart(searchFilteredProjects);

  let visibleProjects = getVisibleProjects();
  renderProjects(visibleProjects, projectsContainer, "h2");
  updateProjectsTitle(visibleProjects);
}

searchInput.addEventListener("input", (event) => {
  query = event.target.value;
  applyFilters();
});

applyFilters();