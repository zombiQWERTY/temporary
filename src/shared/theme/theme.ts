'use client';

import { createTheme } from '@mui/material';

import { breakpoints } from './breakpoints';
import { createColorTheme } from './colorTheme';
import {
  typographyCustomTheme,
  buttonCustomTheme,
  svgIconTheme,
  radioTheme,
  checkboxTheme,
  labelTheme,
  helperTextTheme,
  inputBaseTheme,
  selectTheme,
  menuItemTheme,
  listTheme,
  inputTheme,
  iconButtonTheme,
  tabsTheme,
  tabTheme,
  linkTheme,
  formControlLabelTheme,
  paperTheme,
  stepIconTheme,
  stepLabelTheme,
  stepConnectorTheme,
  chipTheme,
  dialogActionsTheme,
  listItemIconTheme,
  listItemButtonTheme,
  listItemTextTheme,
  linearProgressTheme,
  muiTooltipTheme,
  stepButtonTheme,
  stepTheme,
  tableCellTheme,
  tableRowTheme,
  accordionTheme,
  accordionSummaryTheme,
  accordionDetailsTheme,
} from './components';

import { fontFamily } from './fontTheme';

export const createMuiTheme = () => {
  const colorTheme = createColorTheme();

  return createTheme({
    palette: colorTheme,
    typography: {
      allVariants: {
        fontFamily,
      },
      ...typographyCustomTheme,
    },
    spacing: 4,
    shape: {
      borderRadius: 8,
    },
    transitions: {},
    breakpoints,
    components: {
      // @ts-expect-error @TODO: resolve typing issue
      MuiLoadingButton: buttonCustomTheme,
      MuiButton: buttonCustomTheme,
      MuiSvgIcon: svgIconTheme,
      MuiFormHelperText: helperTextTheme,
      MuiInputBase: inputBaseTheme,
      MuiInputLabel: labelTheme,
      MuiRadio: radioTheme,
      MuiCheckbox: checkboxTheme,
      MuiSelect: selectTheme,
      MuiList: listTheme,
      MuiMenuItem: menuItemTheme,
      MuiListItemIcon: listItemIconTheme,
      MuiListItemButton: listItemButtonTheme,
      MuiListItemText: listItemTextTheme,
      MuiIconButton: iconButtonTheme,
      MuiInput: inputTheme,
      MuiTabs: tabsTheme,
      MuiTab: tabTheme,
      MuiLink: linkTheme,
      MuiFormControlLabel: formControlLabelTheme,
      MuiPaper: paperTheme,
      MuiStepButton: stepButtonTheme,
      MuiStepIcon: stepIconTheme,
      MuiStepLabel: stepLabelTheme,
      MuiStep: stepTheme,
      MuiStepConnector: stepConnectorTheme,
      MuiChip: chipTheme,
      MuiDialogActions: dialogActionsTheme,
      MuiLinearProgress: linearProgressTheme,
      MuiTooltip: muiTooltipTheme,
      MuiTableCell: tableCellTheme,
      MuiTableRow: tableRowTheme,
      MuiAccordion: accordionTheme,
      MuiAccordionSummary: accordionSummaryTheme,
      MuiAccordionDetails: accordionDetailsTheme,
    },
  });
};
