import { Module } from '@nestjs/common';
import { ResponsesController, QuestionResponsesController } from './responses.controller';
import { ResponsesService } from './responses.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ResponsesController, QuestionResponsesController],
  providers: [ResponsesService],
  exports: [ResponsesService],
})
export class ResponsesModule {}

