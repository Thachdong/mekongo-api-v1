export interface INotificationRealtimePort {
  notify(profileId: string, payload: object): void;
}
