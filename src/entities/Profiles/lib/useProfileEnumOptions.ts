import { MessageKeys, useTranslations } from 'next-intl';
import { Messages } from '@/shared/i18n';
import {
  dependantsMap,
  educationLevelMap,
  industrySectorMap,
  investedInstrumentsMap,
  investmentDurationMap,
  investmentGoalsMap,
  investmentRangesMap,
  marketExperienceMap,
  politicallyExposedMap,
  positionHeldMap,
  sourceOfFundsMap,
  sourceOfInfoMap,
  tradeFrequencyMap,
  usaResidentMap,
} from './profileEnumMaps';

export const useProfileEnumOptions = () => {
  const t = useTranslations('enums');

  const getOptions = <T extends Record<string, string>>(enumMap: T) => {
    return (Object.keys(enumMap) as Array<keyof T>).map((key) => ({
      id: key,
      label: t(enumMap[key] as MessageKeys<Messages, 'enums'>),
    }));
  };

  return {
    getPoliticallyExposedOptions: () => getOptions(politicallyExposedMap),
    getUsaResidentOptions: () => getOptions(usaResidentMap),
    getMarketExperienceOptions: () => getOptions(marketExperienceMap),
    getInvestedInstrumentsOptions: () => getOptions(investedInstrumentsMap),
    getEducationLevelOptions: () => getOptions(educationLevelMap),
    getInvestmentGoalsOptions: () => getOptions(investmentGoalsMap),
    getInvestmentDurationOptions: () => getOptions(investmentDurationMap),
    getTradeFrequencyOptions: () => getOptions(tradeFrequencyMap),
    getInvestmentRangesOptions: () => getOptions(investmentRangesMap),
    getSourceOfFundsOptions: () => getOptions(sourceOfFundsMap),
    getIndustrySectorOptions: () => getOptions(industrySectorMap),
    getPositionHeldOptions: () => getOptions(positionHeldMap),
    getDependantsOptions: () => getOptions(dependantsMap),
    getSourceOfInfoOptions: () => getOptions(sourceOfInfoMap),
  };
};
