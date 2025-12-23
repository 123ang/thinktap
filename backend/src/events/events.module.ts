import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { SessionsModule } from '../sessions/sessions.module';
import { QuestionsModule } from '../questions/questions.module';
import { ResponsesModule } from '../responses/responses.module';
import { SessionStateModule } from '../session-state/session-state.module';

@Module({
  imports: [
    SessionsModule,
    QuestionsModule,
    ResponsesModule,
    SessionStateModule,
  ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
