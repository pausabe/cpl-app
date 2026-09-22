import SoulKeys from './soulKeys';
import { LiturgySpecificDayInformation, NoIdentifierNumber, SpecialCelebration } from '../models/LiturgyDayInformation';
import { Settings } from '../models/Settings';
import { DioceseCode } from './databaseEnums';
import * as CelebrationIdentifier from './celebrationIdentifierService';
import { Celebration } from './celebrationIdentifierService';
import { SpecificLiturgyTimeType } from './celebrationTimeEnums';
import { DateManagement } from '../utils/DateManagement';

export function obtainSpecialCelebration(
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): SpecialCelebration {
  let specialCelebration = new SpecialCelebration();
  if (liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
    return specialCelebration;
  }

  specialCelebration.specialDaysMasterIdentifier = obtainSpecialDaysMasterIdentifier(liturgyDayInformation, settings);
  specialCelebration.solemnityAndFestivityMasterIdentifier =
    obtainSolemnityAndFestivityMasterIdentifier(liturgyDayInformation);
  specialCelebration.strongTimesMasterIdentifier = obtainStrongTimesMasterIdentifier(liturgyDayInformation);

  return specialCelebration;
}

function obtainSpecialDaysMasterIdentifier(
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): number {
  const date = liturgyDayInformation.date;
  const specificLiturgyTime = liturgyDayInformation.specificLiturgyTime;
  const week = liturgyDayInformation.week;
  const dioceseCode = settings.dioceseCode;

  //1- Holy Family when it is 30 December
  if (
    CelebrationIdentifier.checkCelebration(Celebration.SacredFamily, liturgyDayInformation) &&
    date.getDate() === 30
  ) {
    return SoulKeys.diesespecials_SagradaFamilia30Desembre;
  }

  //2- Mother of God (1 January) when it falls on a Sunday
  if (CelebrationIdentifier.checkCelebration(Celebration.MatherOfGod, liturgyDayInformation) && date.getDay() === 0) {
    return SoulKeys.diesespecials_DiumengeMaredeDeu1Gener;
  }

  const secondSundayAferChristmas = CelebrationIdentifier.getSecondSundayAfterChristmas(date);
  const todayIsSecondSundayAferChristmas = DateManagement.datesAreTheEqual(date, secondSundayAferChristmas);

  //3- Second Sunday of Christmas, when it falls on 2 January
  if (todayIsSecondSundayAferChristmas && date.getDate() === 2) {
    return SoulKeys.diesespecials_DiumengeIINadal2Gener;
  }

  //4- Second Sunday of Christmas, when it falls on 3 January
  if (todayIsSecondSundayAferChristmas && date.getDate() === 3) {
    return SoulKeys.diesespecials_DiumengeIINadal3Gener;
  }

  //5- Second Sunday of Christmas, when it falls on 4 January
  if (todayIsSecondSundayAferChristmas && date.getDate() === 4) {
    return SoulKeys.diesespecials_DiumengeIINadal4Gener;
  }

  //6- Second Sunday of Christmas, when it falls on 5 January
  if (todayIsSecondSundayAferChristmas && date.getDate() === 5) {
    return SoulKeys.diesespecials_DiumengeIINadal5Gener;
  }

  //7- Baptism of the Lord when it is 7 January
  if (CelebrationIdentifier.checkCelebration(Celebration.Baptism, liturgyDayInformation) && date.getDate() === 7) {
    return SoulKeys.diesespecials_BaptismeSenyor7Gener;
  }

  //8- Presentation of the Lord (2 February) when it falls on a Sunday
  if (
    CelebrationIdentifier.checkCelebration(Celebration.LordPresentation, liturgyDayInformation) &&
    date.getDay() === 0
  ) {
    return SoulKeys.diesespecials_DiumengePresentacioSenyor2febrer;
  }

  //9- Transfiguration of the Lord (6 August) when it falls on a Sunday
  if (
    CelebrationIdentifier.checkCelebration(Celebration.LordTransfiguration, liturgyDayInformation) &&
    date.getDay() === 0
  ) {
    return SoulKeys.diesespecials_DiumengeTransfiguracioSenyor6;
  }

  //10- Exaltation of the Holy Cross (14 September) when it falls on a Sunday
  if (
    CelebrationIdentifier.checkCelebration(Celebration.ExaltationHolyCross, liturgyDayInformation) &&
    date.getDay() === 0
  ) {
    return SoulKeys.diesespecials_DiumengeExaltacioSantaCreu14Setembre;
  }

  //11- Dedic. of Saint John Lateran (9 November) when it falls on a Sunday
  if (
    CelebrationIdentifier.checkCelebration(Celebration.DedicationSantJoanLatera, liturgyDayInformation) &&
    date.getDay() === 0
  ) {
    return SoulKeys.diesespecials_DiumengeDedicacioSantJoanLatera9Novembre;
  }

  //12- Saint Eulalia (12 February) when it falls on a Sunday and it is ordinary time
  if (
    CelebrationIdentifier.checkCelebration(Celebration.SaintEulalia, liturgyDayInformation) &&
    date.getDay() === 0 &&
    specificLiturgyTime === SpecificLiturgyTimeType.Ordinary &&
    (dioceseCode === DioceseCode.BaV || dioceseCode === DioceseCode.BaC)
  ) {
    return SoulKeys.diesespecials_DiumengeTempsDurantAnySantaEulalia12Febrer;
  }

  //13- Saint John (24 June) when it falls on a Sunday
  if (CelebrationIdentifier.checkCelebration(Celebration.SaintJohn, liturgyDayInformation) && date.getDay() === 0) {
    return SoulKeys.diesespecials_DiumengeSantJoan24Juny;
  }

  //14- Saints Peter and Paul (29 June) when it falls on a Sunday
  if (
    CelebrationIdentifier.checkCelebration(Celebration.SaintsPereAndPau, liturgyDayInformation) &&
    date.getDay() === 0
  ) {
    return SoulKeys.diesespecials_DiumengeSantsPerePau29Juny;
  }

  //15- Saint James (25 July) when it falls on a Sunday
  if (CelebrationIdentifier.checkCelebration(Celebration.SaintJames, liturgyDayInformation) && date.getDay() === 0) {
    return SoulKeys.diesespecials_DiumengeSantJaume25Juliol;
  }

  //16- Assumption of Mary (15 August) when it falls on a Sunday
  if (CelebrationIdentifier.checkCelebration(Celebration.Assumption, liturgyDayInformation) && date.getDay() === 0) {
    return SoulKeys.diesespecials_DiumengeAssumpcioMaria15Agost;
  }

  //17- St Tecla (23 September) when it falls on a Sunday
  if (
    CelebrationIdentifier.checkCelebration(Celebration.SaintTecla, liturgyDayInformation) &&
    (dioceseCode === DioceseCode.TaV || dioceseCode === DioceseCode.TaD) &&
    date.getDay() === 0
  ) {
    return SoulKeys.diesespecials_DiumengeSantaTecla23Setembre;
  }

  //18- Mother of God of la Mercè (24 September) when it falls on a Sunday
  const currentDioceseDisplayMatherOfGodOfMerce =
    dioceseCode === DioceseCode.BaD ||
    dioceseCode === DioceseCode.SFD ||
    dioceseCode === DioceseCode.TeD ||
    dioceseCode === DioceseCode.GiD ||
    dioceseCode === DioceseCode.LlD ||
    dioceseCode === DioceseCode.SoD ||
    dioceseCode === DioceseCode.TaD ||
    dioceseCode === DioceseCode.ToD ||
    dioceseCode === DioceseCode.UrD ||
    dioceseCode === DioceseCode.ViD;
  if (
    CelebrationIdentifier.checkCelebration(Celebration.MatherOfGodOfMerce, liturgyDayInformation) &&
    date.getDay() === 0 &&
    currentDioceseDisplayMatherOfGodOfMerce
  ) {
    return SoulKeys.diesespecials_DiumengeMareDeuMerce24Setembre;
  }

  //19- All Saints (1 November) when it falls on a Sunday
  if (CelebrationIdentifier.checkCelebration(Celebration.AllSaints, liturgyDayInformation) && date.getDay() === 0) {
    return SoulKeys.diesespecials_DiumengeTotsSants1Novembre;
  }

  //20- Fourth Sunday of Advent, day 18
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs &&
    week === '4' &&
    date.getDate() === 18 &&
    date.getDay() === 0
  ) {
    return SoulKeys.diesespecials_DiumengeIVAdvent18;
  }

  //21- Fourth Sunday of Advent, day 19
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs &&
    week === '4' &&
    date.getDate() === 19 &&
    date.getDay() === 0
  ) {
    return SoulKeys.diesespecials_DiumengeIVAdvent19;
  }

  //22- Fourth Sunday of Advent, day 20
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs &&
    week === '4' &&
    date.getDate() === 20 &&
    date.getDay() === 0
  ) {
    return SoulKeys.diesespecials_DiumengeIVAdvent20;
  }

  //23- Fourth Sunday of Advent, day 21
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs &&
    week === '4' &&
    date.getDate() === 21 &&
    date.getDay() === 0
  ) {
    return SoulKeys.diesespecials_DiumengeIVAdvent21;
  }

  //24- Fourth Sunday of Advent, day 22
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs &&
    week === '4' &&
    date.getDate() === 22 &&
    date.getDay() === 0
  ) {
    return SoulKeys.diesespecials_DiumengeIVAdvent22;
  }

  //25- Fourth Sunday of Advent, day 23
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs &&
    week === '4' &&
    date.getDate() === 23 &&
    date.getDay() === 0
  ) {
    return SoulKeys.diesespecials_DiumengeIVAdvent23;
  }

  //26- Fourth Sunday of Advent, day 24
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs &&
    week === '4' &&
    date.getDate() === 24 &&
    date.getDay() === 0
  ) {
    return SoulKeys.diesespecials_DiumengeIVAdvent24;
  }

  //27- Third Sunday of Advent, when it is a weekday
  if (specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs && week === '3' && date.getDay() === 0) {
    return SoulKeys.diesespecials_DiumengeIIIAdventFeria;
  }

  //28- When 24 December (weekday) falls on a Monday
  if (date.getMonth() === 11 && date.getDate() === 24 && date.getDay() === 1) {
    return SoulKeys.diesespecials_24DesembreDilluns;
  }

  //29- When 24 December (weekday) falls on a Tuesday
  if (date.getMonth() === 11 && date.getDate() === 24 && date.getDay() === 2) {
    return SoulKeys.diesespecials_24DesembreDimarts;
  }

  //30- When 24 December (weekday) falls on a Wednesday
  if (date.getMonth() === 11 && date.getDate() === 24 && date.getDay() === 3) {
    return SoulKeys.diesespecials_24DesembreDimecres;
  }

  //31- When 24 December (weekday) falls on a Thursday
  if (date.getMonth() === 11 && date.getDate() === 24 && date.getDay() === 4) {
    return SoulKeys.diesespecials_24DesembreDijous;
  }

  //32- When 24 December (weekday) falls on a Friday
  if (date.getMonth() === 11 && date.getDate() === 24 && date.getDay() === 5) {
    return SoulKeys.diesespecials_24DesembreDivendres;
  }

  //33- When 24 December (weekday) falls on a Saturday
  if (date.getMonth() === 11 && date.getDate() === 24 && date.getDay() === 6) {
    return SoulKeys.diesespecials_24DesembreDissabte;
  }

  //34- Commemoration of All the Faithful Departed (2 November) when it falls on a Sunday
  if (date.getMonth() === 10 && date.getDate() === 2 && date.getDay() === 0) {
    return SoulKeys.diesespecials_CommemoracioTotsFidelsDifunts;
  }

  return NoIdentifierNumber;
}

