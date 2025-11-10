import { Vemetric } from '../src';

const vemetricClient = new Vemetric({ token: 'o1rySsGlUtFCyflo', host: 'http://localhost:4004' });

vemetricClient.trackEvent('NodeEvent', {
  userIdentifier: 'dmmIrnzUzVMJD03tjCiHXTEEgX6xIPJm',
  eventData: {
    my: 'nice',
  },
  userData: {
    set: { sdk: 'node' },
  },
});

vemetricClient.updateUser({
  userIdentifier: 'dmmIrnzUzVMJD03tjCiHXTEEgX6xIPJm',
  userAvatarUrl: 'https://pbs.twimg.com/profile_images/1921561946073018368/lxQVivth_400x400.jpg',
  userData: {
    set: { sdk2: 'node2' },
  },
});

console.log('events sent ✅');
