//import { useState } from 'react';
const maxCharsAllowed=30;

export default function Find(){
    return (
        <div className="d-flex align-items-center" style={{gap: "var(--justin-globe-gap)"}}>
    <label htmlFor="findlabel" className="h4 mb-0" style={{fontFamily: "var(--justin-globe1)",color: "var(--justin-globe1-color)"}}>Find: </label>
    <input id="findInput" className="form-control w-100" placeholder="AEC,gameroom,library" maxLength={maxCharsAllowed} style={{width: "var(--justin-globe-inputBarSize)"}}></input>
    <button id="findInputButton" className="btn btn-primary">Find</button>
    <button id="helpButton" className="btn btn-secondary">Help</button>
    </div>
    );
}