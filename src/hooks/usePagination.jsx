import { useState, useMemo } from 'react';

export const usePagination = (data, initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // 當資料變化時，重置到第一頁
  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  // 當每頁顯示數量改變時，智能調整當前頁數
  const handleItemsPerPageChange = (newItemsPerPage) => {
    const currentFirstItem = (currentPage - 1) * itemsPerPage + 1;
    const newPage = Math.ceil(currentFirstItem / newItemsPerPage);
    
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(newPage);
  };

  // 計算分頁後的資料
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  // 總頁數
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // 確保當前頁不超過總頁數
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems: data.length,
    paginatedData,
    setCurrentPage,
    setItemsPerPage: handleItemsPerPageChange,
    resetToFirstPage
  };
};