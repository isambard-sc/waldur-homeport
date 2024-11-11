import { FunctionComponent, useState } from 'react';
import { Button, Card } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { useLanguageSelector } from '@waldur/i18n/useLanguageSelector';
import { CountryFlag } from '@waldur/marketplace/common/CountryFlag';
import { LanguageCountry } from '@waldur/navigation/header/LanguageSelectorDropdown';
import { useNotify } from '@waldur/store/hooks';

import { saveConfig } from '../settings/api';

export const AdministrationLanguages: FunctionComponent = () => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    ENV.plugins.WALDUR_CORE.LANGUAGE_CHOICES,
  );
  const { showError, showErrorResponse, showSuccess } = useNotify();
  const { currentLanguage } = useLanguageSelector();

  const handleLanguageChange = (code: string) => {
    setSelectedLanguages((prevSelectedLanguages: string | string[]) => {
      let selectedLanguagesArray = Array.isArray(prevSelectedLanguages)
        ? prevSelectedLanguages
        : prevSelectedLanguages.split(',');

      selectedLanguagesArray = selectedLanguagesArray.filter(
        (lang) => lang !== '',
      );
      const isCodeSelected = selectedLanguagesArray.includes(code);

      if (currentLanguage.code === code) {
        showError(translate('You cannot unselect the current UI language'));
        return selectedLanguagesArray;
      }

      if (ENV.defaultLanguage === code && isCodeSelected) {
        showError(translate('You cannot unselect the default language'));
        return selectedLanguagesArray;
      }

      if (isCodeSelected) {
        return selectedLanguagesArray.filter((lang) => lang !== code);
      } else {
        return [...selectedLanguagesArray, code];
      }
    });
  };

  const saveLanguageOptions = async () => {
    if (selectedLanguages.length === 0) {
      showError(
        translate('Please select at least one language to save changes'),
      );
    } else {
      try {
        const selectedLanguageCodes = selectedLanguages.join(',');
        await saveConfig({
          LANGUAGE_CHOICES: selectedLanguageCodes,
        });
        showSuccess(
          translate(
            'A list of languages available for selection has been updated',
          ),
        );
        location.reload();
      } catch (e) {
        showErrorResponse(
          e,
          translate('Unable to update languages available for selection'),
        );
      }
    }
  };

  return (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>{translate('Language options')}</Card.Title>
      </Card.Header>

      <Card.Body>
        <div>
          <div className="row" style={{ columnCount: 2, display: 'flow' }}>
            <div className="col-md-6">
              {ENV.languageChoices.map(
                (language: { code: string; label: string }) => (
                  <div key={language.code} className="mb-3">
                    <AwesomeCheckboxField
                      data-testid={`language_${language.code}`}
                      name={`language_${language.code}`}
                      input={
                        {
                          value: selectedLanguages.includes(language.code),
                          onChange: () => handleLanguageChange(language.code),
                        } as any
                      }
                      label={
                        <div className="d-flex align-items-center">
                          <div className="symbol symbol-20px me-2">
                            <CountryFlag
                              countryCode={LanguageCountry[language.code]}
                            />
                          </div>
                          {language.label}
                        </div>
                      }
                    />
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 text-end">
              <Button onClick={saveLanguageOptions}>{translate('Save')}</Button>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
