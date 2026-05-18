import React from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/table.css';

export interface Column<T> {
  header: string;
  key: keyof T | string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

const Table = <T extends { id: string | number }>({ 
  columns, 
  data, 
  onEdit, 
  onDelete,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange
}: TableProps<T>) => {
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.header}</th>
              ))}
              {(onEdit || onDelete) && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                {columns.map((col, index) => (
                  <td key={index}>
                    {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td>
                    <div className="actions-cell">
                      {onEdit && (
                        <Pencil 
                          size={18} 
                          className="action-icon" 
                          onClick={() => onEdit(item)} 
                        />
                      )}
                      {onDelete && (
                        <Trash2 
                          size={18} 
                          className="action-icon" 
                          onClick={() => onDelete(item)} 
                        />
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="pagination-info">
          <span>{startItem} – {endItem}</span> de <span>{totalItems}</span> registros
        </div>

        <div className="pagination-controls">
          <button className="pagination-btn" disabled={currentPage === 1} onClick={() => onPageChange?.(currentPage - 1)}>
            <ChevronLeft size={20} />
          </button>
          
          <div className="pagination-pages">
            {currentPage}/{totalPages || 1}
          </div>

          <button className="pagination-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => onPageChange?.(currentPage + 1)}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Table;
