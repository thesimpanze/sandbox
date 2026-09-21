import React, { useState } from 'react';
import { BookOpen, Code2, ChevronDown, ChevronUp, Copy, Check, Sparkles } from 'lucide-react';

export default function ExplanationCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const codeSnippet = `// 1. Inisialisasi TanStack Table dengan Grouping & Expanding Model
import {
  useReactTable,
  getCoreRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
} from '@tanstack/react-table';

function MyTable({ data, columns }) {
  // State untuk kolom yang sedang di-group
  const [grouping, setGrouping] = useState(['department']);
  const [expanded, setExpanded] = useState(true);

  const table = useReactTable({
    data,
    columns,
    state: { grouping, expanded },
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),     // <-- Wajib untuk Grouping
    getExpandedRowModel: getExpandedRowModel(),   // <-- Wajib untuk Expand/Collapse
  });

  // 2. Logic Drag & Drop Header Kolom
  const handleDragStart = (e, columnId) => {
    e.dataTransfer.setData('text/plain', columnId);
  };

  const handleDropToZone = (e) => {
    e.preventDefault();
    const columnId = e.dataTransfer.getData('text/plain');
    if (columnId && !grouping.includes(columnId)) {
      setGrouping([...grouping, columnId]); // Tambah ke grouping!
    }
  };

  // 3. Render Table Cell
  return (
    <div>
      {/* Drop Zone */}
      <div onDragOver={(e) => e.preventDefault()} onDrop={handleDropToZone}>
        Tarik kolom ke sini untuk grouping: {grouping.join(', ')}
      </div>

      {/* Table Body */}
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>
                {cell.getIsGrouped() ? (
                  // Baris grup: Tampilkan tombol expand + nama kategori + jumlah sub-data
                  <button onClick={row.getToggleExpandedHandler()}>
                    {row.getIsExpanded() ? '▼' : '▶'}{' '}
                    {flexRender(cell.column.columnDef.cell, cell.getContext())} 
                    ({row.subRows.length})
                  </button>
                ) : cell.getIsAggregated() ? (
                  // Baris agregat (Total / Rata-rata)
                  flexRender(cell.column.columnDef.aggregatedCell, cell.getContext())
                ) : cell.getIsPlaceholder() ? (
                  null // Kolom yang di-group dikosongkan di baris anak
                ) : (
                  flexRender(cell.column.columnDef.cell, cell.getContext())
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </div>
  );
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="explanation-card">
      <div 
        className="explanation-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="explanation-title-wrap">
          <div className="icon-code-wrap">
            <Code2 size={18} />
          </div>
          <div>
            <h3>Panduan & Kode Inti (TanStack Table Drag to Group)</h3>
            <p>Klik untuk melihat penjelasan cara kerja 3 pilar: Table State, Drag & Drop, dan Cell Rendering.</p>
          </div>
        </div>
        <button type="button" className="btn-collapse-toggle">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="explanation-body">
          <div className="explanation-grid">
            <div className="guide-box">
              <div className="guide-step">
                <span className="step-num">1</span>
                <div>
                  <strong>Model Row TanStack Table</strong>
                  <p>
                    Wajib menyertakan <code>getGroupedRowModel()</code> dan <code>getExpandedRowModel()</code> dari <code>@tanstack/react-table</code> agar table bisa memproses data berlapis (hierarki).
                  </p>
                </div>
              </div>
              <div className="guide-step">
                <span className="step-num">2</span>
                <div>
                  <strong>HTML5 Drag & Drop Native</strong>
                  <p>
                    Header tabel diberi <code>draggable</code> dan mengirim <code>column.id</code> saat <code>onDragStart</code>. Area drop menerima id kolom dan menambahkannya ke state <code>grouping</code>.
                  </p>
                </div>
              </div>
              <div className="guide-step">
                <span className="step-num">3</span>
                <div>
                  <strong>Pengecekan Tipe Cell</strong>
                  <p>
                    Di <code>&lt;td&gt;</code>, gunakan <code>cell.getIsGrouped()</code> untuk tombol expand/collapse, <code>cell.getIsAggregated()</code> untuk total/rata-rata, dan <code>cell.getIsPlaceholder()</code> untuk cell kosong.
                  </p>
                </div>
              </div>
            </div>

            <div className="code-box">
              <div className="code-box-header">
                <span>Snippet React + TanStack Table v8</span>
                <button 
                  type="button" 
                  className="btn-copy"
                  onClick={handleCopy}
                >
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  {copied ? 'Tersalin!' : 'Salin Kode'}
                </button>
              </div>
              <pre className="code-block">
                <code>{codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
