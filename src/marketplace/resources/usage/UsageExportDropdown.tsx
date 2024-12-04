import { FileCsv, FileXls, Printer } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { DropdownButton } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { useNotify } from '@waldur/store/hooks';
import exportAs from '@waldur/table/exporters';
import { ExportData } from '@waldur/table/exporters/types';

import { ComponentUsage, ComponentUserUsage } from './types';
import { getFormattedUsages, getUsagePeriods } from './utils';

export interface UsageExportDropdownProps {
  resource: {
    name: string;
  };
  data: {
    components: OfferingComponent[];
    usages: ComponentUsage[];
    userUsages: ComponentUserUsage[];
  };
  months: number;
}

export const useUsageExport = (props: UsageExportDropdownProps) => {
  const { showError } = useNotify();

  return useCallback(
    (format) => {
      const usages = props.data.usages;
      const userUsages = props.data.userUsages;
      const components = props.data.components;

      const exportData: ExportData = {
        fields: [],
        data: [],
      };
      // Prepare headers
      exportData.fields = [translate('Date')].concat(
        props.data.components.map(
          (c) => c.name + (c.measured_unit ? '/' + c.measured_unit : ''),
        ),
      );

      // Prepare data
      const { labels, periods } = getUsagePeriods(usages, props.months);
      const allFormattedUsages = components.map((component) =>
        getFormattedUsages(
          periods,
          usages.filter((usage) => usage.type === component.type),
          userUsages?.filter(
            (usage) => usage.component_type === component.type,
          ),
        ),
      );

      labels.forEach((label, index) => {
        const hasUsage = allFormattedUsages.some((compUsages) =>
          Number(compUsages[index]?.value),
        );
        if (hasUsage) {
          const record: any[] = [label];
          record.push(
            ...allFormattedUsages.map(
              (compUsages) => compUsages[index]?.value || 'N/A',
            ),
          );
          exportData.data.push(record);
        }
      });

      if (!exportData.data.length) {
        showError(translate('Chart is empty'));
        return;
      }

      exportAs(
        format,
        translate('Usage history') + ' - ' + props.resource.name,
        exportData,
      );
    },
    [props],
  );
};

export const UsageExportDropdown = (props: UsageExportDropdownProps) => {
  const exportUsages = useUsageExport(props);
  return (
    <DropdownButton
      variant="outline btn-outline-default"
      title={translate('Export all')}
    >
      <ActionItem
        title={translate('PDF')}
        action={() => exportUsages('pdf')}
        iconNode={<Printer />}
      />
      <ActionItem
        title={translate('CSV')}
        action={() => exportUsages('csv')}
        iconNode={<FileCsv />}
      />
      <ActionItem
        title={translate('Excel')}
        action={() => exportUsages('excel')}
        iconNode={<FileXls />}
      />
    </DropdownButton>
  );
};
