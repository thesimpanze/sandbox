import React, { useState } from 'react';
import { 
  Layers, 
  X, 
  GripVertical, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  Info
} from 'lucide-react';

export const COLUMN_LABELS = {
  department: 'Departemen',
  status: 'Status Kerja',
  location: 'Lokasi Kantor',
  level: 'Jenjang Level',
  role: 'Jabatan / Role',
};

export default function GroupingDropZone({
  grouping = [],
  onGroupingChange,
  availableColumns = [],
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedChipIndex, setDraggedChipIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);

  // Handle Drag Over the main zone
  const handleZoneDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleZoneDragLeave = (e) => {
    // Only turn off if leaving the parent container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
      setDropTargetIndex(null);
    }
  };

  // Handle Drop in the zone
  const handleZoneDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setDropTargetIndex(null);

    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return;

    try {
      const data = JSON.parse(rawData);

      // 1. If dragging a column header into the zone
      if (data.type === 'COLUMN_HEADER') {
        const columnId = data.columnId;
        if (!grouping.includes(columnId)) {
          // If dropped at a specific target position
          if (dropTargetIndex !== null && dropTargetIndex >= 0) {
            const nextGrouping = [...grouping];
            nextGrouping.splice(dropTargetIndex, 0, columnId);
            onGroupingChange(nextGrouping);
          } else {
            onGroupingChange([...grouping, columnId]);
          }
        }
      }

      // 2. If reordering existing grouping chips
      if (data.type === 'GROUP_CHIP') {
        const fromIndex = data.index;
        const targetIdx = dropTargetIndex !== null ? dropTargetIndex : grouping.length - 1;
        if (fromIndex !== targetIdx && fromIndex >= 0 && targetIdx >= 0) {
          const updated = [...grouping];
          const [removed] = updated.splice(fromIndex, 1);
          updated.splice(targetIdx, 0, removed);
          onGroupingChange(updated);
        }
      }
    } catch (err) {
      console.error('Failed to parse drag data:', err);
    }
    setDraggedChipIndex(null);
  };

  // Remove a specific column from grouping
  const handleRemove = (colId) => {
    onGroupingChange(grouping.filter((id) => id !== colId));
  };

  // Clear all groupings
  const handleClearAll = () => {
    onGroupingChange([]);
  };

  // Quick preset shortcuts
  const presets = [
    { label: 'Departemen', keys: ['department'] },
    { label: 'Departemen ➔ Status', keys: ['department', 'status'] },
    { label: 'Lokasi ➔ Level', keys: ['location', 'level'] },
    { label: 'Departemen ➔ Lokasi', keys: ['department', 'location'] },
  ];

  return (
    <div className="grouping-panel-wrapper">
      <div className="grouping-header-bar">
        <div className="grouping-title-area">
          <div className="grouping-icon-badge">
            <Layers className="icon-main" size={18} />
          </div>
          <div>
            <h2 className="grouping-heading">Area Grouping Kolom</h2>
            <p className="grouping-subheading">
              Tarik (drag) header kolom dari tabel ke panel ini untuk mengelompokkan data secara hierarkis.
            </p>
          </div>
        </div>

        {grouping.length > 0 && (
          <button 
            type="button" 
            className="btn-clear-grouping"
            onClick={handleClearAll}
            title="Hapus semua grouping"
          >
            <RotateCcw size={14} />
            Reset Grouping
          </button>
        )}
      </div>

      {/* Main Drop Target Area */}
      <div
        className={`drop-zone-container ${isDragOver ? 'is-drag-over' : ''} ${
          grouping.length > 0 ? 'has-items' : 'is-empty'
        }`}
        onDragOver={handleZoneDragOver}
        onDragLeave={handleZoneDragLeave}
        onDrop={handleZoneDrop}
      >
        {grouping.length === 0 ? (
          <div className="empty-drop-placeholder">
            <div className="empty-icon-pulse">
              <Layers size={28} />
            </div>
            <div className="empty-text">
              <strong>Tarik Header Kolom ke Sini</strong>
              <span>
                Coba drag kolom seperti <em>Departemen</em>, <em>Status</em>, atau <em>Lokasi</em> ke area ini.
              </span>
            </div>
          </div>
        ) : (
          <div className="group-chips-list">
            <span className="group-order-label">Tingkat Grouping:</span>
            {grouping.map((colId, index) => {
              const label = COLUMN_LABELS[colId] || colId;
              const isBeingDragged = draggedChipIndex === index;

              return (
                <React.Fragment key={colId}>
                  <div
                    draggable
                    onDragStart={(e) => {
                      setDraggedChipIndex(index);
                      e.dataTransfer.setData(
                        'text/plain',
                        JSON.stringify({ type: 'GROUP_CHIP', columnId: colId, index })
                      );
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => {
                      setDraggedChipIndex(null);
                      setDropTargetIndex(null);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDropTargetIndex(index);
                    }}
                    className={`group-chip ${isBeingDragged ? 'chip-dragging' : ''} ${
                      dropTargetIndex === index ? 'chip-target' : ''
                    }`}
                    title="Drag untuk mengubah urutan prioritas grouping"
                  >
                    <GripVertical size={14} className="chip-grip" />
                    <span className="chip-index">{index + 1}</span>
                    <span className="chip-name">{label}</span>
                    <button
                      type="button"
                      className="chip-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(colId);
                      }}
                      title={`Hapus grouping ${label}`}
                      aria-label={`Hapus grouping ${label}`}
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {index < grouping.length - 1 && (
                    <div className="chip-arrow">
                      <ArrowRight size={14} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Hint for adding more */}
            <div className="drop-more-hint">
              <span>+ Tarik kolom lain untuk sub-grouping</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Presets & Tips Bar */}
      <div className="presets-and-tips">
        <div className="presets-group">
          <span className="presets-label">
            <Sparkles size={13} /> Preset Cepat:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`preset-pill ${
                JSON.stringify(grouping) === JSON.stringify(preset.keys) ? 'active' : ''
              }`}
              onClick={() => onGroupingChange(preset.keys)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="tips-badge">
          <Info size={13} />
          <span>Chip grouping dapat di-drag antar posisi untuk mengubah hierarki</span>
        </div>
      </div>
    </div>
  );
}
