import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { SessionsModule } from '../sessions/sessions.module';
import { QuestionsModule } from '../questions/questions.module';
import { ResponsesModule } from '../responses/responses.module';

@Module({
  imports: [SessionsModule, QuestionsModule, ResponsesModule],
  providers: [EventsGateway],
})
export class EventsModule {}

