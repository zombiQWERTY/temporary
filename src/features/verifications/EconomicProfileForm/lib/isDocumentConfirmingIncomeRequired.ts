import { InvestmentRanges, PositionHeld } from '@/shared/commonProjectParts';

type IsDocumentConfirmingIncomeRequiredProps = (props: {
  totalAssetValue: InvestmentRanges;
  annualIncome: InvestmentRanges;
  expectedTurnover: InvestmentRanges;
  positionHeld: PositionHeld;
}) => boolean;

export const isDocumentConfirmingIncomeRequired: IsDocumentConfirmingIncomeRequiredProps =
  ({ totalAssetValue, annualIncome, expectedTurnover, positionHeld }) => {
    if (
      !totalAssetValue ||
      !annualIncome ||
      !expectedTurnover ||
      !positionHeld
    ) {
      return false;
    }

    const totalAssetValueMore25K =
      totalAssetValue !== InvestmentRanges.LessThan25K;
    const annualIncomeMore25K = annualIncome !== InvestmentRanges.LessThan25K;
    const expectedTurnoverMore25K =
      expectedTurnover !== InvestmentRanges.LessThan25K;

    const investmentsMore25K =
      totalAssetValueMore25K || annualIncomeMore25K || expectedTurnoverMore25K;

    const isPositionHeldMatch =
      positionHeld === PositionHeld.Student ||
      positionHeld === PositionHeld.Unemployed ||
      positionHeld === PositionHeld.SelfEmployed;

    return investmentsMore25K || isPositionHeldMatch;
  };
