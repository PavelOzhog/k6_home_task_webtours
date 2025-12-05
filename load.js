import http from 'k6/http';
import {check, group} from 'k6';
import {parseHTML} from 'k6/html';
import {SharedArray} from 'k6/data';
import {FormData} from 'https://jslib.k6.io/formdata/0.0.2/index.js';


export const options = {
//     vus: 6,
//     duration: '30s'
// }

    scenarios: {
        smoke: {
            exec: 'buyTickets',
            executor: 'ramping-arrival-rate',
            startRate: 10,
            maxVUs: 100,
            preAllocatedVUs: 50,
            stages: [
                {target: 90, duration: '20s'},
                {target: 90, duration: '10s'},
                {target: 0, duration: '15s'}
            ]
        },
        fMax: {
            exec: 'buyTickets',
            executor: 'ramping-arrival-rate',
            // duration:'15s',
            // rate: 10,
            startRate: 1,
            timeUnit: '1s',
            preAllocatedVUs: 60,
            maxVUs: 120,
            stages: [
                {target: 20, duration: '100s'},
                {target: 40, duration: '100s'},
                {target: 60, duration: '100s'},
                {target: 80, duration: '100s'},
                {target: 100, duration: '100s'},
                {target: 120, duration: '100s'},]
        },
        yaRu: {
            exec: 'getYaRu',
            executor: 'ramping-arrival-rate',
            startRate: 0,
            maxVUs: 50,
            preAllocatedVUs: 0,
            stages: [
                {target: 60, duration: '300'},
                {target: 60, duration: '600s'},
                {target: 72, duration: '300s'},
                {target: 72, duration: '600s'},
            ]
        },
        wwwRu: {
            exec: 'getRu',
            executor: 'ramping-arrival-rate',
            startRate: 0,
            maxVUs: 50,
            preAllocatedVUs: 0,
            stages: [
                {target: 120, duration: '300s'},
                {target: 120, duration: '600s'},
                {target: 144, duration: '300s'},
                {target: 144, duration: '600s'},
            ]
        }
    },
    thresholds: {
        http_req_duration: ['p(90)< 300', 'avg<200'],
        http_req_failed: ['rate < 0.01']
    }
}


const PROTOCOL = "http://"
const BASE_URL_WEB_TOURS = "webtours.load-test.ru:1080";


const dataUsers = new SharedArray(
    'data users', function () {
        const file = JSON.parse(open('./users.json'))
        return file.users;
    })

const credentials = dataUsers[0];
let departCity;
let arriveCity;
let seatPref;
let typeOfSeat;
let outboundFlight;

// Функция генерации даты
function getFormattedDate(date = new Date()) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}


export default function () {
    getWelcomePage();
    let us = getNavPl();
    login(us);
    navPlHome();
    navPlLoginIntro();
    welcomePl();
    navPlFlights();
    reservationPlWelcome();
    reservationPlFlight1();
    reservationPlCurrentFlight();
    confirmPassengerData();

}

export function buyTickets() {
    getWelcomePage();
    let us = getNavPl();
    login(us);
    navPlHome();
    navPlLoginIntro();
    welcomePl();
    navPlFlights();
    reservationPlWelcome();
    reservationPlFlight1();
    reservationPlCurrentFlight();
    confirmPassengerData();

}

// export function getResp() {
//     console.warn(`${__ENV.BASE_URL}`);
//
//     console.log(dataUsers);
//
//
//     let resp = http.get(PROTOCOL+BASE_URL_WEB_TOURS + "/cgi-bin/welcome.pl?signOff=true");
//     let resp1 = http.get(PROTOCOL+BASE_URL_WEB_TOURS + "/cgi-bin/nav.pl?in=home")
//     console.error("STATUS_CODE " + resp.status);
//     console.error("STATUS_CODE_PENIS " + resp1.status);
//
//     check(resp, {'status.code is 200': (resp) => resp.status === 200});
//     check(resp1, {'status.code is 200': (resp1) => resp1.status === 200});
//
// }


export function getWelcomePage() {
    const params = {
        param: {signOff: true}
    };

    let baseResp = http.get(PROTOCOL + BASE_URL_WEB_TOURS + "/cgi-bin/welcome.pl", params);

    console.error("BASE_RESP " + baseResp.status);
}

export function getNavPl() {

    // let params = {
    //     param: {in: "home"}
    // };
    //
    // let navPlResp = http.get(PROTOCOL + BASE_URL_WEB_TOURS + "/cgi-bin/nav.pl", params);

    let navPlResp = http.get(PROTOCOL + BASE_URL_WEB_TOURS + "/cgi-bin/nav.pl?in=home");

    const doc = parseHTML(navPlResp.body);
    let userSession = doc.find('input').attr('value');


    console.error("NAV_PL " + navPlResp.status);
    console.error("USER_SESSION " + userSession);
    console.error("URL " + navPlResp.body);
    console.error("DOC_DOC " + doc);

    // equivalent to res.html()
    // const pageTitle = doc.find('head title').text();
    // const langAttr = doc.find('html').attr('lang');


    // console.error("PARAMS " + params)

    return userSession;
}


