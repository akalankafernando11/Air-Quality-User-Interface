// convert epochtime to JavaScripte Date object
function epochToJsDate(epochTime) {
    return new Date(epochTime * 1000);
}

function epochToJsDate1(epochTime) {
    return new Date(epochTime * 1000);
}
// convert time to human-readable format YYYY/MM/DD HH:MM:SS
function epochToDateTime(epochTime) {
    var epochDate = new Date(epochToJsDate(epochTime));
    var dateTime =
        epochDate.getFullYear() +
        '/' +
        ('00' + (epochDate.getMonth() + 1)).slice(-2) +
        '/' +
        ('00' + epochDate.getDate()).slice(-2) +
        ' ' +
        ('00' + epochDate.getHours()).slice(-2) +
        ':' +
        ('00' + epochDate.getMinutes()).slice(-2) +
        ':' +
        ('00' + epochDate.getSeconds()).slice(-2);

    return dateTime;
}

// function to plot values on charts
function plotValues(chart, timestamp, value) {
    var x = timestamp * 1000 + 5.5 * 60 * 60 * 1000;
    //var x = epochToDateTime(timestamp);
    //var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    //var x = days[new Date(epochToJsDate(timestamp)).getDay()];
    // var x = new Date(epochToJsDate(timestamp)).getDate(); //DAY CHART
    //var x = (new Date(epochToJsDate(timestamp)).getTime())+(5.5*60*60*1000);// OURE CHART
    var y = Number(value);
    if (chart.series[0].data.length > 40) {
        chart.series[0].addPoint([x, y], true, true, true);
    } else {
        chart.series[0].addPoint([x, y], true, false, true);
    }
}

// DOM elements
const loginElement = document.querySelector('#login-form');
const contentElement = document.querySelector('#content-sign-in');
const userDetailsElement = document.querySelector('#user-details');
const authBarElement = document.querySelector('#authentication-bar');
const deleteButtonElement = document.getElementById('delete-button');
const deleteModalElement = document.getElementById('delete-modal');
const deleteDataFormElement = document.querySelector('#delete-data-form');
const viewDataButtonElement = document.getElementById('view-data-button');
const hideDataButtonElement = document.getElementById('hide-data-button');
//const tableContainerElement = document.querySelector('#table-container');
//const chartsRangeInputElement = document.getElementById('charts-range');
const loadDataButtonElement = document.getElementById('load-data');
const cardsCheckboxElement = document.querySelector('input[name=cards-checkbox]');
const gaugesCheckboxElement = document.querySelector('input[name=gauges-checkbox]');
//const chartsCheckboxElement = document.querySelector('input[name=charts-checkbox]');
const dropdownElement = document.querySelector('#device-select');
const tableElement = document.querySelector('#tbody');

// DOM elements for sensor readings
const cardsReadingsElement = document.querySelector('#cards-div');
const gaugesReadingsElement = document.querySelector('#gauges-div');
//const chartsDivElement = document.querySelector('#charts-div');
const tempElement = document.getElementById('temp');
const humElement = document.getElementById('hum');
const co2Element = document.getElementById('co2');
const coElement = document.getElementById('co');
const updateElement = document.getElementById('lastUpdate');

dropdownElement.addEventListener('change', e => {
    try {
        auth.onAuthStateChanged(user => {
            if (user) {
                setupUI(user);
            } else {
                setupUI();
            }
        });
    } catch (e) {
        console.log(e);
    }
});

// MANAGE LOGIN/LOGOUT UI
var setupUI = user => {
    if (user) {
        //toggle UI elements
        loginElement.style.display = 'none';
        contentElement.style.display = 'block';
        authBarElement.style.display = 'block';
        userDetailsElement.style.display = 'block';
        userDetailsElement.innerHTML = user.email;

        // get user UID to get data from database
        var uid = user.uid;
        // console.log(uid);

        const deviceId = dropdownElement.value;
        //const devicetext = dropdownElement.text;
        document.getElementById('demo').innerHTML = deviceId;
        // Database paths (with user UID)
        const dbPath = `UsersData/${uid.toString()}/${deviceId.toString()}`;
        // var chartPath = 'UsersData/' + uid.toString() + '/charts/range';

        // Database references
        var dbRef = firebase.database().ref(dbPath);
        // var chartRef = firebase.database().ref(chartPath);

        // Listen for changes to the collection
        dbRef
            .orderByKey()
            .limitToLast(25)
            .on(
                'value',
                querySnapshot => {
                    chartT.destroy();
                    chartH.destroy();
                    chartco2.destroy();
                    chartco.destroy();

                    chartT = createTemperatureChart();
                    chartH = createHumidityChart();
                    chartco2 = createCO2Chart();
                    chartco = createCOChart();

                    querySnapshot.forEach(function (item) {
                        const jsonData = item.val();

                        // Save values on variables
                        var temperature = jsonData.temperature;
                        var humidity = jsonData.humidity;
                        var co2 = jsonData.co2;
                        var co = jsonData.co;
                        var timestamp = jsonData.timestamp;
                        // Plot the values on the charts
                        //plotValues1(chartA, timestamp, temperature,humidity,co2,co);
                        plotValues(chartT, timestamp, temperature);
                        plotValues(chartH, timestamp, humidity);
                        plotValues(chartco2, timestamp, co2);
                        plotValues(chartco, timestamp, co);

                        tempElement.innerHTML = temperature;
                        humElement.innerHTML = humidity;
                        co2Element.innerHTML = co2;
                        coElement.innerHTML = co;
                        updateElement.innerHTML = epochToDateTime(timestamp);

                        var gaugeT = createTemperatureGauge();
                        var gaugeH = createHumidityGauge();
                        gaugeT.draw();
                        gaugeH.draw();
                        gaugeT.value = temperature;
                        gaugeH.value = humidity;
                        updateElement.innerHTML = epochToDateTime(timestamp);
                    });
                },
                error => {
                    console.log('Error getting documents: ', error);
                }
            );

        //CHECKBOXES
        // Checbox (cards for sensor readings)
        cardsCheckboxElement.addEventListener('change', e => {
            if (cardsCheckboxElement.checked) {
                cardsReadingsElement.style.display = 'block';
            } else {
                cardsReadingsElement.style.display = 'none';
            }
        });
        // Checbox (gauges for sensor readings)
        gaugesCheckboxElement.addEventListener('change', e => {
            if (gaugesCheckboxElement.checked) {
                gaugesReadingsElement.style.display = 'block';
            } else {
                gaugesReadingsElement.style.display = 'none';
            }
        });

        // IF USER IS LOGGED OUT
    } else {
        // toggle UI elements
        loginElement.style.display = 'block';
        authBarElement.style.display = 'none';
        userDetailsElement.style.display = 'none';
        contentElement.style.display = 'none';
    }
};