function obtainSolemnityAndFestivityMasterIdentifier(liturgyDayInformation: LiturgySpecificDayInformation): number {
  //1- Christmas
  if (CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation)) {
    return SoulKeys.tempsSolemnitatsFestes_Nadal;
  }

  //2- Holy Family
  if (CelebrationIdentifier.checkCelebration(Celebration.SacredFamily, liturgyDayInformation)) {
    return SoulKeys.tempsSolemnitatsFestes_SagradaFamilia;
  }

  //3- Mother of God
  if (CelebrationIdentifier.checkCelebration(Celebration.MatherOfGod, liturgyDayInformation)) {
    return SoulKeys.tempsSolemnitatsFestes_MareDeu;
  }

  //4- Epiphany
  if (CelebrationIdentifier.checkCelebration(Celebration.Epiphany, liturgyDayInformation)) {
    return SoulKeys.tempsSolemnitatsFestes_Epifania;
  }

  //5- Baptism
  if (CelebrationIdentifier.checkCelebration(Celebration.Baptism, liturgyDayInformation)) {
    return SoulKeys.tempsSolemnitatsFestes_Baptisme;
  }

  //6- Ascension
  if (CelebrationIdentifier.checkCelebration(Celebration.Ascension, liturgyDayInformation)) {
    return SoulKeys.tempsSolemnitatsFestes_Ascensio;
  }

  //7- Pentecost Sunday
  if (CelebrationIdentifier.checkCelebration(Celebration.Pentecost, liturgyDayInformation)) {
    return SoulKeys.tempsSolemnitatsFestes_DiumengePentacosta;
  }

  //8- Most Holy Trinity
  if (CelebrationIdentifier.checkCelebration(Celebration.HolyTrinity, liturgyDayInformation)) {
    return SoulKeys.tempsSolemnitatsFestes_SantissimaTrinitat;
  }

  //9- Most Holy Body and Blood of Christ
  if (CelebrationIdentifier.checkCelebration(Celebration.BodyAndBlood, liturgyDayInformation)) {
    return SoulKeys.tempsSolemnitatsFestes_SantissimCosSangCrist;
  }

  //10- Sacred Heart of Jesus
  if (CelebrationIdentifier.checkCelebration(Celebration.SacredHeartOfJesus, liturgyDayInformation)) {
    return SoulKeys.tempsSolemnitatsFestes_SagratCorJesus;
  }

  //11- Our Lord Jesus Christ
  if (CelebrationIdentifier.checkCelebration(Celebration.OurLordJesusChrist, liturgyDayInformation)) {
    return SoulKeys.tempsSolemnitatsFestes_NostreSenyorJesucrist;
  }

  return NoIdentifierNumber;
}