export function login(userSession) {

    let payload = {
        userSession: userSession,
        username: credentials.username,
        password: credentials.password,
        "login.x": 49,
        "login.y": 11,
        JSFormSubmit: "off"
    }

    console.log("PAYLOAD " + payload.userSession + payload["login.x"] + "!!!!PASSWORD " + credentials.username + " USERNAME!!!! " + credentials.password)
    let login = http.post(PROTOCOL + BASE_URL_WEB_TOURS + "/cgi-bin/login.pl", payload)

    console.log("LOGIN " + login.body)
}

export function navPlHome() {

    const params = {
        param: {
            page: "menu",
            in: "home"
        }
    };

    let navPlHome = http.get(PROTOCOL + BASE_URL_WEB_TOURS + "/cgi-bin/nav.pl", params)
    console.log("NAV_PL_HOME " + navPlHome.body)
}

export function navPlLoginIntro() {

    const params = {
        param: {intro: true}
    };

    let navPlLoginIntro = http.get(PROTOCOL + BASE_URL_WEB_TOURS + "/cgi-bin/login.pl", params)
    console.log("NAV_PL_LOGIN_INTRO " + navPlLoginIntro.body)
    check(navPlLoginIntro, {
        'status code navPlLoginIntro is 200': (navPlLoginIntro) => navPlLoginIntro.status === 200,
    });
}


export function welcomePl() {

    const params = {
        param: {page: "search"}
    };
    let welcomePl = http.get(PROTOCOL + BASE_URL_WEB_TOURS + "/cgi-bin/welcome.pl", params)
    console.log("WELCOME_PL " + welcomePl.body)
    check(welcomePl, {
        'status code welcomePl is 200': (welcomePl) => welcomePl.status === 200,
    });

}

export function navPlFlights() {

    const params = {
        param: {
            page: "menu",
            in: "flights"
        }
    };
    let navPlFlights = http.get(PROTOCOL + BASE_URL_WEB_TOURS + "/cgi-bin/nav.pl", params)
    console.log("NAV_PL_FLIGHTS " + navPlFlights.body)
    check(navPlFlights, {
        'status code navPlFlights is 200': (navPlFlights) => navPlFlights.status === 200,
    });
}

export function reservationPlWelcome() {

    const params = {
        "page": "welcome"
    };
    let reservationPlWelcome = http.get(PROTOCOL + BASE_URL_WEB_TOURS + "/cgi-bin/reservations.pl?page=welcome")

    let htmlReq = parseHTML(reservationPlWelcome.body); // equivalent to res.html()
    let departCities = htmlReq.find('select[name="depart"]').children('option');
    let arriveCities = htmlReq.find('select[name="arrive"]').children('option');

    departCity = departCities.get(Math.floor(Math.random() * departCities.size())).text()
    arriveCity = arriveCities.get(Math.floor(Math.random() * arriveCities.size())).text()


    let seatingPreferenceOption = htmlReq.find('input[name="seatPref"]');
    seatPref = seatingPreferenceOption.get(Math.floor(Math.random() * seatingPreferenceOption.size())).getAttribute('value');


    let typeOfSeatOption = htmlReq.find('input[name="seatType"]');
    typeOfSeat = typeOfSeatOption.get(Math.floor(Math.random() * seatingPreferenceOption.size())).getAttribute('value');

    console.log("SEAT_PREF " + seatingPreferenceOption.size())

    console.log("DEPART_CITY " + departCity)
    console.log("ARRIVE_CITY " + arriveCity)


    console.log("SEAT_PREF " + seatPref)
    console.log("TYPE_OF_SEAT " + typeOfSeat)

    console.log("!!!!!!BODY " + reservationPlWelcome.body)


    check(reservationPlWelcome, {
        'status code RESERVATION_PL_WELCOME is 200': (reservationPlWelcome) => reservationPlWelcome.status === 200,
    });
}


