document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#olympicTable tbody");
    let originalData = [...data];
    let filteredData = [...originalData];

    function renderTable(dataArray) {
        tableBody.innerHTML = "";
        dataArray.forEach(row => {
            const tr = document.createElement("tr");
            for (const key in row) {
                const td = document.createElement("td");
                td.textContent = row[key];
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        });
    }

    renderTable(filteredData);
    const firstLevel = document.getElementById("firstLevel");
    const secondLevel = document.getElementById("secondLevel");
    const thirdLevel = document.getElementById("thirdLevel");
    function populateSelect(selectElement, availableColumns) {
        availableColumns.forEach(col => {
            const option = document.createElement("option");
            option.value = col;
            option.textContent = columnNames[col];
            selectElement.appendChild(option);
        });
    }

    populateSelect(firstLevel, Object.keys(columnNames));
    function updateSortLevels() {
        const allColumns = Object.keys(columnNames);
        const firstSelected = firstLevel.value;
        const secondSelected = secondLevel.value;
        if (firstSelected) {
            const availableColumns = allColumns.filter(col => col !== firstSelected);
            if (secondLevel.disabled) populateSelect(secondLevel, availableColumns);
            secondLevel.disabled = false;
            if (secondSelected) {
                const availableColumns = allColumns.filter(col => col !== firstSelected && col !== secondSelected);
                if (secondSelected) populateSelect(thirdLevel, availableColumns);
                thirdLevel.disabled = false;
            } else {
                thirdLevel.innerHTML = '<option value="">Нет</option>';
                thirdLevel.disabled = true;
            }
        } else {
            secondLevel.innerHTML = '<option value="">Нет</option>';
            secondLevel.disabled = true;
            thirdLevel.innerHTML = '<option value="">Нет</option>';
            thirdLevel.disabled = true;
        }
        
    }

    firstLevel.addEventListener("change", updateSortLevels);
    secondLevel.addEventListener("change", updateSortLevels);
    document.getElementById("applySort").addEventListener("click", () => {
        const form = document.getElementById("sortForm");
        const levels = [
            { field: form.firstLevel.value, desc: form.firstDesc.checked },
            { field: form.secondLevel.value, desc: form.secondDesc.checked },
            { field: form.thirdLevel.value, desc: form.thirdDesc.checked }
        ].filter(level => level.field);
        filteredData.sort((a, b) => {
            for (const level of levels) {
                const dir = level.desc ? -1 : 1;
                if (level.field === "startDate" || level.field === "endDate") {
                    const result = compareDates(a[level.field], b[level.field]);
                    if (result !== 0) return result * dir;
                } else if (a[level.field] < b[level.field]) {
                    return -1 * dir;
                } else if (a[level.field] > b[level.field]) {
                    return 1 * dir;
                }
            }
            return 0;
        });
        renderTable(filteredData);
        chart();
    });

    document.getElementById("cancelSort").addEventListener("click", () => {
        filteredData = [...originalData];
        renderTable(filteredData);
        firstLevel.value = "";
        secondLevel.value = "";
        thirdLevel.value = "";
        document.getElementById("sortForm").querySelectorAll("input[type='checkbox']").forEach(checkbox => {
            checkbox.checked = false;
        });
        updateSortLevels();
        document.getElementById("filterForm").reset();
        chart();
    });

    function compareDates(date1, date2) {
        const parseDate = (dateStr) => {
            const [day, month, year] = dateStr.split(".").map(Number);
            return year * 10000 + month * 100 + day;
        };
        const parsedDate1 = parseDate(date1);
        const parsedDate2 = parseDate(date2);
        if (parsedDate1 < parsedDate2) return -1;
        if (parsedDate1 > parsedDate2) return 1;
        return 0;
    }

    document.getElementById("applyFilter").addEventListener("click", () => {
        const form = document.getElementById("filterForm");
        filteredData = originalData.filter(row => {
            if (form.number.value && row.number !== form.number.value) return false;
            if (form.season.value && row.season !== form.season.value) return false;
            if (form.min_yers.value && row.year < +form.min_yers.value) return false;
            if (form.max_yers.value && row.year > +form.max_yers.value) return false;
            if (form.city.value && row.city !== form.city.value) return false;
            if (form.min_date.value && compDates(row.startDate,form.min_date.value)) return false;
            if (form.max_date.value && compDates(form.max_date.value,row.endDate)) return false;
            if (form.min_sportsmen.value && row.sportsmen < +form.min_sportsmen.value) return false;
            if (form.max_sportsmen.value && row.sportsmen > +form.max_sportsmen.value) return false;
            if (form.min_countries.value && row.countries < +form.min_countries.value) return false;
            if (form.max_countries.value && row.countries > +form.max_countries.value) return false;
            if (form.min_sports.value && row.sports < +form.min_sports.value) return false;
            if (form.max_sports.value && row.sports > +form.max_sports.value) return false;
            return true;
        });
        renderTable(filteredData);
        chart();
    });
    document.getElementById("cancelFilter").addEventListener("click", () => {
        filteredData = [...originalData];
        renderTable(filteredData);
        const form = document.getElementById("filterForm");
        form.reset();
        chart();
    });
    function compDates(date1,date2) {
        const parseDate = (dateStr) => {
            const [year, month, day] = dateStr.split("-").map(Number);
            return year * 10000 + month * 100 + day;
        };
        const parsedDate1 = parseDate(date1);
        const parsedDate2 = parseDate(date2);
        return parsedDate1 <= parsedDate2;
    }
    const svg = d3.select("#chart");
    const chart = () =>{
        const form = document.getElementById("chartSettings");
        const xKey = form.OX.value;
        const yKey = form.OY.value;
        const aggregation = form.aggregation.value;
        const chartType = form.chartType.value;
        const aggregatedData = [];
        filteredData.forEach(row => {
            if (!aggregatedData.some(d => d[xKey] === row[xKey])) {
                aggregatedData.push({ [xKey]: row[xKey], [yKey]: [] });
            }
            const entry = aggregatedData.find(d => d[xKey] === row[xKey]);
            entry[yKey].push(row[yKey]);
        });
        aggregatedData.forEach(entry => {
            const values = entry[yKey];
            if (aggregation === "max") {
                entry[yKey] = Math.max(...values);
            } else if (aggregation === "min") {
                entry[yKey] = Math.min(...values);
            } else if (aggregation === "avg") {
                entry[yKey] = values.reduce((a, b) => a + b, 0) / values.length;
            }
        });
        const [xScale, yScale] = createScales(aggregatedData, xKey, yKey);
        drawAxes(svg, xScale, yScale);

        const color = "blue";
        if (chartType === "scatter") {
            drawScatterPlot(aggregatedData, xScale, yScale, color, xKey, yKey);
        } else if (chartType === "line") {
            drawLineChart(aggregatedData, xScale, yScale, color, xKey, yKey);
        } else if (chartType === "bar") {
            drawBarChart(aggregatedData, xScale, yScale, color, xKey, yKey);
        }
    }
    document.getElementById("buildChart").addEventListener("click", () => {
        chart();
    });
    function createScales(data, xKey, yKey) {
        const svg = d3.select("#chart");
        const width = parseFloat(svg.style("width"));
        const height = parseFloat(svg.style("height"));
        const xScale = d3.scaleBand()
            .domain(data.map(d => d[xKey]))
            .range([50, width])
            .padding(0.1);
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[yKey])])
            .range([height - 50, 50]);
        return [xScale, yScale];
    }
    function drawAxes(svg, xScale, yScale) {
        svg.selectAll("g.axis").remove();
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${yScale.range()[0]-40})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(50, -40)")
            .call(yAxis);
    }
    function drawScatterPlot(data, xScale, yScale, color, xKey, yKey) {
        const svg = d3.select("#chart");
        svg.selectAll(".line").remove();
        svg.selectAll(".bar").remove();
        svg.selectAll(".dot").remove(); 
        svg.selectAll(`.dot`)
            .data(data)
            .enter()
            .append("circle")
            .attr("class", `dot`)
            .attr("cx", d => xScale(d[xKey]) + xScale.bandwidth() / 2)
            .attr("cy", d => yScale(d[yKey])-40)
            .attr("r", 5)
            .style("fill", color);
    }
    function drawLineChart(data, xScale, yScale, color, xKey, yKey) {
        const svg = d3.select("#chart");
        svg.selectAll(".line").remove();
        svg.selectAll(".bar").remove();
        svg.selectAll(".dot").remove(); 
        const line = d3.line()
            .x(d => xScale(d[xKey]) + xScale.bandwidth() / 2)
            .y(d => yScale(d[yKey])-40);
        svg.append("path")
            .datum(data)
            .attr("class", `line`)
            .attr("d", line)
            .style("fill", "none")
            .style("stroke", color)
            .style("stroke-width", 2);
    };
    function drawBarChart(data, xScale, yScale, color, xKey, yKey) {
        const svg = d3.select("#chart");
        svg.selectAll(".line").remove();
        svg.selectAll(".bar").remove();
        svg.selectAll(".dot").remove();
        svg.selectAll(`.bar`)
            .data(data)
            .enter()                
            .append("rect")
            .attr("class", `bar`)
            .attr("x", d => xScale(d[xKey]))
            .attr("y", d => yScale(d[yKey])-40)
            .attr("width", xScale.bandwidth())
            .attr("height", d => yScale.range()[0] - yScale(d[yKey]))
            .style("fill", color);
    }
    document.getElementById("deleteChart").addEventListener("click", () => {
        const svg = d3.select("#chart");
        svg.selectAll("*").remove();
    });
    chart();
});