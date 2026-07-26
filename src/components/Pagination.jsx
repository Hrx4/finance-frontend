export default function Pagination({ pageNumber, totalPages, totalElements, pageSize, onPageChange }) {
  if (totalElements === 0) return null;

  const start = pageNumber * pageSize + 1;
  const end = Math.min((pageNumber + 1) * pageSize, totalElements);

  return (
    <div className="pagination">
      <span>
        Showing {start}–{end} of {totalElements}
      </span>
      <div className="pagination-controls">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 0}
        >
          Previous
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber + 1 >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