export function reservationPlFlight1() {

    // const formData = new FormData();
    // formData.append('advanceDiscount', '0');
    // formData.append('depart', departCity);
    // formData.append('departDate', '12/06/2025');
    // formData.append('arrive', arriveCity);
    // formData.append('returnDate', '12/09/2025');
    // formData.append('numPassengers', '1');
    // formData.append('seatPref', seatPref);
    // formData.append('seatType', typeOfSeat);
    // formData.append('login.x', `49`);
    // formData.append('login.y', `11`);
    // formData.append('.cgifields', `roundtrip`);
    // formData.append('.cgifields', `seatType`);
    // formData.append('.cgifields', `seatPref`);

    // const payload = {
    //     advanceDiscount: 0,
    //     depart: departCity,
    //     departDate: '12/06/2025',
    //     arrive: arriveCity,
    //     returnDate: '12/09/2025',
    //     numPassengers: 1,
    //     seatPref: seatPref,
    //     seatType: typeOfSeat,
    //     'login.x': 49,
    //     'login.y': 11,
    //     '.cgifields': ['roundtrip', 'seatType', 'seatPref']
    // }

    const today = new Date();
    const departDate = getFormattedDate(today);

    const returnDateObj = new Date(today);
    returnDateObj.setDate(today.getDate() + 7); // Возврат через 7 дней
    const returnDate = getFormattedDate(returnDateObj);

    console.log("DEPART_DATE " + departDate + " RETURN_DATE " + returnDate)

    const payload = {
        advanceDiscount: '0',
        depart: departCity,
        departDate: departDate,
        arrive: arriveCity,
        returnDate: returnDate,
        numPassengers: '1',
        seatPref: seatPref,
        seatType: typeOfSeat,
        'findFlights.x': '46',
        'findFlights.y': '14',
        '.cgifields': ['roundtrip', 'seatType', 'seatPref'] // массив для мультиселекта
    };

    console.log("PAYLOAD " + payload[".cgifields"])
    console.log("PAYLOAD " + payload.depart)
    console.log("PAYLOAD " + payload.arrive)
    console.log("PAYLOAD " + payload.departDate)
    console.log("PAYLOAD " + payload.seatPref)
    console.log("PAYLOAD " + payload.typeOfSeat)
    console.log("PAYLOAD " + payload["login.x"])
    console.log("PAYLOAD " + payload["login.y"])


    // const payload21 = 'advanceDiscount=0&depart=Paris&departDate=10%2F29%2F2025&arrive=Los+Angeles&returnDate=11%2F23%2F2025&numPassengers=1&seatPref=Window&seatType=Business&findFlights.x=46&findFlights.y=14&.cgifields=roundtrip&.cgifields=seatType&.cgifields=seatPref';

    let reservationPlFlight1 = http.post(PROTOCOL + BASE_URL_WEB_TOURS + "/cgi-bin/reservations.pl", payload,
        {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive'
            }
        });
    console.log("STATUS_REQUEST " + reservationPlFlight1.status)
    console.log("REQUEST_BODY!!! " + reservationPlFlight1.body)


    let htmlReq1 = parseHTML(reservationPlFlight1.body); // equivalent to res.html()
    console.log("HTML_REQUEST " + htmlReq1)
    let outboundFlightOption = htmlReq1.find('input[name="outboundFlight"]');

    outboundFlight = outboundFlightOption.get(Math.floor(Math.random() * outboundFlightOption.size())).getAttribute('value');
    console.log("OUTBOUND_OPTION " + outboundFlightOption.size())
    console.log("OUTBOUND " + outboundFlight)

    check(reservationPlFlight1, {
        'status code RESERVATION_PL_FLIGHTS is 200': (reservationPlFlight1) => reservationPlFlight1.status === 200,
    });
}

export function reservationPlCurrentFlight() {

    const payload = {
        outboundFlight: outboundFlight,
        numPassengers: '1',
        advanceDiscount: '0',
        seatType: typeOfSeat,
        seatPref: seatPref,
        'reserveFlights.x': '44',
        'reserveFlights.y': '13'
    }

    let reservationPlCurrentFlight = http.post(PROTOCOL + BASE_URL_WEB_TOURS + "/cgi-bin/reservations.pl", payload);
    console.log("STATUS_REQUEST " + reservationPlCurrentFlight.status)
    console.log("REQUEST_BODY!!! " + reservationPlCurrentFlight.body)

    let htmlReq1 = parseHTML("reservationPlCurrentFlight " + reservationPlCurrentFlight.body); // equivalent to res.html()
    console.log("STATUS " + reservationPlCurrentFlight.status)

    check(reservationPlCurrentFlight, {
        'status code reservationPlCurrentFlight is 200': (reservationPlCurrentFlight) => reservationPlCurrentFlight.status === 200,
    });
}

export function confirmPassengerData() {

    const payload = {
        seatPref: seatPref,
        typeOfSeat: typeOfSeat,
        returnFlight: '',
        pass1: credentials.pass1,
        outboundFlight: outboundFlight,
        oldCCOption: '',
        numPassengers: 1,
        lastName: credentials.lastName,
        JSFormSubmit: 'off',
        firstName: credentials.firstName,
        expDate: credentials.expDate,
        creditCard: credentials.creditCard,
        'buyFlights.y': '8',
        'buyFlights.x': '21',
        advanceDiscount: '0',
        address2: credentials.address2,
        address1: credentials.address1,
        '.cgifields': 'saveCC'
    }

    let confirmPassengerData = http.post("http://webtours.load-test.ru:1080/cgi-bin/reservations.pl", payload);
    console.log("STATUS_REQUEST " + confirmPassengerData.status)
    console.log("REQUEST_BODY!!! " + confirmPassengerData.body)

    let htmlReq1 = parseHTML(confirmPassengerData.body); // equivalent to res.html()
    console.log("STATUS " + confirmPassengerData.status)

    check(confirmPassengerData, {
        'status code confirmPassengerData is 200': (confirmPassengerData) => confirmPassengerData.status === 200,
    });
}

export function getYaRu() {
    let getYaRu = http.get("https://ya.ru/")

    check(getYaRu, {
        'status code getYaRu is 200': (getYaRu) => getYaRu.status === 200,
    });
}

export function getRu() {
    let getRu = http.get("https://www.ru/")

    check(getRu, {
        'status code getRu is 200': (getRu) => getRu.status === 200,
    });
}
