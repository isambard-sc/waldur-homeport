import {
  ArrowRightIcon,
  BookOpenIcon,
  EnvelopeIcon,
  LifebuoyIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { IdentityProvider } from 'waldur-js-client';

import { getIdentityProviders } from '@/administration/api';
import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { formatJsx, translate } from '@/i18n';
import { useThemeFeatures } from '@/theme/useThemeFeatures';

import { getHeroBackgroundImage } from '../../heroImage';
import { IdentityProviderSelector } from '../../IdentityProviderSelector';
import { LocalLoginButton, LocalLoginForm } from '../../LocalLogin';
import { OauthLoginButton } from '../../OauthLoginButton';
import { PoweredBy } from '../../PoweredBy';
import { useAuthFeatures } from '../../useAuthFeatures';
import { getOauthURL } from '../../utils';

import { LoginNotices } from './LoginNotices';

import './BricsLayout.css';

/**
 * The one login button. It is labelled here rather than from the identity
 * provider's name, so the provider can keep its real name in the admin.
 */
const BricsLoginButton = ({
  provider,
}: {
  provider: Pick<IdentityProvider, 'provider'>;
}) => (
  <button
    type="button"
    className="brics-login-button"
    onClick={() => {
      window.location.href = getOauthURL(provider);
    }}
  >
    <span>{translate('Log in')}</span>
    <ArrowRightIcon weight="bold" aria-hidden />
  </button>
);

/**
 * Login methods: the first identity provider gets the BriCS button. Should
 * more ever be configured, the rest are offered underneath in the usual way,
 * so none goes missing. With no identity provider at all, as on a local
 * development site, the local login form is the only way in, so it is shown
 * straight away rather than behind a link.
 */
const LoginOptions = () => {
  const features = useAuthFeatures();
  const themeFeatures = useThemeFeatures();
  const [localLogin, setLocalLogin] = useState(false);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProvidersConfigurations'],
    queryFn: () => getIdentityProviders(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <LoadingErred
        message={translate('Unable to load identity providers.')}
        loadData={refetch}
      />
    );
  }

  const [primary, ...others] = data ?? [];
  const offerLocalLogin =
    features.SigninForm && themeFeatures.ShowLocalSigninForm;
  const offerOtherMethods =
    features.saml2 ||
    features.saml2providers ||
    features.saml2discovery ||
    features.valimo ||
    features.passkey;

  if (offerLocalLogin && !primary && !offerOtherMethods) {
    return <LocalLoginForm />;
  }
  if (localLogin) {
    return <LocalLoginForm onBack={() => setLocalLogin(false)} />;
  }
  if (!primary && !offerOtherMethods) {
    return (
      <p className="brics-no-login">
        {translate('Logging in is not available at the moment.')}
      </p>
    );
  }

  return (
    <div className="brics-login-options">
      {primary && <BricsLoginButton provider={primary} />}
      {others.map((provider) => (
        <OauthLoginButton key={provider.provider} provider={provider} />
      ))}
      <IdentityProviderSelector features={features} providers={[]} />
      {offerLocalLogin && (
        <LocalLoginButton onClick={() => setLocalLogin(true)} />
      )}
    </div>
  );
};

/**
 * The terms notice, broken after "agreeing to the" so the two links sit
 * together on a line of their own rather than wherever the text wraps.
 */
const BricsTerms = () => (
  <p className="brics-terms">
    {translate('By authenticating you are agreeing to the')}
    <br />
    {translate(
      '<tos>Terms of Service</tos> and <pp>Privacy policy</pp>.',
      {
        tos: (s: string) => <Link state="about.tos" label={s} />,
        pp: (s: string) => <Link state="about.privacy" label={s} />,
      },
      formatJsx,
    )}
  </p>
);

const QuickLink = ({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) => (
  <a className="brics-quick-link" href={href} target="_blank" rel="noreferrer">
    {icon}
    <span>{children}</span>
  </a>
);

/** Docs, support and contact, from the existing settings; each only if set. */
const QuickLinks = () => {
  const { DOCS_URL, SUPPORT_PORTAL_URL, SITE_EMAIL } = ENV.plugins.WALDUR_CORE;
  if (!DOCS_URL && !SUPPORT_PORTAL_URL && !SITE_EMAIL) {
    return null;
  }
  return (
    <nav className="brics-quick-links" aria-label={translate('Useful links')}>
      {DOCS_URL && (
        <QuickLink href={DOCS_URL} icon={<BookOpenIcon weight="bold" />}>
          {translate('Documentation')}
        </QuickLink>
      )}
      {SUPPORT_PORTAL_URL && (
        <QuickLink
          href={SUPPORT_PORTAL_URL}
          icon={<LifebuoyIcon weight="bold" />}
        >
          {translate('Support')}
        </QuickLink>
      )}
      {SITE_EMAIL && (
        <QuickLink
          href={`mailto:${SITE_EMAIL}`}
          icon={<EnvelopeIcon weight="bold" />}
        >
          {translate('Contact us')}
        </QuickLink>
      )}
    </nav>
  );
};

/**
 * BriCS login page: the digital brain behind a navy wash, the site's message,
 * links and current notices on one side and a frosted login card on the
 * other. Deliberately without the language and theme controls, which this
 * deployment does not want on the login page; the page has its own palette.
 */
export const BricsLayout = () => {
  const { SITE_DESCRIPTION, HERO_LINK_URL, HERO_LINK_LABEL, SHORT_PAGE_TITLE } =
    ENV.plugins.WALDUR_CORE;

  return (
    <div
      className="layout-brics"
      style={{ backgroundImage: getHeroBackgroundImage() }}
    >
      <main className="brics-grid">
        <div className="brics-card">
          <img
            className="brics-logo"
            alt={SHORT_PAGE_TITLE}
            src={getIconUrl('login_logo')}
          />
          <LoginOptions />
          <BricsTerms />
          <PoweredBy />
        </div>

        <div className="brics-hero">
          {SITE_DESCRIPTION && <h1>{SITE_DESCRIPTION}</h1>}
          {HERO_LINK_URL && (
            <a className="brics-hero-link" href={HERO_LINK_URL}>
              {HERO_LINK_LABEL || translate('Learn more')}
              <ArrowRightIcon weight="bold" aria-hidden />
            </a>
          )}
          <QuickLinks />
          <LoginNotices />
        </div>
      </main>
    </div>
  );
};
