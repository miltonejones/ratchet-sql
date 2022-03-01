import { ChevronsLeft, ChevronLeft, ChevronRight } from '../../icons';
import { IconButton } from '../UI/UI';
import React from 'react';
import './PaginationBar.css';

export const paginate = (startPage, pageSize, length, label) => {
  const beginPage = startPage + 1;
  const pageNum = Math.ceil(beginPage / pageSize);
  const pageLen = Math.ceil(length / pageSize);
  const pageText = `Page ${pageNum} of  ${pageLen} pages`;
  const descText = `${beginPage} to ${Math.min(
    startPage + pageSize,
    length
  )} of  ${length} ${label}s`;
  const thisPage = startPage / pageSize;
  const last = startPage + pageSize >= length;

  return {
    pageText,
    descText,
    thisPage,
    last,
  };
};

const PaginationBar = ({
  startPage,
  pageSize,
  length,
  click,
  label = 'item',
  hideLabel,
}) => {
  const [state, setState] = React.useState({ page: false });
  const pagination = paginate(startPage, pageSize, length, label);
  if (!length || length <= pageSize) return <i />;
  return (
    <div className="PaginationBar">
      {!hideLabel && (
        <>
          {' '}
          <div onClick={() => setState((s) => ({ page: !s.page }))}>
            {state.page ? pagination.pageText : pagination.descText}
          </div>
          <ToolTipButton
            when={() => pagination.thisPage > 1}
            icon={<ChevronsLeft />}
            disabled={startPage < 1}
            click={() => click && click(-pagination.thisPage)}
          />
        </>
      )}
      <ToolTipButton
        icon={<ChevronLeft />}
        disabled={startPage < 1}
        click={() => click(-1)}
      />
      <ToolTipButton
        icon={<ChevronRight />}
        disabled={pagination.last}
        click={() => click(1)}
      />
    </div>
  );
};

PaginationBar.defaultProps = {};
export default PaginationBar;

const ToolTipButton = ({ when, icon, disabled, click }) => {
  if (when && !when()) return <i />;
  return (
    <IconButton ml={2} onClick={click} disabled={disabled}>
      {icon}
    </IconButton>
  );
};
