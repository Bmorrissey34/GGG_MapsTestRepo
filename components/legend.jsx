// components/legend.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

const HOVER_TARGETS = {
  academicBuilding: { selector: ".building-group:not(.student-housing)" },
  studentHousing: { selector: ".building-group.student-housing" },
  parkingFacultyStaff: { selector: ".staff-parking" },
  parkingResidents: { selector: ".resident-parking" },
  parkingStudents: { selector: ".student-parking" },
  parkingHandicap: { selector: ".handicap-parking" },
  restrictedArea: { selector: ".restricted-area" },
};

const TRANSLATIONS = {
  en: {
    legendTitle: "Legend",
    toggleHide: "Hide legend",
    toggleShow: "Show legend",
    languageLabel: "Language",
    languageEnglish: "English",
    languageSpanish: "Spanish",
    academicBuilding: "Academic Building",
    studentHousing: "Student Housing",
    parking: "Parking",
    parkingFacultyStaff: "Faculty/Staff",
    parkingResidents: "Residents",
    parkingStudents: "Students",
    parkingHandicap: "Handicap",
    restrictedArea: "Restricted Area",
  },
  es: {
    legendTitle: "Leyenda",
    toggleHide: "Ocultar leyenda",
    toggleShow: "Mostrar leyenda",
    languageLabel: "Idioma",
    languageEnglish: "Ingl\u00e9s",
    languageSpanish: "Espa\u00f1ol",
    academicBuilding: "Edificio acad\u00e9mico",
    studentHousing: "Residencias estudiantiles",
    parking: "Estacionamiento",
    parkingFacultyStaff: "Personal/Profesorado",
    parkingResidents: "Residentes",
    parkingStudents: "Estudiantes",
    parkingHandicap: "Acceso para discapacitados",
    restrictedArea: "\u00c1rea restringida",
  },
};

const FALLBACK_LOCALE = "en";
const SUPPORTED_LOCALES = ["en", "es"];

const BASE_ITEMS = [
  { color: "#0f5132", labelKey: "academicBuilding" },
  { color: "#6b21a8", labelKey: "studentHousing" },
];

const PARKING_ITEMS = [
  { color: "#e874be", labelKey: "parkingFacultyStaff" },
  { color: "#e8bf74", labelKey: "parkingResidents" },
  { color: "#86efac", labelKey: "parkingStudents" },
  { color: "#93c5fd", labelKey: "parkingHandicap" },
];

const FLOATING_CONTAINER_STYLE = {
  top: "clamp(80px, 15vh, 250px)",
  right: "clamp(40px, 6vw, 200px)",
  zIndex: 1000,
  pointerEvents: "auto",
};

const normalizeLocale = (value) => {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (SUPPORTED_LOCALES.includes(lower)) return lower;
  return SUPPORTED_LOCALES.find((loc) => lower.startsWith(loc)) ?? null;
};

const getStoredLocale = () => {
  if (typeof window === "undefined") return null;
  return normalizeLocale(window.localStorage.getItem("legendLocale"));
};

/** Reusable row with color square + label */
function SwatchItem({ color, label, className = "", onEnter, onLeave }) {
  const classes = ["legend-item d-flex align-items-center gap-2", className].filter(Boolean).join(" ");
  return (
    <li
      className={classes}
      onMouseEnter={() => onEnter?.()}
      onMouseLeave={() => onLeave?.()}
      style={{ wordBreak: "break-word" }}
    >
      <span
        className="legend-swatch d-inline-block border rounded"
        style={{ width: "14px", height: "14px", backgroundColor: color, flexShrink: 0 }}
      />
      <span className="legend-item-label">{label}</span>
    </li>
  );
}

