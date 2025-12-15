import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type {
  INoteRepository,
} from '../ports/note-repository.port';
import { NOTE_REPOSITORY } from '../ports/note-repository.port';

@Injectable()
export class DeleteNoteUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: INoteRepository,
  ) {}

  async execute(id: string) {
    const note = await this.noteRepository.findById(id);

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    await this.noteRepository.delete(id);

    return { message: 'Note deleted successfully' };
  }
}
