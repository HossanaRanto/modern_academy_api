import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type {
  INoteRepository,
} from '../ports/note-repository.port';
import { NOTE_REPOSITORY } from '../ports/note-repository.port';
import { UpdateNoteDto } from '../../infrastructure/dtos/update-note.dto';

@Injectable()
export class UpdateNoteUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: INoteRepository,
  ) {}

  async execute(id: string, request: UpdateNoteDto, userId: string) {
    const note = await this.noteRepository.findById(id);

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    // Validate score if being updated
    if (request.score !== undefined) {
      const maxScore = request.maxScore || note.maxScore;
      if (request.score > maxScore) {
        throw new ForbiddenException(
          `Score (${request.score}) cannot exceed max score (${maxScore})`,
        );
      }
    }

    Object.assign(note, {
      ...request,
      enteredBy: userId,
      enteredAt: new Date(),
    });

    return this.noteRepository.save(note);
  }
}
