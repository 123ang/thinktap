import { Module } from '@nestjs/common';
import { SessionStateService } from './session-state.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [SessionStateService],
  exports: [SessionStateService],
})
export class SessionStateModule {}
