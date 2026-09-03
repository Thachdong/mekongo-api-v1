import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ITransactionManager } from '../../application/ports/transaction-manager.interface';
import { transactionContext } from './transaction-context';

@Injectable()
export class TypeOrmCommentTransactionManager implements ITransactionManager {
  constructor(private readonly _dataSource: DataSource) {}

  runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this._dataSource.transaction((manager) =>
      transactionContext.run(manager, work),
    );
  }
}
