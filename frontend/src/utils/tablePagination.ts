import type { TablePaginationConfig } from 'antd';

export const defaultPagination: TablePaginationConfig = {
  defaultPageSize: 10,
  pageSizeOptions: ['10', '20', '50', '100'],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} dòng`,
};
