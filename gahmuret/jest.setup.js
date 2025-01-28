// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import * as dotenv from 'dotenv';
import { TextEncoder, TextDecoder } from 'util';

// required to address missing 'Request' object for Page tests
require('jest-fetch-mock').enableMocks();

dotenv.config({ path: '.env' });

// workaround `ReferenceError: TextEncoder is not defined`
// https://github.com/inrupt/solid-client-authn-js/issues/1676
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// workaround `TypeError: window.matchMedia is not a function`
// https://stackoverflow.com/questions/64813447/cannot-read-property-addlistener-of-undefined-react-testing-library
global.matchMedia = global.matchMedia || function () {
    return {
        addListener: jest.fn(),
        removeListener: jest.fn(),
    };
};
