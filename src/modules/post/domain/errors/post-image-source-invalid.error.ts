import { DomainError } from '@shared/kernel/errors/domain-error';

export class PostImageSourceInvalidError extends DomainError {
  constructor() {
    super(
      'POST_IMAGE_SOURCE_INVALID',
      404,
      'Ảnh tải lên không hợp lệ hoặc đã hết hạn',
    );
  }
}
