import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange,
  showItemsPerPage = true 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const itemsPerPageOptions = [10, 25, 50, 100];

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // 如果總頁數不多，顯示所有頁數
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 如果頁數很多，智能顯示頁數
      if (currentPage <= 3) {
        // 在前面幾頁
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 在後面幾頁
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 在中間
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span className="text-sm text-gray-600">
          顯示第 {startItem} 到 {endItem} 筆，共 {totalItems} 筆記錄
        </span>
        
        {showItemsPerPage && (
          <div className="pagination-per-page">
            <label className="text-sm text-gray-600 mr-2">每頁顯示：</label>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
              className="pagination-select"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          {/* 上一頁 */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn pagination-btn-nav"
            title="上一頁"
          >
            <ChevronLeft size={16} />
          </button>

          {/* 頁碼 */}
          {generatePageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="pagination-ellipsis">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={`pagination-btn ${
                    currentPage === page ? 'pagination-btn-active' : 'pagination-btn-page'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          {/* 下一頁 */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn pagination-btn-nav"
            title="下一頁"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;