'use client';
import { useState } from 'react';

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const handleToggle = () => setCollapsed(!collapsed);

    return (
        <nav className={`sidebar bg-light border-end ${collapsed ? 'collapsed' : ''}`}>
            <button
                className="btn btn-outline-secondary m-2"
                onClick={handleToggle}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {collapsed ? '▶' : '◀'}
            </button>
            <ul className="nave flex-colmn">
                <li className="nav-item">
                    <a className="nav-link active" href="#">Campus</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building A</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building B</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building C</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building CC</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building D / Admissions</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building E / Student Center</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building F / Wellness and Recreation Center</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building G / Grizzly Athletics</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building H / Allied Health and Science</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building I</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building L / Library</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building P / Library</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building W</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building 1000 / Student Housing</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building 2000 / Student Housing</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">Building 3000 / Student Housing</a>
                </li>
            </ul>
        </nav>
    )
}