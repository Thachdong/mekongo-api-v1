import { UseFilters, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsCurrentUser } from '@shared/websocket/ws-current-user.decorator';
import { WsJwtGuard } from '@shared/websocket/ws-jwt.guard';
import { verifyWsToken } from '@shared/websocket/ws-auth.util';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { ICommentPresencePort } from '../../application/ports/comment-presence.interface';
import { JoinPostCommentsDto } from './dto/join-post-comments.dto';
import { WsDomainExceptionFilter } from './ws-domain-exception.filter';

function postCommentsRoomKey(postId: string): string {
  return `post:${postId}`;
}

@UseGuards(WsJwtGuard)
@UseFilters(WsDomainExceptionFilter)
@WebSocketGateway({ namespace: '/comments' })
export class CommentGateway
  implements OnGatewayConnection, OnGatewayDisconnect, ICommentPresencePort
{
  @WebSocketServer()
  private readonly _server: Server;

  private readonly _viewersByProfileId = new Map<string, Set<string>>();

  constructor(private readonly _jwtService: JwtService) {}

  handleConnection(client: Socket): void {
    try {
      client.data.user = verifyWsToken(client, this._jwtService);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const profileId = (client.data.user as TJwtPayload | undefined)?.profileId;

    if (profileId) {
      this._viewersByProfileId.delete(profileId);
    }
  }

  @SubscribeMessage('joinPostComments')
  async handleJoinPostComments(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: JoinPostCommentsDto,
    @WsCurrentUser() user: TJwtPayload,
  ): Promise<void> {
    await client.join(postCommentsRoomKey(body.postId));

    const profileId = user.profileId as string;
    const viewedPostIds =
      this._viewersByProfileId.get(profileId) ?? new Set<string>();
    viewedPostIds.add(body.postId);
    this._viewersByProfileId.set(profileId, viewedPostIds);
  }

  @SubscribeMessage('leavePostComments')
  async handleLeavePostComments(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: JoinPostCommentsDto,
    @WsCurrentUser() user: TJwtPayload,
  ): Promise<void> {
    await client.leave(postCommentsRoomKey(body.postId));

    const profileId = user.profileId as string;
    this._viewersByProfileId.get(profileId)?.delete(body.postId);
  }

  broadcastNewComment(postId: string, payload: object): void {
    this._server.to(postCommentsRoomKey(postId)).emit('newComment', payload);
  }

  isViewingPost(postId: string, profileId: string): boolean {
    return this._viewersByProfileId.get(profileId)?.has(postId) ?? false;
  }
}
