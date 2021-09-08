import React from 'react';
import ReactDOM from 'react-dom';
import {ChipChipProvider} from "@chip-chip/react-library";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Channel} from "@chip-chip/core/lib";

const channel = new Channel();

// @ts-ignore
window.$ = channel;

ReactDOM.render(
    <React.StrictMode>
        <ChipChipProvider channel={channel}>
            <App/>
        </ChipChipProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
