import React, { ReactNode, useState } from 'react';
import { View } from 'react-native';
// A Text that on iOS can be selected by the piece, and a plain Text where it is not selectable
import Text from '../../components/PrayerText';
import HR from '../../components/HRComponent';
import Gap from '../../components/Gap';
import Rubric from '../../components/Rubric';
import SectionTitle from '../../components/SectionTitle';
import ChoiceChips from '../../components/ChoiceChips';
import ContinueButton from '../../components/ContinueButton';
import { PrayerTextStyles } from '../../theme';
import { SpecificLiturgyTimeType } from '../../services/celebrationTimeEnums';
import { StringManagement } from '../../utils/StringManagement';
import {
  Intercessions,
  canBeInvitatoryPsalm,
  canticleTitle,
  hasAlleluia,
  responsoryTogether,
  withoutPsalmMarks,
  withoutStraySpaces as rs,
} from '../../utils/prayerText';
import type Invitation from '../../models/hours-liturgy/Invitation';
import type { Psalm, ShortReading, ShortResponsory } from '../../models/liturgy-masters/CommonParts';
import type { Settings } from '../../models/Settings';
import type { DiesIraeChoice } from './specific-hour-liturgy/hourProps';

// The pieces the hours have in common.
//
// They are functions that give elements, not components, on purpose: PrayerFlow sews the texts
// that follow one another into one by looking at the elements it is handed (a Rubric, a Gap, a
// selectable text, a View that only holds things together), and a component of our own would be
// a closed box to it, where the selection would stop. What they give is exactly what each hour
// used to write out by hand.

const OPENING_GLORIA =
  'Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.';
const INVITATORY_GLORIA =
  'Glòria al Pare i al Fill    \ni a l’Esperit Sant.\nCom era al principi, ara i sempre    \ni pels segles dels segles. Amén.';

const HYMN_OPTIONS = [
  { value: 'dia', label: 'Himne del dia' },
  { value: 'dies-irae', label: 'Dies iræ' },
];

// Whether the hour says the Dies iræ: offered (DiesIraeService) and chosen
export function saysDiesIrae(diesIraeAnthem: string | undefined, diesIrae: DiesIraeChoice | undefined): boolean {
  return Boolean(diesIraeAnthem) && diesIrae?.chosen === true;
}

// The hymn of the hour. In the last week of Ordinary Time it may be the Dies iræ instead, «si es
// vol»: two chips to choose, as with the Marian antiphon of Compline.
export function hymn(
  styles: PrayerTextStyles,
  anthem: string,
  diesIraeAnthem: string | undefined,
  diesIrae: DiesIraeChoice | undefined,
) {
  if (!diesIraeAnthem || !diesIrae) {
    return (
      <Text selectable={true} style={styles.black}>
        {rs(anthem)}
      </Text>
    );
  }
  return (
    <View>
      <ChoiceChips
        accessibilityLabel="Himne"
        options={HYMN_OPTIONS}
        value={diesIrae.chosen ? 'dies-irae' : 'dia'}
        onChange={(value) => diesIrae.onChange(value === 'dies-irae')}
      />
      <Text selectable={true} style={styles.black}>
        {rs(diesIrae.chosen ? diesIraeAnthem : anthem)}
      </Text>
    </View>
  );
}

// The line between two parts of the hour, and the title of the next one
export function section(title: ReactNode, content: ReactNode) {
  return (
    <>
      <Gap />
      <HR />
      <Gap />
      <SectionTitle>{title}</SectionTitle>
      {content}
    </>
  );
}

// «Sigueu amb nosaltres, Déu nostre», and the Glòria, with the Al·leluia outside Lent
export function opening(styles: PrayerTextStyles, time: SpecificLiturgyTimeType) {
  return (
    <>
      <Rubric label={'V. '}>{'Sigueu amb nosaltres, Déu nostre.'}</Rubric>
      <Rubric label={'R. '}>{'Senyor, veniu a ajudar-nos.'}</Rubric>
      <Gap />
      <Text selectable={true} style={styles.black}>
        {OPENING_GLORIA}
        {hasAlleluia(time) ? (
          <Text selectable={true} style={styles.black}>
            {' Al·leluia.'}
          </Text>
        ) : null}
      </Text>
    </>
  );
}

// A psalm from its title to the Glòria. The comment under the title goes only when there is one
// (null); an empty text still takes its place and the space after it.
export function psalmBody(
  styles: PrayerTextStyles,
  {
    title,
    comment,
    psalm,
    hasGloryPrayer,
  }: { title: string; comment: string | null; psalm: string; hasGloryPrayer: boolean },
) {
  return (
    <>
      <Text selectable={true} style={styles.redCenter}>
        {title}
      </Text>
      <Gap />
      {comment !== null ? (
        <>
          <Text selectable={true} style={styles.blackSmallItalicRight}>
            {comment}
          </Text>
          <Gap />
        </>
      ) : null}
      <Text selectable={true} style={styles.black}>
        {withoutPsalmMarks(rs(psalm))}
      </Text>
      <Gap />
      {hasGloryPrayer ? (
        <Text selectable={true} style={styles.blackItalic}>
          {'Glòria.'}
        </Text>
      ) : (
        <Text selectable={true} style={styles.redItalic}>
          {"S'omet el Glòria."}
        </Text>
      )}
    </>
  );
}

