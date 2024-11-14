import MatomoTracker from '@jonkoops/matomo-tracker';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

import { initAuthToken } from './auth/interceptor';
import { ENV } from './configs/default';
import { LanguageUtilsService } from './i18n/LanguageUtilsService';
import { attachTransitions } from './transitions';

function initSentry() {
  if (ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_DSN) {
    const { hostname } = new URL(ENV.apiEndpoint);
    Sentry.init({
      release: `waldur-homeport@${ENV.buildId}`,
      dsn: ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_DSN,
      integrations: [
        new BrowserTracing({
          tracePropagationTargets: [hostname, /^\//],
        }),
      ],
      environment:
        ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_ENVIRONMENT || 'unknown',
      tracesSampleRate:
        ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_TRACES_SAMPLE_RATE || 0.2,
    });
  }
}

function initCssVariables() {
  if (ENV.plugins.WALDUR_CORE.BRAND_COLOR) {
    document.documentElement.style.setProperty(
      '--waldur-aside-bg-color',
      ENV.plugins.WALDUR_CORE.BRAND_COLOR,
    );
  }
}

export let MatomoInstance: MatomoTracker = null;

export function afterBootstrap() {
  document.title = ENV.plugins.WALDUR_CORE.FULL_PAGE_TITLE;
  if (
    ENV.plugins.WALDUR_CORE.MATOMO_URL_BASE &&
    ENV.plugins.WALDUR_CORE.MATOMO_SITE_ID
  )
    MatomoInstance = new MatomoTracker({
      urlBase: ENV.plugins.WALDUR_CORE.MATOMO_URL_BASE,
      siteId: ENV.plugins.WALDUR_CORE.MATOMO_SITE_ID,
    });
  initSentry();
  initAuthToken();
  LanguageUtilsService.checkLanguage();
  attachTransitions();
  initCssVariables();
}