function obtainStrongTimesMasterIdentifier(liturgyDayInformation: LiturgySpecificDayInformation) {
  const date = liturgyDayInformation.date;
  const specificLiturgyTime = liturgyDayInformation.specificLiturgyTime;
  const week = liturgyDayInformation.week;

  //1- Saturday I of Advent
  if (specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks && week === '1' && date.getDay() === 6) {
    return SoulKeys.salteriComuOficiTF_DissabteIAdvent;
  }

  //2- Saturday II of Advent
  if (specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks && week === '2' && date.getDay() === 6) {
    return SoulKeys.salteriComuOficiTF_DissabteIIAdvent;
  }

  //3- Friday IV of Advent (if it is 23 December)
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks &&
    week === '4' &&
    date.getDate() === 23 &&
    date.getMonth() == 11 &&
    date.getDay() == 5
  ) {
    return SoulKeys.salteriComuOficiTF_DivendresIVAdvent23Desembre;
  }

  //4- Friday IV of Advent (if it is 24 December)
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks &&
    week === '4' &&
    date.getDate() === 24 &&
    date.getMonth() == 11 &&
    date.getDay() == 5
  ) {
    return SoulKeys.salteriComuOficiTF_DivendresIVAdvent24Desembre;
  }

  //5- Saturday IV of Advent (24 December)
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks &&
    week === '4' &&
    date.getDate() === 24 &&
    date.getMonth() == 11 &&
    date.getDay() == 6
  ) {
    return SoulKeys.salteriComuOficiTF_DissabteIVAdvent;
  }

  //6- Saturday I of Christmas (if it is 2 January)
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
    week === '1' &&
    date.getDate() === 2 &&
    date.getMonth() === 0 &&
    date.getDay() == 6
  ) {
    return SoulKeys.salteriComuOficiTF_DissabteINadal2Gener;
  }

  //7- Saturday I of Christmas (if it is 3 January)
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
    week === '1' &&
    date.getDate() === 3 &&
    date.getMonth() === 0 &&
    date.getDay() == 6
  ) {
    return SoulKeys.salteriComuOficiTF_DissabteINadal3Gener;
  }

  //8- Saturday I of Christmas (if it is 4 January)
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
    week === '1' &&
    date.getDate() === 4 &&
    date.getMonth() === 0 &&
    date.getDay() == 6
  ) {
    return SoulKeys.salteriComuOficiTF_DissabteINadal4Gener;
  }

  //9- Saturday I of Christmas (if it is 5 January)
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
    week === '1' &&
    date.getDate() === 5 &&
    date.getMonth() === 0 &&
    date.getDay() == 6
  ) {
    return SoulKeys.salteriComuOficiTF_DissabteINadal5Gener;
  }

  //10- Saturday II of Christmas (if it is 7 January)
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
    week === '2' &&
    date.getDate() === 7 &&
    date.getMonth() === 0 &&
    date.getDay() == 6
  ) {
    return SoulKeys.salteriComuOficiTF_DissabteIINadal7Gener;
  }

  //11- Saturday II of Christmas (if it is 8 January)
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
    week === '2' &&
    date.getDate() === 8 &&
    date.getMonth() === 0 &&
    date.getDay() == 6
  ) {
    return SoulKeys.salteriComuOficiTF_DissabteIINadal8Gener;
  }

  //12- Saturday II of Christmas (if it is 9 January)
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
    week === '2' &&
    date.getDate() === 9 &&
    date.getMonth() === 0 &&
    date.getDay() == 6
  ) {
    return SoulKeys.salteriComuOficiTF_DissabteIINadal9Gener;
  }

  //13- Saturday II of Christmas (if it is 10 January)
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
    week === '2' &&
    date.getDate() === 10 &&
    date.getMonth() === 0 &&
    date.getDay() == 6
  ) {
    return SoulKeys.salteriComuOficiTF_DissabteIINadal10Gener;
  }

  //14- Saturday II of Christmas (if it is 11 January)
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
    week === '2' &&
    date.getDate() === 11 &&
    date.getMonth() === 0 &&
    date.getDay() == 6
  ) {
    return SoulKeys.salteriComuOficiTF_DissabteIINadal11Gener;
  }

  //15- Saturday II of Christmas (if it is 12 January)
  if (
    specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
    week === '2' &&
    date.getDate() === 12 &&
    date.getMonth() === 0 &&
    date.getDay() == 6
  ) {
    return SoulKeys.salteriComuOficiTF_DissabteIINadal12Gener;
  }

  //16- Friday after Ash Wednesday, Lent
  if (specificLiturgyTime === SpecificLiturgyTimeType.LentAshes && date.getDay() === 5) {
    return SoulKeys.salteriComuOficiTF_DivendresDespresCendraQuaresma;
  }

  //17- Saturday after Ash Wednesday, Lent
  if (specificLiturgyTime === SpecificLiturgyTimeType.LentAshes && date.getDay() === 6) {
    return SoulKeys.salteriComuOficiTF_DissabteDespresCendraQuaresma;
  }

  //18- Saturday I of Lent
  if (specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks && week === '1' && date.getDay() === 6) {
    return SoulKeys.salteriComuOficiTF_DissabteIQuaresma;
  }

  //19- Saturday II of Lent
  if (specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks && week === '2' && date.getDay() === 6) {
    return SoulKeys.salteriComuOficiTF_DissabteIIQuaresma;
  }

  //20- Friday IV of Lent
  if (specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks && week === '4' && date.getDay() === 5) {
    return SoulKeys.salteriComuOficiTF_DivendresIVQuaresma;
  }

  //21- Saturday IV of Lent
  if (specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks && week === '4' && date.getDay() === 6) {
    return SoulKeys.salteriComuOficiTF_DissabteIVQuaresma;
  }

  //22- Saturday V of Lent
  if (specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks && week === '5' && date.getDay() === 6) {
    return SoulKeys.salteriComuOficiTF_DissabteVQuaresma;
  }

  //23- Saturday II of Easter
  if (specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks && week === '2' && date.getDay() === 6) {
    return SoulKeys.salteriComuOficiTF_DissabteIIPasqua;
  }

  //24- Friday IV of Easter
  if (specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks && week === '4' && date.getDay() === 5) {
    return SoulKeys.salteriComuOficiTF_DivendresIVPasqua;
  }

  //25- Saturday IV of Easter
  if (specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks && week === '4' && date.getDay() === 6) {
    return SoulKeys.salteriComuOficiTF_issabteIVPasqua;
  }

  //26- Saturday V of Easter
  if (specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks && week === '5' && date.getDay() === 6) {
    return SoulKeys.salteriComuOficiTF_DissabteVPasqua;
  }

  //27- Saturday VI of Easter
  if (specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks && week === '6' && date.getDay() === 6) {
    return SoulKeys.salteriComuOficiTF_DissabteVIPasqua;
  }

  return NoIdentifierNumber;
}