// The comment of a psalm, or null when it has none
export function psalmComment(psalm: Psalm): string | null {
  return StringManagement.hasLiturgyContent(psalm.comment) ? rs(psalm.comment) : null;
}

// The three psalms of Lauds, Vespers and the Office of Readings, each between its antiphon. The
// second and the third can be canticles, whose reference goes on a line of its own.
export function psalmody(styles: PrayerTextStyles, psalms: Psalm[]) {
  return (
    <>
      {psalms.map((psalm, index) => {
        const antiphon = rs(psalm.antiphon);
        const label = `Ant. ${index + 1}.`;
        return (
          <React.Fragment key={index}>
            {index > 0 ? <Gap /> : null}
            <Rubric label={label}> {antiphon}</Rubric>
            <Gap />
            {psalmBody(styles, {
              title: index === 0 ? rs(psalm.title) : canticleTitle(rs(psalm.title)),
              comment: psalmComment(psalm),
              psalm: psalm.psalm,
              hasGloryPrayer: psalm.hasGloryPrayer,
            })}
            <Gap />
            <Rubric label={label}> {antiphon}</Rubric>
          </React.Fragment>
        );
      })}
    </>
  );
}

// A canticle, or a psalm said whole with its antiphon before and after it and the Glòria
export function antiphonedPsalm(styles: PrayerTextStyles, antiphon: string, title: string, text: ReactNode) {
  return (
    <>
      <Rubric label={'Ant. '}>{antiphon}</Rubric>
      <Gap />
      <Text selectable={true} style={styles.redCenter}>
        {title}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.black}>
        {text}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.blackItalic}>
        {'Glòria.'}
      </Text>
      <Gap />
      <Rubric label={'Ant. '}>{antiphon}</Rubric>
    </>
  );
}

export function shortReading(styles: PrayerTextStyles, reading: ShortReading) {
  return (
    <>
      <Text selectable={true} style={styles.red}>
        {rs(reading.quote)}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.black}>
        {rs(reading.shortReading)}
      </Text>
    </>
  );
}

const HALF_GLORIA = "Glòria al Pare i al Fill i a l'Esperit Sant.";

// The versicles of a short responsory, from its three parts and the first half of the Glòria
export function responsoryVersicles(responsory: ShortResponsory) {
  const firstAndSecondPart = responsoryTogether(rs(responsory.firstPart), rs(responsory.secondPart));
  return (
    <>
      <Rubric label={'V. '}>{firstAndSecondPart}</Rubric>
      <Rubric label={'R. '}>{firstAndSecondPart}</Rubric>
      <Gap />
      <Rubric label={'V. '}>{rs(responsory.thirdPart)}</Rubric>
      <Rubric label={'R. '}>{rs(responsory.secondPart)}</Rubric>
      <Gap />
      <Rubric label={'V. '}>{HALF_GLORIA}</Rubric>
      <Rubric label={'R. '}>{firstAndSecondPart}</Rubric>
    </>
  );
}

// The short responsory of Lauds and Vespers: its versicles, or the antiphon that takes their place
export function shortResponsory(responsory: ShortResponsory) {
  if (responsory.hasSpecialAntiphon) {
    return <Rubric label={'Ant.'}> {rs(responsory.specialAntiphon)}</Rubric>;
  }
  return responsoryVersicles(responsory);
}

export function intercessions(styles: PrayerTextStyles, prayers: Intercessions) {
  if (prayers.kind === 'text') {
    return (
      <Text selectable={true} style={styles.black}>
        {prayers.text}
      </Text>
    );
  }
  return (
    <>
      <Text selectable={true} style={styles.black}>
        {prayers.intro}
        {':'}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.blackItalic}>
        {prayers.response}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.black}>
        {prayers.intercessions}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.redItalic}>
        {'Aquí es poden afegir altres intencions.'}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.black}>
        {prayers.finalPart}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.blackItalic}>
        {'Pare nostre.'}
      </Text>
    </>
  );
}

// --- The invitatory, at the start of Lauds and of the Office of Readings -----------------------

const INVITATORY_PSALMS: { number: string; title: string; reference: string; text: (i: Invitation) => string }[] = [
  {
    number: '94',
    title: 'Salm 94\nInvitació a lloar Déu',
    reference: 'Mentre repetim aquell «avui», exhortem-nos cada dia els uns als altres (He 3, 13)',
    text: (invitation) => invitation.psalm94,
  },
  {
    number: '99',
    title: 'Salm 99\nInvitació a lloar Déu en el seu temple',
    reference: 'El Senyor vol que els redimits cantin himnes de victòria (St. Atanasi)',
    text: (invitation) => invitation.psalm99,
  },
  {
    number: '66',
    title: 'Salm 66\nInvitació als pobles a lloar Déu',
    reference: 'Sapigueu que el missatge de la salvació de Déu ha estat enviat a tots els pobles (Fets 28, 28)',
    text: (invitation) => invitation.psalm66,
  },
  {
    number: '23',
    title: 'Salm 23\nEntrada del Senyor al santuari',
    reference: "Les portes del cel s'obriren a Crist quan hi fou endut amb la seva humanitat (St. Ireneu)",
    text: (invitation) => invitation.psalm23,
  },
];

