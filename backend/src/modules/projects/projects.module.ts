import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { RubricsController, ProjectRubricController } from './rubrics.controller';
import { RubricsService } from './rubrics.service';

@Module({
  controllers: [ProjectsController, RubricsController, ProjectRubricController],
  providers: [ProjectsService, RubricsService],
  exports: [ProjectsService, RubricsService],
})
export class ProjectsModule {}
