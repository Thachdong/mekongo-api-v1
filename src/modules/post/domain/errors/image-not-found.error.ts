import { DomainError } from '@shared/kernel/errors/domain-error';

export class ImageNotFoundError extends DomainError {
  constructor() {
    super('IMAGE_NOT_FOUND', 404, 'Ảnh không tồn tại trong bài đăng');
  }
}