export default function Legend({ locale = FALLBACK_LOCALE, mapScopeSelector, floating = false, className = "" }) {
  void mapScopeSelector;

  const [open, setOpen] = useState(true);
  const [userOverride, setUserOverride] = useState(false);
  const [currentLocale, setCurrentLocale] = useState(
    () => normalizeLocale(locale) ?? FALLBACK_LOCALE
  );

  const messages = useMemo(
    () => TRANSLATIONS[currentLocale] ?? TRANSLATIONS[FALLBACK_LOCALE],
    [currentLocale]
  );
  const fallbackMessages = TRANSLATIONS[FALLBACK_LOCALE];
  const t = (key) => messages[key] ?? fallbackMessages[key] ?? key;

  const sendHover = (source, detail) => {
    if (typeof window === "undefined" || !detail) return;
    window.dispatchEvent(new CustomEvent("ggcmap-hover", { detail: { source, ...detail } }));
  };

  const clearHover = (source) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("ggcmap-hover-clear", { detail: { source } }));
  };

  const getHoverHandlers = (key) => {
    const detail = HOVER_TARGETS[key];
    if (!detail) return {};
    const source = `legend:${key}`;
    return {
      onEnter: () => sendHover(source, detail),
      onLeave: () => clearHover(source),
    };
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedLocale = getStoredLocale();
    if (storedLocale) {
      setCurrentLocale(storedLocale);
      setUserOverride(true);
    }
  }, []);

  // remember panel open state between sessions
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("legendOpen");
    if (saved !== null) setOpen(saved === "1");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("legendOpen", open ? "1" : "0");
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (userOverride) {
      window.localStorage.setItem("legendLocale", currentLocale);
    } else {
      window.localStorage.removeItem("legendLocale");
    }
  }, [currentLocale, userOverride]);

  useEffect(() => {
    if (userOverride) return;
    const normalized = normalizeLocale(locale);
    if (normalized && normalized !== currentLocale) {
      setCurrentLocale(normalized);
    }
  }, [locale, currentLocale, userOverride]);

  const handleLocaleChange = (code) => {
    if (code === currentLocale) return;
    setCurrentLocale(code);
    setUserOverride(true);
  };

  const legendBody = (
    <div
      className={`legend-panel shadow rounded-4${open ? "" : " legend-panel--collapsed"}`}
      role="region"
      aria-label={t("legendTitle")}
    >
      {/* Header row: title + EN/ES cluster close together, collapse button floats right */}
      <div className="legend-header d-flex align-items-center gap-2 mb-2">
        <div className="legend-title fw-bold">{t("legendTitle")}</div>

        <div className="btn-group btn-group-sm ms-2" role="group" aria-label={t("languageLabel")}>
          {SUPPORTED_LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              className={`btn btn-sm ${currentLocale === code ? "btn-secondary" : "btn-outline-secondary"}`}
              onClick={() => handleLocaleChange(code)}
              aria-pressed={currentLocale === code}
              aria-label={t(code === "en" ? "languageEnglish" : "languageSpanish")}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="legend-toggle ms-auto"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="legend-body"
          title={open ? t("toggleHide") : t("toggleShow")}
        >
          <i
            className={`bi ${open ? 'bi-chevron-right' : 'bi-chevron-left'} legend-toggle-icon`}
            aria-hidden="true"
          ></i>
          <span className="visually-hidden">{open ? t("toggleHide") : t("toggleShow")}</span>
        </button>
      </div>

      <div id="legend-body" className="legend-body pt-2" hidden={!open}>
        <ul className="list-unstyled mb-0">
          {BASE_ITEMS.map((item) => (
            <SwatchItem
              key={item.labelKey}
              color={item.color}
              label={t(item.labelKey)}
              className="mb-2"
              {...getHoverHandlers(item.labelKey)}
            />
          ))}

          <li className="mt-3">
            <div className="fw-semibold legend-section-heading">
              {t("parking")}
            </div>
            <ul className="list-unstyled mb-0 ps-3 mt-2">
              {PARKING_ITEMS.map((item) => (
                <SwatchItem
                  key={item.labelKey}
                  color={item.color}
                  label={t(item.labelKey)}
                  className="mb-2"
                  {...getHoverHandlers(item.labelKey)}
                />
              ))}
            </ul>
          </li>

          <SwatchItem
            color="#9ca3af"
            label={t("restrictedArea")}
            className="mt-3 mb-0"
            {...getHoverHandlers("restrictedArea")}
          />
        </ul>
      </div>
    </div>
  );

  if (floating) {
    return (
      <div className="legend-floating position-absolute" style={FLOATING_CONTAINER_STYLE}>
        {legendBody}
      </div>
    );
  }

  const rootClassName = ["legend-slot", className, open ? "" : "is-collapsed"].filter(Boolean).join(" ");

  return (
    <aside className={rootClassName} aria-label={t("legendTitle")}>
      {legendBody}
    </aside>
  );
}
