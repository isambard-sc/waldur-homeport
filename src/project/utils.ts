import { GlobeSimpleIcon, GraduationCapIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  invoiceItemsCostsList,
  KindEnum,
  marketplaceProjectEstimatedCostPoliciesList,
  projectCreditsList,
  projectsRetrieve,
} from 'waldur-js-client';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { getCostPolicyActionOptions } from '@waldur/customer/cost-policies/utils';
import { getLineChartOptions } from '@waldur/dashboard/chart';
import {
  formatProjectCostChart,
  getTeamSizeChart,
  getCreditChartAndOptions,
  getCostChartAndOptions,
} from '@waldur/dashboard/utils';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { Project, User } from '@waldur/workspace/types';

async function getProjectCostData(project: Project) {
  const [invoices, costPolicies] = await Promise.all([
    invoiceItemsCostsList({
      query: {
        project_uuid: project.uuid,
        page: 1,
        page_size: 12,
      },
    }).then((response) => response.data),
    marketplaceProjectEstimatedCostPoliciesList({
      query: {
        scope_uuid: project.uuid,
        page: 1,
        page_size: 3,
      },
    }).then((response) => response.data),
  ]);
  return { invoices, costPolicies };
}

export function useProjectCostChart(project: Project) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ProjectCostData', project?.uuid],
    queryFn: () => (project ? getProjectCostData(project) : null),
    staleTime: 5 * 60 * 1000,
  });

  const chartData = useMemo(() => {
    if (!data) return { chart: null, options: null };
    const chart = formatProjectCostChart(data.invoices);

    const hlines = (data.costPolicies || []).map((item) => {
      const limitCost = defaultCurrency(item.limit_cost);
      const projectCredit = item.project_credit
        ? defaultCurrency(item.project_credit)
        : null;

      const totalCost = item.limit_cost + (item.project_credit || 0);
      const totalCostFormatted = defaultCurrency(totalCost);
      const action = getCostPolicyActionOptions().find(
        (option) => option.value === item.actions,
      )?.label;

      const label = projectCredit
        ? `Policy: ${action}\n${translate('Sum')}: ${totalCostFormatted}, ${translate('Limit')}: ${limitCost}, ${translate('Credit')}: ${projectCredit}`
        : `Policy: ${action}\n${translate('Limit')}: ${limitCost}`;

      return {
        label,
        value: totalCost,
      };
    });

    return getCostChartAndOptions(chart, hlines);
  }, [data]);

  return {
    isLoading,
    error,
    refetch,
    chart: chartData?.chart,
    options: chartData?.options,
  };
}

export function useProjectCreditChart(project: Project) {
  const {
    data: costData,
    isLoading: isCostLoading,
    error: costError,
    refetch: refetchCost,
  } = useQuery({
    queryKey: ['ProjectCostData', project.uuid],
    queryFn: () => getProjectCostData(project),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: creditData,
    isLoading: isCreditLoading,
    error: creditError,
    refetch: refetchCredit,
  } = useQuery({
    queryKey: ['ProjectCreditData', project?.uuid],

    queryFn: () =>
      projectCreditsList({
        query: { project_uuid: project?.uuid },
      }).then((response) => response.data.length > 0 && response.data[0]),

    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const chartData = useMemo(() => {
    if (!costData || !creditData) return { chart: null, options: null };
    return getCreditChartAndOptions(costData.invoices, creditData?.value);
  }, [costData, creditData]);

  return {
    credit: creditData,
    isLoading: isCostLoading || isCreditLoading,
    error: costError || creditError,
    refetch: () => {
      refetchCost();
      refetchCredit();
    },
    chart: chartData.chart,
    options: chartData.options,
  };
}

export const getProjectTeamChart = async (project: Project) => {
  const chart = await getTeamSizeChart(project);
  if (chart) {
    return {
      chart,
      options: getLineChartOptions(chart),
    };
  }
  return null;
};

export const canEditProject = (user: User, context: { customer?; project? }) =>
  hasPermission(user, {
    permission: PermissionEnum.UPDATE_PROJECT,
    customerId: context?.customer?.uuid,
  }) ||
  hasPermission(user, {
    permission: PermissionEnum.UPDATE_PROJECT,
    projectId: context?.project?.uuid,
  });

export const userHasProjectPermission = (permission) => (state) => {
  const user = state?.workspace?.user;
  const projectId = state?.workspace?.project?.uuid;

  return hasPermission(user, {
    projectId,
    permission,
  });
};

export const projectKindOptions = (): Partial<
  Record<KindEnum, { value: KindEnum; label; color; component }>
> => {
  const baseOptions = {
    default: {
      value: 'default' as KindEnum,
      label: translate('Regular'),
      color: 'default',
      component: null,
    },
    course: {
      value: 'course' as KindEnum,
      label: translate('Course'),
      color: 'warning',
      component: GraduationCapIcon,
    },
  };

  if (isExperimentalUiComponentsVisible()) {
    return {
      ...baseOptions,
      public: {
        value: 'public' as KindEnum,
        label: translate('Public'),
        color: 'blue',
        component: GlobeSimpleIcon,
      },
    };
  }

  return baseOptions;
};

// Temporary API function to fetch project grace period data
// This will be replaced once waldur-js-client is regenerated with grace period fields
export interface ProjectGraceData {
  end_date: string | null;
  grace_period_days: number | null;
  end_date_with_grace: string | null;
  is_expired: boolean;
  is_in_grace_period: boolean;
}

export async function getProjectGraceData(
  projectUuid: string,
): Promise<ProjectGraceData> {
  const response = await projectsRetrieve({
    path: {
      uuid: projectUuid,
    },
  });

  // The API returns the full project, but we only need the grace period fields
  // Cast to any to access fields that aren't yet in the generated types
  const data = response.data as any;

  return {
    end_date: data.end_date || null,
    grace_period_days: data.grace_period_days || null,
    end_date_with_grace: data.end_date_with_grace || null,
    is_expired: data.is_expired || false,
    is_in_grace_period: data.is_in_grace_period || false,
  };
}

// Helper function to check if a project is currently in its grace period
export function isProjectInGracePeriod(graceData: ProjectGraceData): boolean {
  // Use the computed field from the backend API
  return graceData.is_in_grace_period;
}

// Hook to fetch and check project grace period status
export function useProjectGraceStatus(project: Project) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ProjectGraceData', project?.uuid],
    queryFn: () => (project ? getProjectGraceData(project.uuid) : null),
    staleTime: 5 * 60 * 1000,
  });

  const isInGracePeriod = useMemo(() => {
    if (!data) return false;
    return isProjectInGracePeriod(data);
  }, [data]);

  return {
    graceData: data,
    isInGracePeriod,
    isLoading,
    error,
    refetch,
  };
};
