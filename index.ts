import { client, readyObservable, unseenLoginObservable, addRoleObservable, channelMessageReceivedObservable } from './observables';
import { from, throwError, Observable, of, empty } from 'rxjs';
import { take, switchMap, map } from 'rxjs/operators';
import * as Discord from 'discord.js';
import { writeFile } from 'fs';

interface commandRegister {
  command: string,
  callback: (message: Discord.Message, ...args: string[]) => Observable<any>
}

const updateRaidStatus = (message: Discord.Message, ...args: string[]) =>
  of(writeFile('./raidstatus.json', args.join(' '), () => message.reply( 'Raid status updated!' )));

export const commandRegistry: commandRegister[] = [
  { command: 'updateraidstatus', callback: updateRaidStatus }
]

export const login = readyObservable().pipe(
  take(1),
  switchMap(() =>
    from(client.login())
  )
).subscribe(
  () => console.log('logged in'),
  (err: any) => console.error(err),
  () => console.log('Login Stream Complete')
);

export const newArrival = unseenLoginObservable('guildMemberAdd').pipe(
  switchMap(member => {
    if (!member || !member.guild.channels.find('name', 'general')) throwError('Could not find channel');
    const channel: Discord.TextChannel = member.guild.channels.find('name', 'general') as Discord.TextChannel;
    return from(channel.send(`Welcome to the server, ${member}! Hop into the #introduce_yourself channel and let us know a little bit about you :)`))
      .pipe(
        map(() =>
          addRoleObservable('453792775326924801', member)
        )
      )
  })
);

export const commandHandler = channelMessageReceivedObservable().subscribe(
  (message: Discord.Message) => {
    if (message.content.substring(0, 1) !== '!') return empty;
    let callbackObservables: Observable<any>[] = [];

    commandRegistry.forEach(({ command, callback }) =>
      (command === message.content.substring(1, message.content.indexOf(" "))) ?
        callbackObservables.push(callback(message, ...message.content.substring(1, command.length).split(' '))) :
        undefined
    )

    if (callbackObservables.length === 0) return empty;

    return callbackObservables;
  },
  (error) => console.error(error),
  () => console.error('Message stream terminated...')
);
