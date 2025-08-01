// Set up dimensions and margins
const margin = { top: 40, right: 30, bottom: 60, left: 60 },
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const colorScale = d3.scaleOrdinal()
    .domain(["A", "G", "K", "N", "P", "Q", "R"])
    .range(["#88D8B0", "#F2A6B3", "#7FB2FF", "#C3B1E1", "#FFBC9A", "#F4E285", "#A5E4E0"]);

// Create SVG container
const svg = d3.select("#scatterplot .chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load data
d3.csv("data/cleaned_cereal.csv").then(data => {

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltipRevenue")
        .style("opacity", 0);

    // Convert numeric fields
    data.forEach(d => {
        d.sugar_per_cup = +d.sugar_per_cup;
        d.rating = +d.rating;
    });

    // Set up scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.sugar_per_cup) + 1])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.rating) + 5])
        .range([height, 0]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Sugar per Cup (g)");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Consumer Reports Rating");

    // Add dots
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.sugar_per_cup))
        .attr("cy", d => y(d.rating))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.mfr))
        .attr("opacity", 0.8)
        .on("mouseover", (event, d) => {
            tooltip
                .html(`
      <strong>${d.name}</strong><br>
      <img src="${d.image_url}" alt="${d.name}" width="100" style="margin: 0.5rem 0; display: block;" />
      Sugar: ${d.sugar_per_cup}g<br>
      Rating: ${d.rating.toFixed(1)}
    `)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px")
                .transition().duration(200)
                .style("opacity", 1);
        })
        .on("mouseout", () => {
            tooltip.transition().duration(200).style("opacity", 0);
        });
    const legendData = colorScale.domain();

    const legend = d3.select("#scatterplot-legend")
        .append("div")
        .style("display", "flex")
        .style("gap", "1rem")
        .style("flex-wrap", "wrap");

    legend.selectAll("div")
        .data(legendData)
        .enter()
        .append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .html(d => {
            const labelMap = {
                A: "American Home Food",
                G: "General Mills",
                K: "Kellogg’s",
                N: "Nabisco",
                P: "Post",
                Q: "Quaker Oats",
                R: "Ralston Purina"
            };
            return `
      <span style="display:inline-block; width: 16px; height: 16px; background:${colorScale(d)}; margin-right: 6px; border-radius: 3px;"></span>
      ${labelMap[d]}
    `;
        });


    // TOP 10 BAR CHART
    const top10 = data
        .slice() // avoid mutating original
        .sort((a, b) => d3.descending(+a.rating, +b.rating))
        .slice(0, 10);

    // Bar chart dimensions
    const barMargin = { top: 40, right: 30, bottom: 40, left: 200 },
        barWidth = 800 - barMargin.left - barMargin.right,
        barHeight = 500 - barMargin.top - barMargin.bottom;

    const barSvg = d3.select("#top10 .chart")
        .append("svg")
        .attr("width", barWidth + barMargin.left + barMargin.right)
        .attr("height", barHeight + barMargin.top + barMargin.bottom)
        .append("g")
        .attr("transform", `translate(${barMargin.left},${barMargin.top})`);

    // Scales
    const yBar = d3.scaleBand()
        .domain(top10.map(d => d.name))
        .range([0, barHeight])
        .padding(0.15);

    const xBar = d3.scaleLinear()
        .domain([0, d3.max(top10, d => +d.rating)])
        .range([0, barWidth]);

    // Axis
    barSvg.append("g")
        .call(d3.axisLeft(yBar).tickSize(0))
        .call(g => g.select(".domain").remove())
        .selectAll("text")
        .style("font-size", "0.9rem")
        .style("font-weight", "bold")
        .style("text-anchor", "end");

    barSvg.append("g")
        .attr("transform", `translate(0,${barHeight})`)
        .call(d3.axisBottom(xBar))
        .call(g => g.select(".domain").remove());

    // Bars
    barSvg.selectAll("rect")
        .data(top10)
        .enter()
        .append("rect")
        .attr("y", d => yBar(d.name))
        .attr("height", yBar.bandwidth())
        .attr("x", 10)
          .attr("rx", 4)
  .attr("ry", 4)
        .attr("width", d => xBar(d.rating))
        .attr("fill", d => d.sugar_per_cup == 0 ? "#88D8B0" : {
            "100% Bran": "#F2A6B3",
            "Nutri-grain Wheat": "#FFBC9A",
            "All-Bran": "#7FB2FF"
        }[d.name] || "#C3B1E1")
        .on("mouseover", (event, d) => {
            tooltip
                .html(`
        <strong>${d.name}</strong><br>
        <img src="${d.image_url}" alt="${d.name}" width="100" style="margin: 0.5rem 0; display: block;" />
        Sugar: ${d.sugar_per_cup}g<br>
        Fiber: ${d.fiber_per_cup}g<br>
        Rating: ${d.rating.toFixed(1)}
      `)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px")
                .transition().duration(200).style("opacity", 1);
        })
        .on("mouseout", () => {
            tooltip.transition().duration(200).style("opacity", 0);
        });

});

