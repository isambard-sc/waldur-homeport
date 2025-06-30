
export const useThemeFeatures = () => {

  // We eventually need a way for the theme chosen to set these features.
  // They should be configured at a global level by the Waldur operators.

  // This option controls whether the MarketplaceTrigger is shown in the sidebar.
  // This is useful when Waldur is used as a marketplace, but not when it is
  // used to manage calls, or when the marketplace is not accessible to users.
  const ShowMarketplaceTrigger = false;

  // This option controls whether the AuthHeader is shown the login column.
  // This header is only useful if there are multiple login methods available,
  // and normally confuses users because it will say "You session has expired..."
  const ShowLoginAuthHeader = false;

  // This option controls whether or not to show the local login form
  const ShowLocalSigninForm = true;

  // This option controls whether the Footer items are shown on the login column.
  // These options link to marketplace, calls etc, and may need to be hidden
  // as they should only be visible after login
  const ShowLoginFooter = false;

  // This option controls whether or not the marketplace should be shown in the
  // sidebar. This may need to be turned off when Waldur is only used to
  // manage calls, or when the marketplace is not accessible to users.
  const ShowSidebarMarketplace = false;

  // This option controls whether the "rounds" tab should be shown on the
  // public calls page. This may need to be hidden when either a call has
  // a single round, or when the call manager does not want applicants
  // to see future rounds
  const ShowPublicCallRounds = false;

  // This option controls whether the "offerings" tab should be shown on the
  // public calls page. This may need to be hidden when either a call has
  // no offerings, or when the call manager does not want applicants
  // to see offerings
  const ShowPublicCallOfferings = false;

  // This option controls whether or not to show anything related to "limits"
  // in the project and customer dashboards. At the moment, limits confuse
  // users because they are aggregated acrosss all resources. As we set the
  // limit to the value of the remaining credits, it can look like the
  // project budget is N * remaining_credits, where N is the number
  // of resources deployed in a project.
  const ShowResourceLimits = false;

  return {
    ShowMarketplaceTrigger : ShowMarketplaceTrigger,
    ShowLoginAuthHeader: ShowLoginAuthHeader,
    ShowLocalSigninForm: ShowLocalSigninForm,
    ShowLoginFooter : ShowLoginFooter,
    ShowSidebarMarketplace: ShowSidebarMarketplace,
    ShowPublicCallRounds: ShowPublicCallRounds,
    ShowPublicCallOfferings: ShowPublicCallOfferings,
    ShowResourceLimits: ShowResourceLimits,
  };
};

export type ThemeFeatures = ReturnType<typeof useThemeFeatures>;
