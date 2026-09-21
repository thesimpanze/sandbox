import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Maximize2,
  Minimize2,
  Layers,
  MapPin,
  Building2,
  Star,
  CheckCircle2,
  Clock,
  Briefcase,
  Laptop,
  Coins
} from 'lucide-react';
import GroupingDropZone, { COLUMN_LABELS } from './GroupingDropZone';

// Formatter Rupiah
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number);
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const configs = {
    Active: { bg: 'badge-success', icon: CheckCircle2, text: 'Active' },
    Remote: { bg: 'badge-info', icon: Laptop, text: 'Remote' },
    'On Leave': { bg: 'badge-warning', icon: Clock, text: 'On Leave' },
    Contract: { bg: 'badge-neutral', icon: Briefcase, text: 'Contract' },
  };
  const config = configs[status] || { bg: 'badge-neutral', icon: Briefcase, text: status };
  const Icon = config.icon;

  return (
    <span className={`status-pill ${config.bg}`}>
      <Icon size={12} className="pill-icon" />
      {config.text}
    </span>
  );
};

export default function DataTable({ data }) {
  // TanStack Table states
  const [grouping, setGrouping] = useState(() => {
    // Baca memori dari localStorage saat komponen pertama kali dimuat
    const savedGrouping = localStorage.getItem('table-grouping-memory');
    if (savedGrouping) {
      try {
        return JSON.parse(savedGrouping);
      } catch (err) {
        console.error("Gagal membaca memori grouping:", err);
      }
    }
    return ['department']; // Default jika belum ada memori
  });
  const [expanded, setExpanded] = useState(true); // Default expand all
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Simpan memori grouping ke localStorage setiap kali ada perubahan
  useEffect(() => {
    localStorage.setItem('table-grouping-memory', JSON.stringify(grouping));
  }, [grouping]);

  // Column definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: 'Nama Karyawan',
        enableGrouping: false, // Cannot be grouped
        cell: ({ row, getValue }) => {
          const emp = row.original;
          return (
            <div className="employee-cell">
              <div className="avatar-circle">
                {getValue()
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="employee-info">
                <span className="emp-name">{getValue()}</span>
                <span className="emp-email">{emp?.email || '-'}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'department',
        id: 'department',
        header: 'Departemen',
        enableGrouping: true,
        cell: ({ getValue }) => (
          <div className="cell-flex">
            <Building2 size={15} className="text-muted" />
            <span className="font-medium">{getValue()}</span>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        id: 'role',
        header: 'Jabatan / Role',
        enableGrouping: true,
        cell: ({ getValue }) => (
          <span className="role-tag">{getValue()}</span>
        ),
      },
      {
        accessorKey: 'level',
        id: 'level',
        header: 'Jenjang Level',
        enableGrouping: true,
        cell: ({ getValue }) => {
          const levelColors = {
            Junior: 'level-junior',
            'Mid-Level': 'level-mid',
            Senior: 'level-senior',
            Lead: 'level-lead',
          };
          return (
            <span className={`level-badge ${levelColors[getValue()] || ''}`}>
              {getValue()}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: 'Status Kerja',
        enableGrouping: true,
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      },
      {
        accessorKey: 'location',
        id: 'location',
        header: 'Lokasi Kantor',
        enableGrouping: true,
        cell: ({ getValue }) => (
          <div className="cell-flex">
            <MapPin size={14} className="text-accent" />
            <span>{getValue()}</span>
          </div>
        ),
      },
      {
        accessorKey: 'salary',
        id: 'salary',
        header: 'Gaji Bulanan',
        enableGrouping: false,
        aggregationFn: 'sum',
        cell: ({ getValue }) => (
          <span className="salary-text">{formatRupiah(getValue())}</span>
        ),
        aggregatedCell: ({ getValue }) => (
          <div className="aggregated-box salary-agg">
            <Coins size={13} />
            <span>Total: <strong>{formatRupiah(getValue())}</strong></span>
          </div>
        ),
      },
      {
        accessorKey: 'projects',
        id: 'projects',
        header: 'Proyek Aktif',
        enableGrouping: false,
        aggregationFn: 'sum',
        cell: ({ getValue }) => (
          <span className="projects-count">{getValue()} proyek</span>
        ),
        aggregatedCell: ({ getValue }) => (
          <div className="aggregated-box projects-agg">
            <span>Total: <strong>{getValue()} proyek</strong></span>
          </div>
        ),
      },
      {
        accessorKey: 'performance',
        id: 'performance',
        header: 'Rating Performa',
        enableGrouping: false,
        aggregationFn: 'mean',
        cell: ({ getValue }) => (
          <div className="rating-pill">
            <Star size={13} className="star-icon" fill="currentColor" />
            <span>{Number(getValue()).toFixed(1)}</span>
          </div>
        ),
        aggregatedCell: ({ getValue }) => (
          <div className="aggregated-box rating-agg">
            <Star size={12} fill="currentColor" />
            <span>Rata-rata: <strong>{Number(getValue()).toFixed(1)}</strong></span>
          </div>
        ),
      },
    ],
    []
  );

  const defaultColumnOrder = useMemo(() => columns.map(c => c.id), [columns]);
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('table-column-order');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return defaultColumnOrder;
  });

  useEffect(() => {
    localStorage.setItem('table-column-order', JSON.stringify(columnOrder));
  }, [columnOrder]);

  // TanStack Table Instance
  const table = useReactTable({
    data,
    columns,
    state: {
      grouping,
      expanded,
      sorting,
      globalFilter,
      columnOrder,
    },
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Toggle single column group from header button
  const handleToggleColumnGroup = (columnId) => {
    if (grouping.includes(columnId)) {
      setGrouping(grouping.filter((id) => id !== columnId));
    } else {
      setGrouping([...grouping, columnId]);
    }
  };

  // Check how many rows match
  const totalRowsCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="data-table-container">
      {/* 1. Grouping Drop Zone */}
      <GroupingDropZone
        grouping={grouping}
        onGroupingChange={setGrouping}
        availableColumns={columns.filter((c) => c.enableGrouping)}
      />

      {/* 2. Table Controls & Toolbar */}
      <div className="table-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Cari karyawan, jabatan, departemen, atau lokasi..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="search-input"
          />
          {globalFilter && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setGlobalFilter('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="toolbar-actions">
          {grouping.length > 0 && (
            <>
              <button
                type="button"
                className="btn-action"
                onClick={() => table.toggleAllRowsExpanded(true)}
                title="Buka semua grup"
              >
                <Maximize2 size={14} />
                Buka Semua
              </button>
              <button
                type="button"
                className="btn-action"
                onClick={() => table.toggleAllRowsExpanded(false)}
                title="Tutup semua grup"
              >
                <Minimize2 size={14} />
                Tutup Semua
              </button>
            </>
          )}

          <div className="stats-badge">
            <span>
              {table.getPreGroupedRowModel().rows.length} Total Data
              {grouping.length > 0 && ` (${grouping.length} Level Group)`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Table Element */}
      <div className="table-responsive-wrapper">
        <table className="enterprise-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canGroup = header.column.getCanGroup();
                  const isGrouped = header.column.getIsGrouped();

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={`th-cell ${canGroup ? 'th-groupable' : ''} ${
                        isGrouped ? 'th-is-grouped' : ''
                      }`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          'text/plain',
                          JSON.stringify({ type: 'COLUMN_HEADER', columnId: header.column.id })
                        );
                        e.dataTransfer.effectAllowed = 'copyMove';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        try {
                          const raw = e.dataTransfer.getData('text/plain');
                          if (!raw) return;
                          const data = JSON.parse(raw);
                          if (data.type === 'COLUMN_HEADER' && data.columnId !== header.column.id) {
                            const draggedColId = data.columnId;
                            const targetColId = header.column.id;
                            
                            const newOrder = [...columnOrder];
                            const draggedIdx = newOrder.indexOf(draggedColId);
                            const targetIdx = newOrder.indexOf(targetColId);
                            
                            if (draggedIdx !== -1 && targetIdx !== -1) {
                              newOrder.splice(draggedIdx, 1);
                              newOrder.splice(targetIdx, 0, draggedColId);
                              setColumnOrder(newOrder);
                            }
                          }
                        } catch (err) {
                          console.error("Gagal melakukan reorder kolom:", err);
                        }
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="th-content-wrapper">
                          {/* Drag Handle Indicator */}
                          {canGroup && (
                            <div
                              className="th-drag-handle"
                              title="Tarik (drag) kolom ini ke Area Grouping atau geser ke kolom lain untuk Reorder"
                            >
                              <GripVertical size={15} />
                            </div>
                          )}

                          {/* Column Title with Sorting */}
                          <div
                            className="th-title-sortable"
                            onClick={header.column.getToggleSortingHandler()}
                            title="Klik untuk mengurutkan data (sort)"
                          >
                            <span className="th-title-text">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>

                            {/* Sort icons */}
                            <span className="sort-icon-box">
                              {{
                                asc: <ArrowUp size={13} className="text-active" />,
                                desc: <ArrowDown size={13} className="text-active" />,
                              }[header.column.getIsSorted()] ?? (
                                <ChevronsUpDown size={13} className="text-faint" />
                              )}
                            </span>
                          </div>

                          {/* Quick Group Toggle Button */}
                          {canGroup && (
                            <button
                              type="button"
                              className={`btn-th-group-toggle ${
                                isGrouped ? 'active' : ''
                              }`}
                              onClick={() => handleToggleColumnGroup(header.column.id)}
                              title={
                                isGrouped
                                  ? 'Lepaskan grouping kolom ini'
                                  : 'Group kolom ini'
                              }
                            >
                              <Layers size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="no-data-cell">
                  <div className="no-data-content">
                    <Search size={32} className="text-muted" />
                    <p>Tidak ada data yang sesuai dengan pencarian.</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isGroupedRow = row.getIsGrouped();

                return (
                  <tr
                    key={row.id}
                    className={`table-row ${isGroupedRow ? 'row-grouped' : 'row-leaf'} depth-${row.depth}`}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td
                          key={cell.id}
                          className={`td-cell ${cell.getIsGrouped() ? 'td-grouped-header' : ''} ${
                            cell.getIsAggregated() ? 'td-aggregated' : ''
                          } ${cell.getIsPlaceholder() ? 'td-placeholder' : ''}`}
                        >
                          {cell.getIsGrouped() ? (
                            // Cell Grouped Header: Indented Chevron & Group Title & Count
                            <div
                              className="grouped-row-expander"
                              style={{
                                paddingLeft: `${row.depth * 20}px`,
                              }}
                            >
                              <button
                                type="button"
                                className="btn-row-expand"
                                onClick={row.getToggleExpandedHandler()}
                                aria-label={row.getIsExpanded() ? 'Tutup group' : 'Buka group'}
                              >
                                {row.getIsExpanded() ? (
                                  <ChevronDown size={16} className="chevron-icon" />
                                ) : (
                                  <ChevronRight size={16} className="chevron-icon" />
                                )}
                              </button>

                              <div className="grouped-label-container">
                                <span className="group-category-name">
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </span>
                                <span className="subrows-count-badge">
                                  {row.subRows.length} orang
                                </span>
                              </div>
                            </div>
                          ) : cell.getIsAggregated() ? (
                            // Aggregated summary cell (Sum, Average, etc.)
                            flexRender(
                              cell.column.columnDef.aggregatedCell ??
                                cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          ) : cell.getIsPlaceholder() ? (
                            // Empty placeholder when column is grouped above
                            null
                          ) : (
                            // Regular Leaf Cell
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Table Footer Info */}
      <div className="table-footer-bar">
        <div className="footer-left">
          <span>Menampilkan <strong>{table.getRowModel().rows.length}</strong> baris (termasuk header grup)</span>
        </div>
        <div className="footer-right">
          <span className="hint-text">
            💡 Tips: Anda bisa drag beberapa kolom sekaligus untuk membuat multi-level grouping hierarki.
          </span>
        </div>
      </div>
    </div>
  );
}
