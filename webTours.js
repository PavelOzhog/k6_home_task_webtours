import http from 'k6/http';
import {check, group} from 'k6';

import {SharedArray} from 'k6/data';


export const options = {



    vus: 10,
    duration: '30s',

    scenarios: {
otus: {
    exec:"getResp()",
    executor:'constant-arrival-rate',
    duration:'15s',
    rate:10,
    timeUnit: '1s',
    preAllocatedVUs: 60,
    maxVUs:100
}
}}

const BASE_URL = "http://webtours.load-test.ru:1080";

const dataUsers = new SharedArray(
    'data users', function () {
        const file = JSON.parse(open('./users.json'))
        return file.users;
    })

const login = dataUsers.data[0].username;
const password = dataUsers.data[0].password;

export function  getWelcomePage(){

}
