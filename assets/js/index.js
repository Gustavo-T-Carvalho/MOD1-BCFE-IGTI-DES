(async () => {

    let response = await axios.get("https://api.covid19api.com/summary");
    loadData(response.data);
    console.log(response);
})();

function loadData(json) {
    loadKPI(json);
    loadBarChart(json);
    loadPieChart(json);
}

function loadKPI(json) {
    document.getElementById('confirmed').innerHTML = json.Global.TotalConfirmed.toLocaleString("PT");
    document.getElementById('death').innerHTML = json.Global.TotalDeaths.toLocaleString("PT");
    document.getElementById('recovered').innerHTML = json.Global.TotalRecovered.toLocaleString("PT");
    document.getElementById('date').innerHTML = json.Date;
}

function loadBarChart(json) {

    let countriesSorted = _.orderBy(json.Countries, ["TotalDeaths", "Country"], ["desc", "asc"]);
    let countriesSliced = _.slice(countriesSorted, 0, 10);

    let countriesMapped = _.map(countriesSliced, "Country");
    let totalDeathsMapped = _.map(countriesSliced, "TotalDeaths")

    let bar = new Chart(document.getElementById("barras"), {
        type: "bar",
        data: {
            labels: countriesMapped,
            datasets: [
                {
                    label: "Total de Mortes",
                    data: totalDeathsMapped,
                    backgroundColor: "rgba(153,102,255)"
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: "Top 10 número de mortes por país",
                    font: {

                    }
                }
            }
        }
    })


}

function loadPieChart(json){
    

    
    let data = [json.Global.NewConfirmed, json.Global.NewDeaths, json.Global.NewRecovered];
    let pizza = new Chart(document.getElementById("pizza"), {
        type: 'pie',
        data: {
            labels: [
                'Confirmados',
                'Mortes',
                'Recuperados'
            ],
            datasets: [{
                label: 'Confirmados/Mortes/Recuperados',
                data: data,
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ],
                hoverOffset: 20
            }]
        }
    })
}