import { FileCsv, FileXls, Printer } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { DropdownButton } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showInfo } from '@waldur/store/notify';
import exportAs from '@waldur/table/exporters';
import { ExportData } from '@waldur/table/exporters/types';

import { ComponentUsage, ComponentUserUsage } from './types';
import { getFormattedUsages, getUsagePeriods } from './utils';

interface UsageExportDropdownProps {
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

export const UsageExportDropdown = (props: UsageExportDropdownProps) => {
  const dispatch = useDispatch();

  const exportUsages = useCallback(
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
            ...allFormattedUsages.map((compUsages) => compUsages[index].value),
          );
          exportData.data.push(record);
        }
      });

      if (!exportData.data.length) {
        dispatch(showInfo(translate('Chart is empty')));
        return;
      }

      exportAs(
        format,
        translate('Usage history') + ' - ' + props.resource.name,
        exportData,
      );
    },
    [props, dispatch],
  );

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
