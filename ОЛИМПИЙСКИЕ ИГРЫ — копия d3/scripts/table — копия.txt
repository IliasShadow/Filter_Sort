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
    });

    document.getElementById("cancelFilter").addEventListener("click", () => {
        filteredData = [...originalData];
        renderTable(filteredData);
        const form = document.getElementById("filterForm");
        form.reset();
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
    
});