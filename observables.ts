import * as Discord from 'discord.js';
import { Observable, Observer } from 'rxjs';
import { from } from 'rxjs';

export const client = new Discord.Client();

export const readyObservable = (): Observable<boolean> =>
  Observable.create((observer: Observer<boolean>) => {
    client.on('ready', (): void => observer.next(true));
  }).publish().refCount();

export const unseenLoginObservable = (roleEvent: string): Observable<Discord.GuildMember> =>
  Observable.create((observer: Observer<Discord.GuildMember>) => {
    client.on(roleEvent, (member: Discord.GuildMember): void => observer.next(member))
  });

export const sendMessageObservable = (message: string, channel: Discord.TextChannel): Observable<boolean> =>
  Observable.create((observer: Observer<boolean>) => {
    channel.send(message)
  });

export const addRoleObservable = (role: string, member: Discord.GuildMember): Observable<Discord.GuildMember> =>
  from(member.addRole(role));

export const channelMessageReceivedObservable  = (): Observable<Discord.Message> =>
  Observable.create((observer: Observer<Discord.Message>) => {
    client.on('message', (message) => observer.next(message));
  })
