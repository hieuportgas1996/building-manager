import type { TablePaginationConfig } from 'antd';

export const defaultPagination: TablePaginationConfig = {
  defaultPageSize: 20,
  pageSizeOptions: ['20', '50', '100'],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} dòng`,
};
