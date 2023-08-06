const storageLabel: string = 'partyTime';
const body: HTMLBodyElement | null = document.querySelector('body');
const partyMode: HTMLButtonElement | null =
  document.querySelector('button.party-mode');
const currentParty: string | null = sessionStorage.getItem(storageLabel);
let isPartyTime: boolean = currentParty === 'true';

body?.setAttribute('data-party', isPartyTime);
partyMode?.setAttribute('data-active', isPartyTime);

partyMode?.addEventListener('click', () => {
  body?.setAttribute('data-party', !isPartyTime);
  partyMode?.setAttribute('data-active', !isPartyTime);
  sessionStorage.setItem(storageLabel, !isPartyTime);
  isPartyTime = !isPartyTime;
});