export interface InvitatoryState {
  shown: boolean;
  toggle: () => void;
  psalmNumber: string;
  choosePsalm: (psalmNumber: string) => void;
}

// Whether the invitatory is open, and its psalm: the one chosen last time, unless it is one of
// the psalms of the day. The choice is kept for the next time (onInvitationPsalmChange).
export function useInvitatory(
  settings: Settings,
  titles: string[],
  onInvitationPsalmChange: (psalmNumber: string) => void,
): InvitatoryState {
  const [shown, setShown] = useState(false);
  const [psalmNumber, setPsalmNumber] = useState(() => {
    if (canBeInvitatoryPsalm(settings.invitationPsalmOption, titles)) return settings.invitationPsalmOption;
    onInvitationPsalmChange('94');
    return '94';
  });
  return {
    shown,
    toggle: () => setShown((value) => !value),
    psalmNumber,
    choosePsalm: (number) => {
      setPsalmNumber(number);
      onInvitationPsalmChange(number);
    },
  };
}

function invitatoryButtons(invitatory: InvitatoryState) {
  return (
    <View>
      <ContinueButton
        label={(invitatory.shown ? 'Amagar' : 'Començar amb') + " l'invitatori"}
        onPress={invitatory.toggle}
      />
      {invitatory.shown ? (
        <View>
          <SectionTitle>{'INVITATORI'}</SectionTitle>
        </View>
      ) : null}
    </View>
  );
}

// The invitatory psalm, with the chooser of the four and the antiphon after every stanza
function invitatoryPsalm(
  styles: PrayerTextStyles,
  invitation: Invitation,
  titles: string[],
  invitatory: InvitatoryState,
) {
  const psalm = INVITATORY_PSALMS.find((p) => p.number === invitatory.psalmNumber);
  const stanzas = (psalm ? psalm.text(invitation) : '').split('\n\n');
  const antiphon = rs(invitation.invitationAntiphon);

  return (
    <View>
      <ChoiceChips
        accessibilityLabel="Salm de l'invitatori"
        options={INVITATORY_PSALMS.filter((p) => p.number === '94' || canBeInvitatoryPsalm(p.number, titles)).map(
          (p) => ({ value: p.number, label: `Salm ${p.number}` }),
        )}
        value={invitatory.psalmNumber}
        onChange={invitatory.choosePsalm}
      />

      <Rubric label={'Ant. '}>{antiphon}</Rubric>
      <Gap />
      <Text selectable={true} style={styles.redCenter}>
        {psalm ? psalm.title : ''}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.blackSmallItalicRight}>
        {psalm ? psalm.reference : ''}
      </Text>
      <Gap />
      {[0, 1, 2, 3].map((index) => (
        <React.Fragment key={index}>
          <Text selectable={true} style={styles.black}>
            {stanzas[index]}
          </Text>
          <Gap />
          <Rubric label={'Ant. '}>{antiphon}</Rubric>
          <Gap />
        </React.Fragment>
      ))}
      {stanzas.slice(4, 7).map((stanza, index) => (
        <View key={index}>
          <Text selectable={true} style={styles.black}>
            {stanza}
          </Text>
          <Gap />
          <Rubric label={'Ant. '}>{antiphon}</Rubric>
          <Gap />
        </View>
      ))}
      <Text selectable={true} style={styles.black}>
        {INVITATORY_GLORIA}
      </Text>
      <Gap />
      <Rubric label={'Ant. '}>{antiphon}</Rubric>
    </View>
  );
}

// The start of Lauds and of the Office of Readings: with the invitatory when it is asked for, or
// always (Lauds of Easter Sunday, with no button to hide it); otherwise the usual opening.
export function invitatoryOrOpening(
  styles: PrayerTextStyles,
  {
    time,
    invitation,
    titles,
    invitatory,
    alwaysInvitatory,
  }: {
    time: SpecificLiturgyTimeType;
    invitation: Invitation;
    titles: string[];
    invitatory: InvitatoryState;
    alwaysInvitatory: boolean;
  },
) {
  if (invitatory.shown || alwaysInvitatory) {
    return (
      <View>
        {alwaysInvitatory ? null : invitatoryButtons(invitatory)}
        <Rubric label={'V. '}>{'Obriu-me els llavis, Senyor.'}</Rubric>
        <Rubric label={'R. '}>{'I proclamaré la vostra lloança.'}</Rubric>
        <Gap />
        <HR />
        <Gap />
        {invitatoryPsalm(styles, invitation, titles, invitatory)}
      </View>
    );
  }
  return (
    <View>
      {invitatoryButtons(invitatory)}
      {opening(styles, time)}
    </View>
  );
}
