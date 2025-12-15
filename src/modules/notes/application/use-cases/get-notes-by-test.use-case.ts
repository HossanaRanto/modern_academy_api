import { Injectable, Inject } from '@nestjs/common';
import type {
  INoteRepository,
} from '../ports/note-repository.port';
import { NOTE_REPOSITORY } from '../ports/note-repository.port';

@Injectable()
export class GetNotesByTestUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: INoteRepository,
  ) {}

  async execute(testId: string, courseId?: string) {
    if (courseId) {
      return this.noteRepository.findByTestAndCourse(testId, courseId);
    }
    return this.noteRepository.findByTest(testId);
  }
}
