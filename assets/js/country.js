let combo = document.getElementById("cmbCountry");
let linesChart = null;

(async () => {

    document.getElementById("filtro").addEventListener("click", handlerFilter);

    let response = await Promise.allSettled(
        [
            axios.get("https://api.covid19api.com/countries"),
            axios.get(`https://api.covid19api.com/country/Brazil?from=${new Date(2021, 04, 02, -3, 0, 0).toISOString()}&to=${new Date(2021, 04, 25, -3, 0, 0).toISOString()}`),
            axios.get(`https://api.covid19api.com/country/Brazil?from=${new Date(2021, 04, 01, -3, 0, 0).toISOString()}&to=${new Date(2021, 04, 24, -3, 0, 0).toISOString()}`),
        ]
    );



    if (response[0].status === "fulfilled") {
        loadCountries(response[0].value.data);
    }
    if (response[1].status === "fulfilled" && response[2].status === "fulfilled") {
        loadKPI(response[1].value.data);
        loadLineChart(response[1].value.data, response[2].value.data, "Deaths");
    }

})();


function loadCountries(json) {
    for (index in json) {

        combo.options[combo.options.length] = new Option(
            json[index].Country,
            json[index].Slug
        )
    }
}

function loadKPI(json) {
    document.getElementById("kpiconfirmed").innerHTML = _.last(json).Confirmed.toLocaleString("PT");
    document.getElementById("kpideaths").innerHTML = _.last(json).Deaths.toLocaleString("PT");
    document.getElementById("kpirecovered").innerHTML = _.last(json).Recovered.toLocaleString("PT");
}


function loadLineChart(json, jsonDelta, dataType) {
    if (linesChart) {
        linesChart.destroy();
    }
    let lines = document.getElementById("linhas");

    let dates = _.map(json, "Date");
    let values = _.map(json, dataType);
    let deltaValues = _.map(jsonDelta, dataType);

    values = _.each(values, (x, index) => {
        values[index] = values[index] - deltaValues[index];
    })

    let avg = _.times(values.length, _.constant(_.mean(values)));


    linesChart = new Chart(lines, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {

                    data: values,
                    label: `Numero de ${data_type[dataType]}`,
                    borderColor: 'rgb(75, 192, 192)',

                }, {

                    data: avg,
                    label: `Media de ${data_type[dataType]}`,
                    borderColor: 'rgb(75, 105, 192)',

                }
            ]
        }
    })

}

async function handlerFilter() {
    let initialDate = document.getElementById('date_start').value;
    let finalDate = document.getElementById('date_end').value;
    let country = combo.value;
    let dataType = document.getElementById("cmbData").value;
    let response = await searchData(country, initialDate, finalDate);
    if (response[0].status === "fulfilled" && response[1].status === "fulfilled") {
        loadKPI(response[0].value.data);
        loadLineChart(response[0].value.data, response[1].value.data, dataType);
    }

}

let data_type = {
    Deaths: "Mortes",
    Recovered: "Recuperados",
    Confirmed: "Confirmados"
};


async function searchData(country, initialDate, finalDate) {
    initialDate = formatDate(new Date(initialDate));
    finalDate = formatDate(new Date(finalDate));
    let offsetInitialDate = formatDate(new Date(initialDate), -1);
    let offsetFinalDate = formatDate(new Date(finalDate), -1);
    return response = await Promise.allSettled(
        [
            axios.get(`https://api.covid19api.com/country/${country}?from=${initialDate}&to=${finalDate}`),
            axios.get(`https://api.covid19api.com/country/${country}?from=${offsetInitialDate}&to=${offsetFinalDate}`),
        ]
    );




}

function formatDate(date, offset = 0) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 + offset, -3, 0, 0).toISOString();
}
