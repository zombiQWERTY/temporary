export enum OperationSubTypeEnum {
  ExternalDeposit = 'ExternalDeposit', // Пополнение с внешнего счета
  ExternalWithdrawal = 'ExternalWithdrawal', // Вывод на внешний счет
  InternalTransfer = 'InternalTransfer', // Перевод между своими счетами
  InternalChange = 'InternalChange', // Обмен валют между своими счетами
  ServiceInternalTransfer = 'ServiceInternalTransfer', // Внутренний перевод для обслуживания (например, комиссии, возвраты)
  PeerToPeerTransfer = 'PeerToPeerTransfer', // Перевод на счет другому человеку внутри системы
  TransferToStrategy = 'TransferToStrategy', // Перевод на счет стратегии ДУ (инвестирование)
  TransferFromStrategy = 'TransferFromStrategy', // Перевод со счета стратегии (вывод с ДУ)
}

export enum OperationTypeEnum {
  Deposit = 'Deposit', // Пополнение
  Withdrawal = 'Withdrawal', // Вывод
}

export enum OperationStatusEnum {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
}
