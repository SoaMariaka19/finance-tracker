import { ConflictException, NotFoundException } from '@nestjs/common';

export class CategoryNotFoundException extends NotFoundException {
    constructor(categoryId: string) {
        super(`Category ${categoryId} not found`);
    }
}

export class CategoryNameAlreadyExistsException extends ConflictException {
    constructor(name: string) {
        super(`A category named "${name}" already exists`);
    }
}