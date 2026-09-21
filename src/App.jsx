import React, { useState } from 'react';
import DataTable from './components/DataTable';
import ExplanationCard from './components/ExplanationCard';
import { initialEmployees } from './data/mockData';
import { 
  TableProperties, 
  Layers, 
  Sparkles, 
  Zap
} from 'lucide-react';
import './App.css';

function App() {
  const [employees, setEmployees] = useState(initialEmployees);

  return (
    <div className="app-container">
      {/* Top Navigation / Brand Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-badge">
            <div className="brand-logo-glow">
              <TableProperties size={22} className="brand-icon" />
            </div>
            <div className="brand-text">
              <div className="brand-title-row">
                <h1>TanStack Table Grouping</h1>
                <span className="badge-version">v8.21</span>
              </div>
              <p className="brand-desc">Enterprise Drag & Drop Column Grouping Demo</p>
            </div>
          </div>

          <div className="header-meta">
            <div className="meta-pill">
              <Zap size={14} className="text-warning" />
              <span>Multi-Level Nesting</span>
            </div>
            <div className="meta-pill">
              <Layers size={14} className="text-accent" />
              <span>Drag & Drop Native</span>
            </div>
            <div className="meta-pill">
              <Sparkles size={14} className="text-success" />
              <span>Auto Aggregasi</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Intro banner */}
        <section className="intro-section">
          <div className="intro-text">
            <h2>Data Karyawan Perusahaan (Hierarchical Grouping)</h2>
            <p>
              Tarik (drag) header kolom bertanda <strong>⠿</strong> (seperti <em>Departemen</em>, <em>Jabatan</em>, <em>Status</em>, atau <em>Lokasi</em>) 
              ke <strong>Area Grouping</strong> di atas tabel. Baris data akan langsung dikelompokkan secara hierarkis dengan perhitungan agregat (Total Gaji, Rata-rata Rating).
            </p>
          </div>
        </section>

        {/* The Interactive Data Table with Drag Grouping */}
        <DataTable data={employees} />

        {/* Educational Guide & Code Snippet */}
        <section className="guide-section">
          <ExplanationCard />
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Dibuat dengan <strong>React</strong> &amp; <strong>@tanstack/react-table v8</strong> — Drag column grouping sample.
        </p>
      </footer>
    </div>
  );
}

export default App;
