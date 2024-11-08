import {
  Dependants,
  EducationLevel,
  IndustrySector,
  InvestedInstruments,
  InvestmentDuration,
  InvestmentGoals,
  InvestmentRanges,
  MarketExperience,
  PoliticallyExposed,
  PositionHeld,
  SourceOfFunds,
  SourceOfInfo,
  TradeFrequency,
  UsaResident,
} from '@/shared/commonProjectParts';

export const politicallyExposedMap = {
  [PoliticallyExposed.NoNotLinked]: 'politicallyExposed.noNotLinked',
  [PoliticallyExposed.YesLinked]: 'politicallyExposed.yesLinked',
};

export const usaResidentMap = {
  [UsaResident.No]: 'usaResident.no',
  [UsaResident.Yes]: 'usaResident.yes',
};

export const marketExperienceMap = {
  [MarketExperience.MoreThanFiveYears]: 'marketExperience.moreThanFiveYears',
  [MarketExperience.TwoToFiveYears]: 'marketExperience.twoToFiveYears',
  [MarketExperience.LessThanTwoYears]: 'marketExperience.lessThanTwoYears',
  [MarketExperience.NoExperience]: 'marketExperience.noExperience',
};

export const investedInstrumentsMap = {
  [InvestedInstruments.StocksBonds]: 'investedInstruments.stocksBonds',
  [InvestedInstruments.OptionsFutures]: 'investedInstruments.optionsFutures',
  [InvestedInstruments.AllTypes]: 'investedInstruments.allTypes',
  [InvestedInstruments.NotDecided]: 'investedInstruments.notDecided',
};

export const educationLevelMap = {
  [EducationLevel.SecondarySchool]: 'educationLevel.secondarySchool',
  [EducationLevel.HighSchool]: 'educationLevel.highSchool',
  [EducationLevel.Professional]: 'educationLevel.professional',
  [EducationLevel.Academic]: 'educationLevel.academic',
};

export const investmentGoalsMap = {
  [InvestmentGoals.CapitalSaving]: 'investmentGoals.capitalSaving',
  [InvestmentGoals.CapitalGain]: 'investmentGoals.capitalGain',
  [InvestmentGoals.ActiveTrading]: 'investmentGoals.activeTrading',
  [InvestmentGoals.NotDecided]: 'investmentGoals.notDecided',
};

export const investmentDurationMap = {
  [InvestmentDuration.DayTrading]: 'investmentDuration.dayTrading',
  [InvestmentDuration.LessThanAYear]: 'investmentDuration.lessThanAYear',
  [InvestmentDuration.MoreThanAYear]: 'investmentDuration.moreThanAYear',
};

export const tradeFrequencyMap = {
  [TradeFrequency.OneToFifty]: 'tradeFrequency.oneToFifty',
  [TradeFrequency.FiftyToOneHundred]: 'tradeFrequency.fiftyToOneHundred',
  [TradeFrequency.MoreThanOneHundred]: 'tradeFrequency.moreThanOneHundred',
};

export const investmentRangesMap = {
  [InvestmentRanges.LessThan25K]: 'investmentRanges.lessThan25K',
  [InvestmentRanges.Range25K100K]: 'investmentRanges.range25K100K',
  [InvestmentRanges.Range100K300K]: 'investmentRanges.range100K300K',
  [InvestmentRanges.Range300K1M]: 'investmentRanges.range300K1M',
  [InvestmentRanges.Range1M10M]: 'investmentRanges.range1M10M',
  [InvestmentRanges.Range10M30M]: 'investmentRanges.range10M30M',
};

export const sourceOfFundsMap = {
  [SourceOfFunds.Wage]: 'sourceOfFunds.wage',
  [SourceOfFunds.Savings]: 'sourceOfFunds.savings',
  [SourceOfFunds.Inheritance]: 'sourceOfFunds.inheritance',
  [SourceOfFunds.Investments]: 'sourceOfFunds.investments',
};

export const industrySectorMap = {
  [IndustrySector.Construction]: 'industrySector.construction',
  [IndustrySector.Financials]: 'industrySector.financials',
  [IndustrySector.CasinoBettingLottery]: 'industrySector.casinoBettingLottery',
  [IndustrySector.LargeCashTurnoverBusiness]:
    'industrySector.largeCashTurnoverBusiness',
  [IndustrySector.NonProfit]: 'industrySector.nonProfit',
  [IndustrySector.WeaponsDefence]: 'industrySector.weaponsDefence',
  [IndustrySector.FundBroker]: 'industrySector.fundBroker',
  [IndustrySector.NotOneOfAbove]: 'industrySector.notOneOfAbove',
};

export const positionHeldMap = {
  [PositionHeld.KeyStaff]: 'positionHeld.keyStaff',
  [PositionHeld.MiddleLink]: 'positionHeld.middleLink',
  [PositionHeld.Student]: 'positionHeld.student',
  [PositionHeld.SelfEmployed]: 'positionHeld.selfEmployed',
  [PositionHeld.Unemployed]: 'positionHeld.unemployed',
};

export const dependantsMap = {
  [Dependants.None]: 'dependants.none',
  [Dependants.One]: 'dependants.one',
  [Dependants.TwoOrMore]: 'dependants.twoOrMore',
};

export const sourceOfInfoMap = {
  [SourceOfInfo.FromOnlineAdvertisements]:
    'sourceOfInfo.fromOnlineAdvertisements',
  [SourceOfInfo.FromSocialMedia]: 'sourceOfInfo.fromSocialMedia',
  [SourceOfInfo.FromOutdoorAdvertisements]:
    'sourceOfInfo.fromOutdoorAdvertisements',
  [SourceOfInfo.FromPersonalAdvertisementAdvisor]:
    'sourceOfInfo.fromPersonalAdvertisementAdvisor',
  [SourceOfInfo.FromSupportDepartment]: 'sourceOfInfo.fromSupportDepartment',
  [SourceOfInfo.FromEmailNewsletters]: 'sourceOfInfo.fromEmailNewsletters',
  [SourceOfInfo.FromFriends]: 'sourceOfInfo.fromFriends',
  [SourceOfInfo.IDoNotRemember]: 'sourceOfInfo.iDoNotRemember',
};
