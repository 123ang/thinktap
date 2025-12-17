import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /analytics/dashboard
   * Get dashboard statistics for the authenticated lecturer
   */
  @Get('dashboard')
  async getDashboardStats(@Request() req: any) {
    return this.analyticsService.getDashboardStats(req.user.id);
  }

  /**
   * GET /analytics/sessions/:sessionId
   * Get comprehensive insights for a specific session
   */
  @Get('sessions/:sessionId')
  async getSessionInsights(
    @Param('sessionId') sessionId: string,
    @Request() req: any,
  ) {
    return this.analyticsService.getSessionInsights(sessionId, req.user.id);
  }

  /**
   * GET /analytics/sessions/:sessionId/leaderboard
   * Get Rush Mode leaderboard for a session
   */
  @Get('sessions/:sessionId/leaderboard')
  async getLeaderboard(
    @Param('sessionId') sessionId: string,
  ) {
    return this.analyticsService.calculateRushLeaderboard(sessionId);
  }

  /**
   * GET /analytics/sessions/:sessionId/engagement
   * Get participant engagement metrics for a session
   */
  @Get('sessions/:sessionId/engagement')
  async getParticipantEngagement(
    @Param('sessionId') sessionId: string,
  ) {
    return this.analyticsService.calculateParticipantEngagement(sessionId, false);
  }

  /**
   * GET /analytics/sessions/:sessionId/anonymous
   * Get anonymous statistics for Seminar Mode sessions
   */
  @Get('sessions/:sessionId/anonymous')
  async getAnonymousStats(
    @Param('sessionId') sessionId: string,
  ) {
    return this.analyticsService.calculateAnonymousStats(sessionId);
  }

  /**
   * GET /analytics/questions/:questionId
   * Get analytics for a specific question
   */
  @Get('questions/:questionId')
  async getQuestionAnalytics(
    @Param('questionId') questionId: string,
    @Request() req: any,
  ) {
    return this.analyticsService.getQuestionAnalytics(questionId, req.user.id);
  }
}
